from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # Generate new report
    path('generate/', views.generate_report, name='generate'),
    
    # List all reports
    path('', views.list_reports, name='list'),
    
    # Get single report
    path('<int:report_id>/', views.get_report, name='detail'),
]