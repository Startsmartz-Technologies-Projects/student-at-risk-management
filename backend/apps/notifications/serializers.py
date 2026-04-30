from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    studentName = serializers.CharField(source="student.full_name", read_only=True)
    subjectCode = serializers.CharField(source="subject.code", read_only=True)
    sentAt = serializers.DateTimeField(source="sent_at", read_only=True)

    class Meta:
        model = Notification
        fields = (
            "id",
            "student",
            "subject",
            "channel",
            "message",
            "status",
            "sentAt",
            "related_assessment",
            "studentName",
            "subjectCode",
            "created_at",
        )
        read_only_fields = ("status", "sentAt", "created_at")


class SendNotificationSerializer(serializers.Serializer):
    week = serializers.IntegerField()

    def validate_week(self, v):
        if v not in (4, 8):
            raise serializers.ValidationError("week must be 4 or 8")
        return v
