import os
from celery import Celery

# Set default Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Create Celery app
app = Celery('research_agent')

# Load config from Django settings (namespace='CELERY')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task to test Celery"""
    print(f'Request: {self.request!r}')

from celery.schedules import crontab

# Celery Beat Schedule
app.conf.beat_schedule = {
    'check-weekly-subscriptions': {
        'task': 'check_weekly_subscriptions',
        'schedule': crontab(day_of_week='monday', hour=9, minute=0),  # Every Monday at 9 AM
        # For testing, use this instead:
        #'schedule': 60.0,  # Every 60 seconds
    },
}

app.conf.timezone = 'UTC'