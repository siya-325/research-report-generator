from django.db import models
from django.utils import timezone


class Paper(models.Model):
    """
    Academic papers from various sources (arXiv, Semantic Scholar, PubMed)
    """
    # Basic info
    title = models.CharField(max_length=500)
    authors = models.TextField()  # Comma-separated for now
    abstract = models.TextField(blank=True)
    published_date = models.DateField(null=True, blank=True)
    
    # Source information
    source_api = models.CharField(max_length=50)  # "arxiv", "semantic_scholar", "pubmed"
    external_id = models.CharField(max_length=100)  # API-specific ID
    
    # Flexible API-specific data (JSONB for different schemas!)
    api_data = models.JSONField(default=dict)
    
    # URLs
    pdf_url = models.URLField(blank=True)
    external_url = models.URLField(blank=True)
    
    # Metadata
    citation_count = models.IntegerField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-published_date']
        unique_together = ['source_api', 'external_id']  # Prevent duplicates
        indexes = [
            models.Index(fields=['source_api', 'external_id']),
            models.Index(fields=['-published_date']),
        ]
    
    def __str__(self):
        return f"{self.title[:50]}... ({self.source_api})"