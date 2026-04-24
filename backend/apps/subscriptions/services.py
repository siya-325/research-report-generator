from datetime import timedelta
from django.utils import timezone
from django.db.models import Q

from .models import TopicSubscription, SubscriptionUpdate
from apps.papers.models import Paper
from apps.papers.services_unified import UnifiedSearchClient
from apps.reports.services import ReportGenerator
from apps.reports.models import LiteratureReport


class SubscriptionService:
    """
    Service for managing weekly topic subscriptions
    """
    
    def check_subscription_for_updates(self, subscription: TopicSubscription) -> dict:
        """
        Check a subscription for new papers and generate update report
        
        Returns:
            dict with keys: new_papers_count, new_papers, report
        """
        
        # Get current papers for this topic
        unified_client = UnifiedSearchClient()
        
        # Determine sources
        sources = subscription.sources if subscription.sources else None
        
        # Search for papers
        result = unified_client.search_and_save(
            query=subscription.topic,
            max_results=subscription.max_papers,
            sources=sources
        )
        
        current_papers = result['papers']
        current_paper_ids = [p.id for p in current_papers]
        
        # Determine new papers since last check
        if subscription.last_checked_at:
            # Papers created in database after last check
            new_papers = [
                p for p in current_papers
                if p.created_at > subscription.last_checked_at
            ]
        else:
            # First check - all papers are "new"
            new_papers = current_papers
        
        new_papers_count = len(new_papers)
        new_paper_ids = [p.id for p in new_papers]
        
        # Generate updated report if there are papers
        report = None
        if current_papers:
            generator = ReportGenerator()
            
            # Generate report highlighting new papers
            if new_papers_count > 0:
                report_text = self._generate_update_report(
                    subscription.topic,
                    current_papers,
                    new_papers
                )
            else:
                # No new papers, just regenerate standard report
                report_text = generator.generate_literature_review(
                    subscription.topic,
                    current_papers
                )
            
            # Save report
            report = LiteratureReport.objects.create(
                user=subscription.user,
                topic=subscription.topic,
                report_content=report_text,
                papers_analyzed=len(current_papers),
                status='completed'
            )
            report.papers.set(current_papers)
        
        # Create update record
        update = SubscriptionUpdate.objects.create(
            subscription=subscription,
            new_papers_count=new_papers_count,
            new_papers=new_paper_ids,
            report=report
        )
        
        # Update subscription
        subscription.last_checked_at = timezone.now()
        subscription.last_report = report
        subscription.papers_count_at_last_check = len(current_papers)
        subscription.save()
        
        return {
            'new_papers_count': new_papers_count,
            'new_papers': new_papers,
            'report': report,
            'update': update
        }
    
    def _generate_update_report(self, topic: str, all_papers: list, new_papers: list) -> str:
        """
        Generate report highlighting new papers
        """
        generator = ReportGenerator()
        
        # Build special prompt for updates
        new_papers_info = "\n".join([
            f"- {p.title} ({p.authors[:100]}...)" 
            for p in new_papers[:10]  # Show up to 10 new papers
        ])
        
        prompt = f"""Generate a weekly research update for the topic: {topic}

📊 WEEKLY UPDATE - {len(new_papers)} NEW PAPERS:
{new_papers_info}

TOTAL PAPERS ANALYZED: {len(all_papers)}

Please structure the report as follows:

## 📊 Weekly Update Summary
- Highlight the {len(new_papers)} new papers added this week
- Key findings from new research

## Overview
Comprehensive overview of all {len(all_papers)} papers

## Key Themes & Trends
Main research directions (emphasize new developments)

## Research Gaps
What's missing in current research

## Future Directions
Promising areas based on latest papers

Use markdown formatting with clear sections.
"""
        
        # Use Groq AI to generate
        response = generator.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert research analyst providing weekly literature review updates."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=4000,
            temperature=0.7,
        )
        
        return response.choices[0].message.content
    
    def check_subscriptions_due_this_week(self) -> list:
        """
        Check all subscriptions due for weekly update (>7 days since last check)
        
        Returns:
            List of update results
        """
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        
        # Find subscriptions due for checking
        due_subscriptions = TopicSubscription.objects.filter(
            is_active=True
        ).filter(
            Q(last_checked_at__isnull=True) |  # Never checked
            Q(last_checked_at__lt=seven_days_ago)  # Checked >7 days ago
        )
        
        results = []
        for subscription in due_subscriptions:
            try:
                result = self.check_subscription_for_updates(subscription)
                results.append({
                    'subscription': subscription,
                    'success': True,
                    'result': result
                })
            except Exception as e:
                results.append({
                    'subscription': subscription,
                    'success': False,
                    'error': str(e)
                })
        
        return results