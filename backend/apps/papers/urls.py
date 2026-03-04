from django.urls import path
from . import views

app_name = 'papers'

urlpatterns = [
    # Search papers from arXiv
    path('search/', views.search_papers, name='search'),
    
    # List all papers (for debugging)
    path('', views.list_papers, name='list'),
    
    # Get single paper (for debugging)
    path('<int:paper_id>/', views.get_paper, name='detail'),
]