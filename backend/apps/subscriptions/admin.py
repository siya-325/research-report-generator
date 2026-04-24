from django.contrib import admin
from .models import TopicSubscription, SubscriptionUpdate


@admin.register(TopicSubscription)
class TopicSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'topic', 'is_active', 'last_checked_at', 'papers_count_at_last_check', 'created_at']
    list_filter = ['is_active', 'email_notifications', 'created_at']
    search_fields = ['user__email', 'topic']
    readonly_fields = ['created_at', 'updated_at', 'last_checked_at', 'papers_count_at_last_check']
    
    fieldsets = (
        ('Subscription Info', {
            'fields': ('user', 'topic', 'is_active')
        }),
        ('Settings', {
            'fields': ('max_papers', 'sources', 'email_notifications')
        }),
        ('Status', {
            'fields': ('last_checked_at', 'last_report', 'papers_count_at_last_check')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(SubscriptionUpdate)
class SubscriptionUpdateAdmin(admin.ModelAdmin):
    list_display = ['subscription', 'check_date', 'new_papers_count', 'email_sent']
    list_filter = ['email_sent', 'check_date']
    search_fields = ['subscription__topic', 'subscription__user__email']
    readonly_fields = ['check_date', 'email_sent_at']