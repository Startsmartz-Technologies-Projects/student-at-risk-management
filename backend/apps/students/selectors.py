from django.db.models import QuerySet

from .models import Enrollment, Student, Subject


def list_students() -> QuerySet[Student]:
    return Student.objects.all().order_by("full_name")


def list_subjects() -> QuerySet[Subject]:
    return Subject.objects.all().order_by("code")


def list_enrollments() -> QuerySet[Enrollment]:
    return Enrollment.objects.select_related("student", "subject").all()
