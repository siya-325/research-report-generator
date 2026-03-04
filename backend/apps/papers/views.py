from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Paper
from .serializers import PaperSerializer, PaperSearchRequestSerializer
from .services import ArxivAPIClient


@api_view(['POST'])
def search_papers(request):
    """
    Search for papers from arXiv and save to database
    
    Endpoint: POST /api/papers/search/
    
    Request body:
    {
        "query": "machine learning",
        "max_results": 10
    }
    
    Response:
    {
        "status": "success",
        "message": "Found 10 papers, saved 5 new papers",
        "query": "machine learning",
        "total_found": 10,
        "new_papers": 5,
        "existing_papers": 5,
        "papers": [
            {
                "id": 1,
                "title": "...",
                "authors": "...",
                ...
            }
        ]
    }
    """
    
    # Validate request
    request_serializer = PaperSearchRequestSerializer(data=request.data)
    if not request_serializer.is_valid():
        return Response({
            'status': 'error',
            'errors': request_serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get validated data
    query = request_serializer.validated_data['query']
    max_results = request_serializer.validated_data['max_results']
    
    try:
        # Search arXiv
        client = ArxivAPIClient()
        papers_data = client.search(query, max_results=max_results)
        
        if not papers_data:
            return Response({
                'status': 'success',
                'message': 'No papers found',
                'query': query,
                'total_found': 0,
                'new_papers': 0,
                'existing_papers': 0,
                'papers': []
            }, status=status.HTTP_200_OK)
        
        # Save papers to database
        saved_papers = []
        new_count = 0
        existing_count = 0
        
        for paper_data in papers_data:
            paper, created = Paper.objects.get_or_create(
                source_api=paper_data['source_api'],
                external_id=paper_data['external_id'],
                defaults=paper_data
            )
            
            saved_papers.append(paper)
            
            if created:
                new_count += 1
            else:
                existing_count += 1
        
        # Serialize papers for response
        serializer = PaperSerializer(saved_papers, many=True)
        
        return Response({
            'status': 'success',
            'message': f'Found {len(papers_data)} papers, saved {new_count} new papers',
            'query': query,
            'total_found': len(papers_data),
            'new_papers': new_count,
            'existing_papers': existing_count,
            'papers': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error searching papers: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def list_papers(request):
    """
    List papers in database (for debugging/testing)
    
    Endpoint: GET /api/papers/
    
    Query parameters:
    - source_api: Filter by source (e.g., 'arxiv')
    - limit: Number of papers (default: 20)
    """
    
    source_api = request.query_params.get('source_api')
    limit = int(request.query_params.get('limit', 20))
    
    queryset = Paper.objects.all()
    
    if source_api:
        queryset = queryset.filter(source_api=source_api)
    
    papers = queryset[:limit]
    serializer = PaperSerializer(papers, many=True)
    
    return Response({
        'status': 'success',
        'count': len(serializer.data),
        'papers': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_paper(request, paper_id):
    """
    Get a single paper by ID (for debugging/testing)
    
    Endpoint: GET /api/papers/<id>/
    """
    
    try:
        paper = Paper.objects.get(id=paper_id)
        serializer = PaperSerializer(paper)
        
        return Response({
            'status': 'success',
            'paper': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Paper.DoesNotExist:
        return Response({
            'status': 'error',
            'message': f'Paper with id {paper_id} not found'
        }, status=status.HTTP_404_NOT_FOUND)