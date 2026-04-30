from __future__ import annotations

from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from apps.risk.models import RiskAssessment

from .models import Notification


def _build_message(assessment: RiskAssessment) -> str:
    student = assessment.enrollment.student
    subject = assessment.enrollment.subject
    reasons = ", ".join(assessment.reasons) or "no specific reason"
    return (
        f"Dear {student.full_name},\n\n"
        f"You have been flagged at risk for {subject.code} - {subject.name} "
        f"in week {assessment.week}.\nReasons: {reasons}.\n\n"
        f"Please contact your tutor or coordinator.\n"
    )


@transaction.atomic
def queue_notifications_for_week(week: int) -> int:
    """Queue email notifications for every at-risk assessment for a given week."""
    qs = RiskAssessment.objects.filter(week=week, is_at_risk=True).select_related(
        "enrollment__student", "enrollment__subject"
    )
    n = 0
    for ra in qs:
        Notification.objects.create(
            student=ra.enrollment.student,
            subject=ra.enrollment.subject,
            channel=Notification.Channel.EMAIL,
            message=_build_message(ra),
            related_assessment=ra,
            status=Notification.Status.QUEUED,
        )
        n += 1
    return n


def deliver_notification(notification_id: int) -> None:
    n = Notification.objects.select_related("student").get(pk=notification_id)
    try:
        send_mail(
            subject="Academic Risk Notification",
            message=n.message,
            from_email=None,
            recipient_list=[n.student.email],
            fail_silently=False,
        )
        n.status = Notification.Status.SENT
        n.sent_at = timezone.now()
    except Exception:
        n.status = Notification.Status.FAILED
    n.save(update_fields=["status", "sent_at", "updated_at"])
