from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Enrollment, Student, Subject
from .selectors import list_enrollments, list_students, list_subjects
from .serializers import (
    BulkUploadSerializer,
    EnrollmentSerializer,
    StudentSerializer,
    SubjectSerializer,
)
from .services import bulk_upload_students


class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    queryset = Student.objects.all()
    search_fields = ("student_id", "full_name", "email")
    ordering_fields = ("full_name", "enrolled_at")
    filterset_fields: list[str] = []

    def get_queryset(self):
        return list_students()

    @action(
        detail=False,
        methods=["post"],
        url_path="bulk-upload",
        parser_classes=[MultiPartParser, FormParser],
    )
    def bulk_upload(self, request):
        ser = BulkUploadSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        result = bulk_upload_students(ser.validated_data["file"].read())
        return Response(result)


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    queryset = Subject.objects.all()
    search_fields = ("code", "name")
    filterset_fields = ("trimester", "year")

    def get_queryset(self):
        return list_subjects()


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    queryset = Enrollment.objects.all()
    filterset_fields = ("student", "subject", "trimester", "year")

    def get_queryset(self):
        return list_enrollments()
