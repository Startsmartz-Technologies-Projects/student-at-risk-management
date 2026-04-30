from __future__ import annotations

from datetime import date
from io import BytesIO
from typing import Iterable

from django.db import transaction

from openpyxl import load_workbook

from .models import Enrollment, Student, Subject


@transaction.atomic
def create_student(*, student_id: str, full_name: str, email: str, enrolled_at: date) -> Student:
    return Student.objects.create(
        student_id=student_id, full_name=full_name, email=email, enrolled_at=enrolled_at
    )


@transaction.atomic
def upsert_student(*, student_id: str, full_name: str, email: str, enrolled_at: date) -> Student:
    obj, _ = Student.objects.update_or_create(
        student_id=student_id,
        defaults={"full_name": full_name, "email": email, "enrolled_at": enrolled_at},
    )
    return obj


@transaction.atomic
def create_subject(*, code: str, name: str, trimester: int, year: int) -> Subject:
    return Subject.objects.create(code=code, name=name, trimester=trimester, year=year)


@transaction.atomic
def create_enrollment(*, student: Student, subject: Subject, trimester: int, year: int) -> Enrollment:
    obj, _ = Enrollment.objects.get_or_create(
        student=student, subject=subject, trimester=trimester, year=year
    )
    return obj


def _row_iter(file_bytes: bytes) -> Iterable[tuple]:
    wb = load_workbook(filename=BytesIO(file_bytes), data_only=True)
    ws = wb.active
    rows = ws.iter_rows(values_only=True)
    headers = next(rows, None)
    if not headers:
        return []
    return rows


@transaction.atomic
def bulk_upload_students(file_bytes: bytes) -> dict:
    """Excel columns expected: student_id | full_name | email | enrolled_at(YYYY-MM-DD)."""
    created = 0
    updated = 0
    for row in _row_iter(file_bytes):
        if not row or row[0] is None:
            continue
        student_id, full_name, email, enrolled_at = row[:4]
        if isinstance(enrolled_at, str):
            enrolled_at = date.fromisoformat(enrolled_at)
        existed = Student.objects.filter(student_id=student_id).exists()
        upsert_student(
            student_id=str(student_id),
            full_name=str(full_name),
            email=str(email),
            enrolled_at=enrolled_at,
        )
        if existed:
            updated += 1
        else:
            created += 1
    return {"created": created, "updated": updated}
