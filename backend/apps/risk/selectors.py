from django.db.models import QuerySet

from .models import RiskAssessment


def list_assessments() -> QuerySet[RiskAssessment]:
    return RiskAssessment.objects.select_related(
        "enrollment", "enrollment__student", "enrollment__subject"
    ).prefetch_related("actions", "actions__performed_by")
