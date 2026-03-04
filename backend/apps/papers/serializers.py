from rest_framework import serializers
from .models import Paper


class PaperSerializer(serializers.ModelSerializer):
    """
    Serializer for Paper model
    Converts Paper objects to/from JSON for API responses
    """
    
    class Meta:
        model = Paper
        fields = [
            'id',
            'title',
            'authors',
            'abstract',
            'published_date',
            'source_api',
            'external_id',
            'pdf_url',
            'external_url',
            'citation_count',
            'api_data',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaperSearchRequestSerializer(serializers.Serializer):
    """
    Validates incoming search requests
    Used by /api/papers/search/ endpoint
    """
    query = serializers.CharField(
        required=True,
        max_length=500,
        help_text="Search query (e.g., 'machine learning')"
    )
    max_results = serializers.IntegerField(
        default=10,
        min_value=1,
        max_value=100,
        help_text="Number of results to return (1-100)"
    )
    
    def validate_query(self, value):
        """Ensure query is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Query cannot be empty")
        return value.strip()


class ReportGenerateRequestSerializer(serializers.Serializer):
    """
    Validates report generation requests
    Used by /api/reports/generate/ endpoint (coming in Week 3)
    """
    topic = serializers.CharField(
        required=True,
        max_length=500,
        help_text="Research topic (e.g., 'Federated Learning in Healthcare')"
    )
    max_papers = serializers.IntegerField(
        default=20,
        min_value=5,
        max_value=50,
        help_text="Number of papers to analyze (5-50)"
    )
    
    def validate_topic(self, value):
        """Ensure topic is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Topic cannot be empty")
        return value.strip()