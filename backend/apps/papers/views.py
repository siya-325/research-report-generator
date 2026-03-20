from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Paper
from .serializers import PaperSerializer, PaperSearchRequestSerializer
from .services_unified import UnifiedSearchClient


@api_view(['POST'])
def search_papers(request):
    """
    Search for papers from multiple sources and save to database
    
    Endpoint: POST /api/papers/search/
    
    Request body:
    {
        "query": "machine learning",
        "max_results": 10,
        "sources": ["arxiv", "semantic_scholar", "pubmed"]  // optional
    }
    
    Response:
    {
        "status": "success",
        "message": "Found 10 papers, saved 5 new papers",
        "query": "machine learning",
        "total_found": 10,
        "new_papers": 5,
        "existing_papers": 5,
        "breakdown": {
            "arxiv": 4,
            "semantic_scholar": 3,
            "pubmed": 3
        },
        "papers": [...]
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
    
    # Get sources from request (optional)
    sources = request.data.get('sources', None)
    
    # Validate sources if provided
    if sources:
        valid_sources = ['arxiv', 'semantic_scholar', 'pubmed']
        invalid_sources = [s for s in sources if s not in valid_sources]
        if invalid_sources:
            return Response({
                'status': 'error',
                'message': f'Invalid sources: {invalid_sources}. Valid sources: {valid_sources}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Search using UnifiedSearchClient
        client = UnifiedSearchClient()
        result = client.search_and_save(
            query=query,
            max_results=max_results,
            sources=sources
        )
        
        # Serialize papers for response
        serializer = PaperSerializer(result['papers'], many=True)
        
        return Response({
            'status': 'success',
            'message': f"Found {result['total_found']} papers, saved {result['new_papers']} new papers",
            'query': query,
            'total_found': result['total_found'],
            'new_papers': result['new_papers'],
            'existing_papers': result['existing_papers'],
            'breakdown': result['breakdown'],
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
    - source_api: Filter by source (e.g., 'arxiv', 'semantic_scholar', 'pubmed')
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