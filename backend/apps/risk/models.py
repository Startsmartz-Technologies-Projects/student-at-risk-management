from django.db import models

from apps.common.models import TimeStampedModel
from apps.students.models import Enrollment


class RiskAssessment(TimeStampedModel):
    enrollment = models.ForeignKey(Enrollment, related_name="assessments", on_delete=models.CASCADE)
    week = models.PositiveSmallIntegerField()
    is_at_risk = models.BooleanField(default=False)
    reasons = models.JSONField(default=list, blank=True)
    evaluated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("enrollment", "week")
        ordering = ("-week", "-evaluated_at")

    def __str__(self) -> str:
        flag = "AT RISK" if self.is_at_risk else "OK"
        return f"{self.enrollment} W{self.week} → {flag}"


class ActionLog(TimeStampedModel):
    risk_assessment = models.ForeignKey(
        RiskAssessment, related_name="actions", on_delete=models.CASCADE
    )
    action_taken = models.TextField()
    action_date = models.DateField()
    performed_by = models.ForeignKey(
        "accounts.User", related_name="risk_actions", on_delete=models.PROTECT
    )
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ("-action_date",)
