from django.core.validators import MinValueValidator
from django.db import models

from apps.common.models import TimeStampedModel


class Student(TimeStampedModel):
    student_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    enrolled_at = models.DateField()

    class Meta:
        ordering = ("full_name",)

    def __str__(self) -> str:
        return f"{self.student_id} - {self.full_name}"


class Subject(TimeStampedModel):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    trimester = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    year = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ("code",)

    def __str__(self) -> str:
        return f"{self.code} ({self.year} T{self.trimester})"


class Enrollment(TimeStampedModel):
    student = models.ForeignKey(Student, related_name="enrollments", on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, related_name="enrollments", on_delete=models.CASCADE)
    trimester = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()

    class Meta:
        unique_together = ("student", "subject", "trimester", "year")
        ordering = ("-year", "-trimester")

    def __str__(self) -> str:
        return f"{self.student.student_id} → {self.subject.code} ({self.year} T{self.trimester})"
