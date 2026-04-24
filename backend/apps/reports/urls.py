from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # Async report generation 
    path('generate-async/', views.generate_report_async, name='generate-async'),
    path('status/<str:task_id>/', views.check_task_status, name='task-status'),
    path('result/<str:task_id>/', views.get_report_result, name='task-result'),
    
    # Synchronous report generation (kept for compatibility)
    path('generate/', views.generate_report, name='generate'),

    # My reports (user-specific)
    path('my-reports/', views.my_reports, name='my-reports'),
    
    # List all reports
    path('', views.list_reports, name='list'),
    
    # Get single report
    path('<int:report_id>/', views.get_report, name='detail'),
]