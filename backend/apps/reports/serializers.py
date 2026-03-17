from rest_framework import serializers
from .models import LiteratureReport
from apps.papers.serializers import PaperSerializer


class LiteratureReportSerializer(serializers.ModelSerializer):
    """
    Serializer for LiteratureReport model
    """
    papers = PaperSerializer(many=True, read_only=True)
    
    class Meta:
        model = LiteratureReport
        fields = [
            'id',
            'topic',
            'report_content',
            'papers_analyzed',
            'model_used',
            'status',
            'error_message',
            'created_at',
            'updated_at',
            'papers',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReportGenerateRequestSerializer(serializers.Serializer):
    """
    Validates report generation requests
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