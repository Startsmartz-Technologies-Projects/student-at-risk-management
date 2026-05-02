from celery import shared_task
from django.utils import timezone

from .services import evaluate_all
from .models import RiskAssessment


@shared_task(name="risk.evaluate_week")
def evaluate_week_task(week: int) -> int:
    return evaluate_all(week)


@shared_task(name="risk.finalize_week9")
def finalize_week9_task() -> int:
    """Auto-finalize week-9 status from week-8 risk results."""
    now = timezone.now()
    updated = 0
    qs = RiskAssessment.objects.filter(week=8)
    for ra in qs:
        still_at_risk = bool(ra.is_at_risk)
        current_status = "Still Potentially At Risk" if still_at_risk else "Recovered"
        changed = False
        if ra.still_at_risk_week9 != still_at_risk:
            ra.still_at_risk_week9 = still_at_risk
            changed = True
        if ra.current_status != current_status:
            ra.current_status = current_status
            changed = True
        if changed or ra.week9_reviewed_at is None:
            ra.week9_reviewed_at = now
            ra.save(update_fields=["still_at_risk_week9", "current_status", "week9_reviewed_at", "updated_at"])
            updated += 1
    return updated
