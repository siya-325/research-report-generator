from rest_framework import serializers
from .models import TopicSubscription, SubscriptionUpdate


class TopicSubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for topic subscriptions
    """
    updates_count = serializers.SerializerMethodField()
    new_papers_since_last_check = serializers.SerializerMethodField()
    days_until_next_check = serializers.SerializerMethodField()
    
    class Meta:
        model = TopicSubscription
        fields = [
            'id',
            'topic',
            'max_papers',
            'sources',
            'email_notifications',
            'is_active',
            'last_checked_at',
            'papers_count_at_last_check',
            'updates_count',
            'new_papers_since_last_check',
            'days_until_next_check',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'last_checked_at', 'papers_count_at_last_check', 'created_at', 'updated_at']
    
    def get_updates_count(self, obj):
        return obj.updates.count()
    
    def get_new_papers_since_last_check(self, obj):
        latest_update = obj.updates.first()
        if latest_update:
            return latest_update.new_papers_count
        return 0
    
    def get_days_until_next_check(self, obj):
        if not obj.last_checked_at:
            return 0  # Will be checked soon
        
        from django.utils import timezone
        from datetime import timedelta
        
        next_check = obj.last_checked_at + timedelta(days=7)
        days_left = (next_check - timezone.now()).days
        return max(0, days_left)


class SubscriptionUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for subscription updates
    """
    topic = serializers.CharField(source='subscription.topic', read_only=True)
    
    class Meta:
        model = SubscriptionUpdate
        fields = [
            'id',
            'topic',
            'check_date',
            'new_papers_count',
            'new_papers',
            'report',
            'email_sent',
            'email_sent_at',
        ]


class CreateSubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for creating subscriptions
    """
    
    class Meta:
        model = TopicSubscription
        fields = [
            'topic',
            'max_papers',
            'sources',
            'email_notifications',
        ]