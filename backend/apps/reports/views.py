from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import LiteratureReport
from .serializers import (
    LiteratureReportSerializer, 
    ReportGenerateRequestSerializer
)
from .services import ReportGenerator


@api_view(['POST'])
def generate_report(request):
    """
    Generate AI-powered literature review
    
    Endpoint: POST /api/reports/generate/
    
    Request:
    {
        "topic": "Federated Learning in Healthcare",
        "max_papers": 20
    }
    
    Response:
    {
        "status": "success",
        "message": "Report generated successfully",
        "report_id": 1,
        "topic": "Federated Learning in Healthcare",
        "papers_analyzed": 20,
        "report": "## Overview\n\n..."
    }
    """
    
    # Validate request
    request_serializer = ReportGenerateRequestSerializer(data=request.data)
    if not request_serializer.is_valid():
        return Response({
            'status': 'error',
            'errors': request_serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get validated data
    topic = request_serializer.validated_data['topic']
    max_papers = request_serializer.validated_data['max_papers']
    
    try:
        # Generate report
        generator = ReportGenerator()
        report_text, papers = generator.search_and_generate(
            topic=topic,
            max_papers=max_papers
        )
        
        # Save to database
        report = LiteratureReport.objects.create(
            topic=topic,
            report_content=report_text,
            papers_analyzed=len(papers),
            status='completed'
        )
        
        # Link papers to report
        report.papers.set(papers)
        
        # Serialize response
        serializer = LiteratureReportSerializer(report)
        
        return Response({
            'status': 'success',
            'message': f'Report generated successfully with {len(papers)} papers',
            'report_id': report.id,
            'topic': topic,
            'papers_analyzed': len(papers),
            'report': report_text,
            'full_report': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Save failed report
        report = LiteratureReport.objects.create(
            topic=topic,
            report_content="",
            papers_analyzed=0,
            status='failed',
            error_message=str(e)
        )
        
        return Response({
            'status': 'error',
            'message': f'Error generating report: {str(e)}',
            'report_id': report.id
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def list_reports(request):
    """
    List all generated reports
    
    Endpoint: GET /api/reports/
    """
    
    reports = LiteratureReport.objects.all()[:20]  # Latest 20
    serializer = LiteratureReportSerializer(reports, many=True)
    
    return Response({
        'status': 'success',
        'count': len(serializer.data),
        'reports': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_report(request, report_id):
    """
    Get a single report by ID
    
    Endpoint: GET /api/reports/<id>/
    """
    
    try:
        report = LiteratureReport.objects.get(id=report_id)
        serializer = LiteratureReportSerializer(report)
        
        return Response({
            'status': 'success',
            'report': serializer.data
        }, status=status.HTTP_200_OK)
        
    except LiteratureReport.DoesNotExist:
        return Response({
            'status': 'error',
            'message': f'Report with id {report_id} not found'
        }, status=status.HTTP_404_NOT_FOUND)