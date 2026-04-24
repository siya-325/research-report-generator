from django.db import models
from django.conf import settings
from apps.reports.models import LiteratureReport


class TopicSubscription(models.Model):
    """
    User subscription to research topics - weekly auto-updates
    """
    
    # User who subscribed
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    
    # Topic details
    topic = models.CharField(max_length=500)
    max_papers = models.IntegerField(default=20)
    
    # Source preferences
    sources = models.JSONField(
        default=list,
        blank=True,
        help_text="Preferred sources (arxiv, semantic_scholar, pubmed). Empty = all sources"
    )
    
    # Email notifications
    email_notifications = models.BooleanField(default=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Last check info
    last_checked_at = models.DateTimeField(null=True, blank=True)
    last_report = models.ForeignKey(
        LiteratureReport,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscription_updates'
    )
    papers_count_at_last_check = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'topic_subscriptions'
        unique_together = ['user', 'topic']  # One subscription per topic per user
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['last_checked_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.topic}"


class SubscriptionUpdate(models.Model):
    """
    Track weekly updates for each subscription
    """
    
    subscription = models.ForeignKey(
        TopicSubscription,
        on_delete=models.CASCADE,
        related_name='updates'
    )
    
    # Update details
    check_date = models.DateTimeField(auto_now_add=True)
    new_papers_count = models.IntegerField(default=0)
    new_papers = models.JSONField(default=list)  # List of paper IDs
    
    # Generated report
    report = models.ForeignKey(
        LiteratureReport,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Email notification
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'subscription_updates'
        ordering = ['-check_date']
        indexes = [
            models.Index(fields=['subscription', 'check_date']),
        ]
    
    def __str__(self):
        return f"{self.subscription.topic} - {self.check_date.date()} ({self.new_papers_count} new)"