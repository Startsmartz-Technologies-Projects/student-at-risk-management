from django.db.models import QuerySet

from .models import Notification


def list_notifications() -> QuerySet[Notification]:
    return Notification.objects.select_related("student", "subject", "related_assessment")
