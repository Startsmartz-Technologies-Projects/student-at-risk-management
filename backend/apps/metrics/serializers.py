from rest_framework import serializers

from .models import WeeklyMetric


class WeeklyMetricSerializer(serializers.ModelSerializer):
    attendancePct = serializers.DecimalField(
        source="attendance_pct", max_digits=5, decimal_places=2
    )
    tutorialSubmissionPct = serializers.DecimalField(
        source="tutorial_submission_pct", max_digits=5, decimal_places=2
    )
    assessmentAttemptPct = serializers.DecimalField(
        source="assessment_attempt_pct", max_digits=5, decimal_places=2
    )

    class Meta:
        model = WeeklyMetric
        fields = (
            "id",
            "enrollment",
            "week",
            "attendancePct",
            "tutorialSubmissionPct",
            "assessmentAttemptPct",
            "recorded_at",
        )
        read_only_fields = ("recorded_at",)


class BulkMetricSerializer(serializers.ListSerializer):
    child = WeeklyMetricSerializer()
