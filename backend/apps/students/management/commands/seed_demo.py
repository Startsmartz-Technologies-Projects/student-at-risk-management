from __future__ import annotations

import random
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.metrics.models import WeeklyMetric
from apps.risk.services import evaluate_all
from apps.students.models import Enrollment, Student, Subject

User = get_user_model()

SUBJECTS = [
    ("MIS602", "Data Modelling and Database Design"),
    ("BUS601", "Marketing Foundations"),
    ("ENG503", "Academic English"),
    ("CSC410", "Algorithms and Data Structures"),
]

NAMES = [
    "Asif Iqbal", "Mark Vien", "Sarah Lopez", "David Kim",
    "Linda Steart", "Scott Lee", "Guta Bahadur", "Mei Tanaka",
    "Yusuf Adel", "Priya Sharma", "Carlos Rivera", "Anna Müller",
    "Hiroshi Sato", "Aisha Khan", "Nora Park", "Ethan Cole",
    "Olivia Brown", "Liam Walker", "Zara Hussein", "Noah Bennett",
]


class Command(BaseCommand):
    help = "Idempotently seed demo data: users, students, subjects, enrollments, metrics, risk."

    @transaction.atomic
    def handle(self, *args, **opts):
        random.seed(42)

        admin, created = User.objects.get_or_create(
            email="admin@srm.local",
            defaults={"first_name": "Admin", "last_name": "User", "role": "admin", "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("admin123")
            admin.save()

        coord, created = User.objects.get_or_create(
            email="coordinator@srm.local",
            defaults={"first_name": "Coor", "last_name": "Dinator", "role": "coordinator"},
        )
        if created:
            coord.set_password("coord123")
            coord.save()

        subjects: list[Subject] = []
        for code, name in SUBJECTS:
            s, _ = Subject.objects.update_or_create(
                code=code, defaults={"name": name, "trimester": 3, "year": 2025}
            )
            subjects.append(s)

        today = date.today()
        students: list[Student] = []
        for i, full_name in enumerate(NAMES, start=1):
            sid = f"S{20057000 + i}"
            email = full_name.lower().replace(" ", ".") + "@students.uni.edu"
            stu, _ = Student.objects.update_or_create(
                student_id=sid,
                defaults={
                    "full_name": full_name,
                    "email": email,
                    "enrolled_at": today - timedelta(days=300 + i),
                },
            )
            students.append(stu)

        enrollments: list[Enrollment] = []
        for stu in students:
            for sub in subjects:
                e, _ = Enrollment.objects.get_or_create(
                    student=stu, subject=sub, trimester=3, year=2025
                )
                enrollments.append(e)

        for e in enrollments:
            for week in (4, 8):
                WeeklyMetric.objects.update_or_create(
                    enrollment=e,
                    week=week,
                    defaults={
                        "attendance_pct": Decimal(random.randint(20, 95)),
                        "tutorial_submission_pct": Decimal(random.randint(20, 95)),
                        "assessment_attempt_pct": Decimal(random.randint(20, 95)),
                    },
                )

        evaluate_all(4)
        evaluate_all(8)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(students)} students, {len(subjects)} subjects, "
            f"{len(enrollments)} enrollments, {len(enrollments)*2} metrics."
        ))
