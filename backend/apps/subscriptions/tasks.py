from celery import shared_task
from .services import SubscriptionService
from .models import TopicSubscription


@shared_task(name='check_weekly_subscriptions')
def check_weekly_subscriptions_task():
    """
    Check all subscriptions due for weekly update
    Runs weekly via Celery Beat
    """
    service = SubscriptionService()
    results = service.check_subscriptions_due_this_week()
    
    return {
        'status': 'success',
        'total_checked': len(results),
        'successful': len([r for r in results if r['success']]),
        'failed': len([r for r in results if not r['success']]),
        'results': [
            {
                'subscription_id': r['subscription'].id,
                'topic': r['subscription'].topic,
                'user_email': r['subscription'].user.email,
                'success': r['success'],
                'new_papers': r['result']['new_papers_count'] if r['success'] else 0,
                'error': r.get('error')
            }
            for r in results
        ]
    }


@shared_task(name='check_single_subscription')
def check_single_subscription_task(subscription_id: int):
    """
    Manually check a single subscription (for testing or on-demand updates)
    """
    try:
        subscription = TopicSubscription.objects.get(id=subscription_id)
        service = SubscriptionService()
        result = service.check_subscription_for_updates(subscription)
        
        return {
            'status': 'success',
            'subscription_id': subscription_id,
            'new_papers_count': result['new_papers_count'],
            'report_id': result['report'].id if result['report'] else None
        }
    except TopicSubscription.DoesNotExist:
        return {
            'status': 'error',
            'error': f'Subscription {subscription_id} not found'
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }