from django.contrib import admin
from .models import LiteratureReport


@admin.register(LiteratureReport)
class LiteratureReportAdmin(admin.ModelAdmin):
    list_display = ['topic', 'status', 'papers_analyzed', 'model_used', 'created_at']
    list_filter = ['status', 'model_used', 'created_at']
    search_fields = ['topic', 'report_content']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Report Information', {
            'fields': ('topic', 'status', 'report_content')
        }),
        ('Metadata', {
            'fields': ('papers_analyzed', 'model_used', 'papers')
        }),
        ('Error Information', {
            'fields': ('error_message',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )