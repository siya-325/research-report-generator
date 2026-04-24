from celery import shared_task
from .models import LiteratureReport
from .services import ReportGenerator
from apps.papers.services_unified import UnifiedSearchClient


@shared_task(bind=True, name='generate_literature_report')
def generate_literature_report_task(self, topic: str, max_papers: int = 20, user_id: int = None):
    """
    Celery task to generate literature review asynchronously
    
    Args:
        self: Task instance
        topic: Research topic
        max_papers: Number of papers to analyze
        user_id: ID of user who requested the report
    """
    
    # Update task state to show progress
    self.update_state(
        state='SEARCHING',
        meta={'status': 'Searching for papers...', 'progress': 10}
    )
    
    try:
        # Step 1: Search for papers
        unified_client = UnifiedSearchClient()
        result = unified_client.search_and_save(topic, max_results=max_papers)
        
        saved_papers = result['papers']
        
        if not saved_papers:
            # No papers found - create failed report
            report = LiteratureReport.objects.create(
                user_id=user_id,
                topic=topic,
                report_content='',
                papers_analyzed=0,
                status='failed',
                error_message='No papers found for this topic.'
            )
            return {'status': 'failed', 'report_id': report.id, 'error': 'No papers found'}
        
        # Update progress
        self.update_state(
            state='ANALYZING',
            meta={'status': f'Analyzing {len(saved_papers)} papers with AI...', 'progress': 40}
        )
        
        # Step 2: Generate report with AI
        generator = ReportGenerator()
        report_text = generator.generate_literature_review(topic, saved_papers)
        
        # Update progress
        self.update_state(
            state='SAVING',
            meta={'status': 'Saving report...', 'progress': 80}
        )
        
        # Step 3: Save report to database
        report = LiteratureReport.objects.create(
            user_id=user_id,
            topic=topic,
            report_content=report_text,
            papers_analyzed=len(saved_papers),
            status='completed'
        )
        
        # Link papers to report
        report.papers.set(saved_papers)
        
        # Return result (don't update_state here - it overwrites the return!)
        return {
            'status': 'completed',
            'report_id': report.id,
            'papers_analyzed': len(saved_papers),
            'topic': topic
        }
        
    except Exception as e:
        # Handle errors
        report = LiteratureReport.objects.create(
            user_id=user_id,
            topic=topic,
            report_content='',
            papers_analyzed=0,
            status='failed',
            error_message=str(e)
        )
        
        # Update task state
        self.update_state(
            state='FAILURE',
            meta={'status': f'Error: {str(e)}', 'progress': 0}
        )
        
        return {
            'status': 'failed',
            'report_id': report.id,
            'error': str(e)
        }