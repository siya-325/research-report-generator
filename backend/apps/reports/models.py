from django.db import models
from apps.papers.models import Paper
from django.conf import settings

class LiteratureReport(models.Model):
    """
    AI-generated literature review reports
    """

    # User who created this report
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,  # Temporary - allow null for existing reports
        blank=True
    )
    
    # Research topic
    topic = models.CharField(max_length=500)
    
    # Generated report content (Markdown format)
    report_content = models.TextField()
    
    # Metadata
    papers_analyzed = models.IntegerField(default=0)
    model_used = models.CharField(max_length=100, default='llama-3.3-70b-versatile')
    
    # Status tracking
    STATUS_CHOICES = [
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='completed'
    )
    
    # Error tracking
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Link to papers used
    papers = models.ManyToManyField(Paper, related_name='reports')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Report: {self.topic[:50]}... ({self.status})"