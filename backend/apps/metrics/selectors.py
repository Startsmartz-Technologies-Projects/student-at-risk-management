from django.db.models import QuerySet

from .models import WeeklyMetric


def list_metrics() -> QuerySet[WeeklyMetric]:
    return WeeklyMetric.objects.select_related("enrollment", "enrollment__student", "enrollment__subject")
