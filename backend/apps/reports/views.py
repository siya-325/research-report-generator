from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from celery.result import AsyncResult 
from rest_framework.permissions import IsAuthenticated
from .models import LiteratureReport
from .serializers import (
    LiteratureReportSerializer, 
    ReportGenerateRequestSerializer
)
from .services import ReportGenerator
from .tasks import generate_literature_report_task

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_report_async(request):
    """
    Generate AI-powered literature review ASYNCHRONOUSLY
    
    Endpoint: POST /api/reports/generate-async/
    
    Request:
    {
        "topic": "Federated Learning in Healthcare",
        "max_papers": 20
    }
    
    Response (Immediate):
    {
        "status": "processing",
        "message": "Report generation started",
        "task_id": "abc123...",
        "topic": "Federated Learning in Healthcare"
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
    
    # Send task to Celery (async)
    task = generate_literature_report_task.delay(topic, max_papers, request.user.id)
    
    return Response({
        'status': 'processing',
        'message': 'Report generation started',
        'task_id': task.id,
        'topic': topic,
        'max_papers': max_papers
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['GET'])
def check_task_status(request, task_id):
    """
    Check status of async task
    
    Endpoint: GET /api/reports/status/<task_id>/
    
    Response:
    {
        "task_id": "abc123...",
        "state": "ANALYZING",
        "status": "Analyzing 20 papers with AI...",
        "progress": 40
    }
    """
    
    task = AsyncResult(task_id)
    
    response = {
        'task_id': task_id,
        'state': task.state,
    }
    
    if task.state == 'PENDING':
        response['status'] = 'Task is waiting to start...'
        response['progress'] = 0
    elif task.state == 'SEARCHING':
        response['status'] = task.info.get('status', 'Searching...')
        response['progress'] = task.info.get('progress', 10)
    elif task.state == 'ANALYZING':
        response['status'] = task.info.get('status', 'Analyzing...')
        response['progress'] = task.info.get('progress', 40)
    elif task.state == 'SAVING':
        response['status'] = task.info.get('status', 'Saving...')
        response['progress'] = task.info.get('progress', 80)
    elif task.state == 'SUCCESS':
        result = task.result
        response['status'] = 'Completed'
        response['progress'] = 100
        response['result'] = result
    elif task.state == 'FAILURE':
        response['status'] = str(task.info)
        response['progress'] = 0
        response['error'] = str(task.info)
    else:
        response['status'] = task.state
        response['progress'] = 0
    
    return Response(response)


@api_view(['GET'])
def get_report_result(request, task_id):
    """
    Get the completed report from a task
    
    Endpoint: GET /api/reports/result/<task_id>/
    
    Response:
    {
        "status": "success",
        "report": {...}
    }
    """
    
    task = AsyncResult(task_id)
    
    if task.state != 'SUCCESS':
        return Response({
            'status': 'error',
            'message': f'Task not completed yet. Current state: {task.state}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    result = task.result
    report_id = result.get('report_id')
    
    if not report_id:
        return Response({
            'status': 'error',
            'message': 'Report ID not found in task result'
        }, status=status.HTTP_404_NOT_FOUND)
    
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reports(request):
    """
    Get reports for the current user only
    
    Endpoint: GET /api/reports/my-reports/
    """
    
    reports = LiteratureReport.objects.filter(user=request.user).order_by('-created_at')[:20]
    serializer = LiteratureReportSerializer(reports, many=True)
    
    return Response({
        'status': 'success',
        'count': len(serializer.data),
        'reports': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
        
        # Save to database WITH USER ID
        report = LiteratureReport.objects.create(
            user=request.user,
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