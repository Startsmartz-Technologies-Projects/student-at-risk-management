from rest_framework import serializers

from .models import Enrollment, Student, Subject


class StudentSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source="student_id")
    studentName = serializers.CharField(source="full_name")
    enrolledAt = serializers.DateField(source="enrolled_at")

    class Meta:
        model = Student
        fields = ("id", "studentId", "studentName", "email", "enrolledAt")


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ("id", "code", "name", "trimester", "year")


class EnrollmentSerializer(serializers.ModelSerializer):
    studentName = serializers.CharField(source="student.full_name", read_only=True)
    subjectCode = serializers.CharField(source="subject.code", read_only=True)
    subjectName = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Enrollment
        fields = (
            "id",
            "student",
            "subject",
            "trimester",
            "year",
            "studentName",
            "subjectCode",
            "subjectName",
        )


class BulkUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, f):
        if not f.name.lower().endswith((".xlsx", ".xls")):
            raise serializers.ValidationError("File must be an Excel workbook (.xlsx).")
        if f.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File must be ≤ 10 MB.")
        return f
