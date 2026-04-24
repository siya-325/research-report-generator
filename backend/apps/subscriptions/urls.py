from django.urls import path
from . import views

app_name = 'subscriptions'

urlpatterns = [
    # Subscribe/Unsubscribe
    path('subscribe/', views.subscribe_to_topic, name='subscribe'),
    path('<int:subscription_id>/unsubscribe/', views.unsubscribe_from_topic, name='unsubscribe'),
    
    # List and detail
    path('', views.my_subscriptions, name='list'),
    path('<int:subscription_id>/', views.subscription_detail, name='detail'),
    
    # Updates
    path('<int:subscription_id>/updates/', views.subscription_updates, name='updates'),
    
    # Manual actions
    path('<int:subscription_id>/check-now/', views.trigger_manual_check, name='check-now'),
    path('<int:subscription_id>/update/', views.update_subscription, name='update'),
]