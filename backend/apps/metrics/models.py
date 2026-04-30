from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.common.models import TimeStampedModel
from apps.students.models import Enrollment


class WeeklyMetric(TimeStampedModel):
    class Week(models.IntegerChoices):
        WEEK_4 = 4, "Week 4"
        WEEK_8 = 8, "Week 8"

    enrollment = models.ForeignKey(Enrollment, related_name="metrics", on_delete=models.CASCADE)
    week = models.PositiveSmallIntegerField(choices=Week.choices)
    attendance_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    tutorial_submission_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    assessment_attempt_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("enrollment", "week")
        ordering = ("-week", "-recorded_at")

    def __str__(self) -> str:
        return f"{self.enrollment} - W{self.week}"
