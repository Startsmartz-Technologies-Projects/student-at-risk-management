from rest_framework import serializers

from .models import ActionLog, RiskAssessment


class ActionLogSerializer(serializers.ModelSerializer):
    actionTaken = serializers.CharField(source="action_taken")
    actionDate = serializers.DateField(source="action_date")
    performedBy = serializers.PrimaryKeyRelatedField(source="performed_by", read_only=True)

    class Meta:
        model = ActionLog
        fields = ("id", "actionTaken", "actionDate", "performedBy", "notes")


class RiskAssessmentSerializer(serializers.ModelSerializer):
    studentName = serializers.CharField(source="enrollment.student.full_name", read_only=True)
    studentId = serializers.CharField(source="enrollment.student.student_id", read_only=True)
    subjectCode = serializers.CharField(source="enrollment.subject.code", read_only=True)
    subjectName = serializers.CharField(source="enrollment.subject.name", read_only=True)
    isAtRisk = serializers.BooleanField(source="is_at_risk")
    currentStatus = serializers.CharField(source="current_status")
    stillAtRiskWeek9 = serializers.BooleanField(source="still_at_risk_week9", allow_null=True)
    week9ReviewedAt = serializers.DateTimeField(source="week9_reviewed_at", allow_null=True, read_only=True)
    evaluatedAt = serializers.DateTimeField(source="evaluated_at", read_only=True)
    actions = ActionLogSerializer(many=True, read_only=True)

    class Meta:
        model = RiskAssessment
        fields = (
            "id",
            "enrollment",
            "week",
            "isAtRisk",
            "reasons",
            "currentStatus",
            "stillAtRiskWeek9",
            "week9ReviewedAt",
            "evaluatedAt",
            "studentName",
            "studentId",
            "subjectCode",
            "subjectName",
            "actions",
        )
        read_only_fields = ("isAtRisk", "reasons", "evaluatedAt")


class EvaluateRiskSerializer(serializers.Serializer):
    week = serializers.IntegerField()
    year = serializers.IntegerField(required=False)
    trimester = serializers.IntegerField(required=False)

    def validate_week(self, v):
        if v not in (4, 8):
            raise serializers.ValidationError("week must be 4 or 8")
        return v


class CreateActionSerializer(serializers.Serializer):
    actionTaken = serializers.CharField()
    actionDate = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class UpdateRiskStatusSerializer(serializers.Serializer):
    currentStatus = serializers.CharField(max_length=64)
    stillAtRiskWeek9 = serializers.BooleanField(required=False, allow_null=True)
