from django.contrib import admin

from .models import Enrollment, Student, Subject


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("student_id", "full_name", "email", "enrolled_at")
    search_fields = ("student_id", "full_name", "email")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "trimester", "year")
    list_filter = ("year", "trimester")
    search_fields = ("code", "name")


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "trimester", "year")
    list_filter = ("year", "trimester")
