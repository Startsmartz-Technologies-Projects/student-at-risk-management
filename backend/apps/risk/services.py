from __future__ import annotations

from decimal import Decimal

from django.db import transaction

from apps.metrics.models import WeeklyMetric
from apps.students.models import Enrollment

from .models import ActionLog, RiskAssessment

THRESHOLD = Decimal("50.00")


def _reasons_for(metric: WeeklyMetric) -> list[str]:
    reasons: list[str] = []
    if metric.attendance_pct < THRESHOLD:
        reasons.append("attendance")
    if metric.tutorial_submission_pct < THRESHOLD:
        reasons.append("tutorial")
    if metric.assessment_attempt_pct < THRESHOLD:
        reasons.append("assessment")
    return reasons


@transaction.atomic
def evaluate_risk(enrollment: Enrollment, week: int) -> RiskAssessment:
    """Evaluate risk for one (enrollment, week). Upserts a RiskAssessment row.

    A student is flagged if any of the three thresholds is breached.
    """
    metric = WeeklyMetric.objects.filter(enrollment=enrollment, week=week).first()
    if metric is None:
        obj, _ = RiskAssessment.objects.update_or_create(
            enrollment=enrollment,
            week=week,
            defaults={"is_at_risk": False, "reasons": []},
        )
        return obj

    reasons = _reasons_for(metric)
    obj, _ = RiskAssessment.objects.update_or_create(
        enrollment=enrollment,
        week=week,
        defaults={"is_at_risk": bool(reasons), "reasons": reasons},
    )
    return obj


def evaluate_all(week: int, *, year: int | None = None, trimester: int | None = None) -> int:
    """Evaluate every enrollment that has a metric for the given week. Returns count."""
    enrollments = Enrollment.objects.filter(metrics__week=week).distinct()
    if year is not None:
        enrollments = enrollments.filter(year=year)
    if trimester is not None:
        enrollments = enrollments.filter(trimester=trimester)
    n = 0
    for enr in enrollments:
        evaluate_risk(enr, week)
        n += 1
    return n


@transaction.atomic
def add_action(*, risk_assessment: RiskAssessment, action_taken: str, action_date, performed_by, notes: str = "") -> ActionLog:
    return ActionLog.objects.create(
        risk_assessment=risk_assessment,
        action_taken=action_taken,
        action_date=action_date,
        performed_by=performed_by,
        notes=notes,
    )
