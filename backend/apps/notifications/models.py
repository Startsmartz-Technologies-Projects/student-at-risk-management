from django.db import models

from apps.common.models import TimeStampedModel
from apps.risk.models import RiskAssessment
from apps.students.models import Student, Subject


class Notification(TimeStampedModel):
    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"

    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    student = models.ForeignKey(Student, related_name="notifications", on_delete=models.CASCADE)
    subject = models.ForeignKey(
        Subject, related_name="notifications", on_delete=models.SET_NULL, null=True, blank=True
    )
    channel = models.CharField(max_length=10, choices=Channel.choices)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.QUEUED)
    sent_at = models.DateTimeField(null=True, blank=True)
    related_assessment = models.ForeignKey(
        RiskAssessment, related_name="notifications", on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        ordering = ("-created_at",)
