from django.contrib import admin
from .models import Paper


@admin.register(Paper)
class PaperAdmin(admin.ModelAdmin):
    list_display = ['title', 'source_api', 'published_date', 'citation_count', 'created_at']
    list_filter = ['source_api', 'published_date']
    search_fields = ['title', 'authors', 'abstract']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'authors', 'abstract', 'published_date')
        }),
        ('Source', {
            'fields': ('source_api', 'external_id', 'api_data')
        }),
        ('URLs', {
            'fields': ('pdf_url', 'external_url')
        }),
        ('Metadata', {
            'fields': ('citation_count', 'created_at', 'updated_at')
        }),
    )