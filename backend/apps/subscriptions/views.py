from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import TopicSubscription, SubscriptionUpdate
from .serializers import (
    TopicSubscriptionSerializer,
    CreateSubscriptionSerializer,
    SubscriptionUpdateSerializer
)
from .tasks import check_single_subscription_task


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_to_topic(request):
    """
    Subscribe to a research topic for weekly updates
    
    POST /api/subscriptions/subscribe/
    {
        "topic": "quantum computing",
        "max_papers": 20,
        "sources": ["arxiv", "semantic_scholar"],
        "email_notifications": true
    }
    """
    serializer = CreateSubscriptionSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    topic = serializer.validated_data['topic']
    
    # Check if subscription already exists
    existing = TopicSubscription.objects.filter(
        user=request.user,
        topic=topic
    ).first()
    
    if existing:
        if existing.is_active:
            return Response({
                'status': 'error',
                'message': 'You are already subscribed to this topic',
                'subscription': TopicSubscriptionSerializer(existing).data
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Reactivate existing subscription
            existing.is_active = True
            existing.max_papers = serializer.validated_data.get('max_papers', 20)
            existing.sources = serializer.validated_data.get('sources', [])
            existing.email_notifications = serializer.validated_data.get('email_notifications', True)
            existing.save()
            
            return Response({
                'status': 'success',
                'message': 'Subscription reactivated',
                'subscription': TopicSubscriptionSerializer(existing).data
            }, status=status.HTTP_200_OK)
    
    # Create new subscription
    subscription = TopicSubscription.objects.create(
        user=request.user,
        **serializer.validated_data
    )
    
    # Trigger initial check immediately (async)
    check_single_subscription_task.delay(subscription.id)
    
    return Response({
        'status': 'success',
        'message': 'Subscribed successfully! Initial check started.',
        'subscription': TopicSubscriptionSerializer(subscription).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unsubscribe_from_topic(request, subscription_id):
    """
    Unsubscribe from a topic
    
    POST /api/subscriptions/<id>/unsubscribe/
    """
    try:
        subscription = TopicSubscription.objects.get(
            id=subscription_id,
            user=request.user
        )
    except TopicSubscription.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Subscription not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    subscription.is_active = False
    subscription.save()
    
    return Response({
        'status': 'success',
        'message': 'Unsubscribed successfully',
        'subscription': TopicSubscriptionSerializer(subscription).data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_subscriptions(request):
    """
    Get all subscriptions for current user
    
    GET /api/subscriptions/
    """
    subscriptions = TopicSubscription.objects.filter(
        user=request.user
    ).order_by('-created_at')
    
    serializer = TopicSubscriptionSerializer(subscriptions, many=True)
    
    return Response({
        'status': 'success',
        'count': len(serializer.data),
        'active_count': len([s for s in serializer.data if s['is_active']]),
        'subscriptions': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_detail(request, subscription_id):
    """
    Get details of a specific subscription
    
    GET /api/subscriptions/<id>/
    """
    try:
        subscription = TopicSubscription.objects.get(
            id=subscription_id,
            user=request.user
        )
    except TopicSubscription.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Subscription not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = TopicSubscriptionSerializer(subscription)
    
    return Response({
        'status': 'success',
        'subscription': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_updates(request, subscription_id):
    """
    Get all updates for a subscription
    
    GET /api/subscriptions/<id>/updates/
    """
    try:
        subscription = TopicSubscription.objects.get(
            id=subscription_id,
            user=request.user
        )
    except TopicSubscription.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Subscription not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    updates = subscription.updates.all()[:10]  # Last 10 updates
    serializer = SubscriptionUpdateSerializer(updates, many=True)
    
    return Response({
        'status': 'success',
        'subscription_topic': subscription.topic,
        'count': len(serializer.data),
        'updates': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_manual_check(request, subscription_id):
    """
    Manually trigger a check for updates (for testing/immediate update)
    
    POST /api/subscriptions/<id>/check-now/
    """
    try:
        subscription = TopicSubscription.objects.get(
            id=subscription_id,
            user=request.user
        )
    except TopicSubscription.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Subscription not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Trigger async check
    task = check_single_subscription_task.delay(subscription.id)
    
    return Response({
        'status': 'success',
        'message': 'Update check started',
        'task_id': task.id,
        'subscription': TopicSubscriptionSerializer(subscription).data
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_subscription(request, subscription_id):
    """
    Update subscription settings
    
    PATCH /api/subscriptions/<id>/
    {
        "max_papers": 30,
        "sources": ["arxiv"],
        "email_notifications": false
    }
    """
    try:
        subscription = TopicSubscription.objects.get(
            id=subscription_id,
            user=request.user
        )
    except TopicSubscription.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Subscription not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CreateSubscriptionSerializer(
        subscription,
        data=request.data,
        partial=True
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': 'success',
            'message': 'Subscription updated',
            'subscription': TopicSubscriptionSerializer(subscription).data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'status': 'error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)