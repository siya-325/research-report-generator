from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    
    # Email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    # Preferences
    preferred_sources = models.JSONField(
        default=list,
        blank=True,
        help_text="Preferred paper sources (arxiv, semantic_scholar, pubmed)"
    )
    default_max_papers = models.IntegerField(default=20)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email