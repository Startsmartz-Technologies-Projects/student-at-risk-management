from django.contrib import admin

from .models import WeeklyMetric


@admin.register(WeeklyMetric)
class WeeklyMetricAdmin(admin.ModelAdmin):
    list_display = (
        "enrollment",
        "week",
        "attendance_pct",
        "tutorial_submission_pct",
        "assessment_attempt_pct",
        "recorded_at",
    )
    list_filter = ("week",)
