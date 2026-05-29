import os
from celery import Celery

# 1. Pull Redis host connection details from the environment parameters, defaulting to localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6333/0")

# 2. Initialize the master Celery application wrapper context
celery_app = Celery(
    "forecastly_workers",
    broker=REDIS_URL,
    backend=REDIS_URL
)

# 3. Update task execution parameters for clean tracking
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    # This prevents worker crashes from taking down tasks halfway through
    task_acks_late=True,
    worker_prefetch_multiplier=1
)

# 4. Tell Celery where to look for your background tasks (which we will build next)
celery_app.autodiscover_tasks(["app.workers"])