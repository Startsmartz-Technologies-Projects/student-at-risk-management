from datetime import date
from decimal import Decimal

import pytest

from apps.metrics.models import WeeklyMetric
from apps.reports.selectors import consolidated_for_students
from apps.risk.services import evaluate_risk
from apps.students.models import Enrollment, Student, Subject


@pytest.fixture
def two_subject_student(db):
    s = Student.objects.create(
        student_id="S100", full_name="Demo", email="d@x.io", enrolled_at=date.today()
    )
    subj_a = Subject.objects.create(code="A1", name="A", trimester=3, year=2025)
    subj_b = Subject.objects.create(code="B1", name="B", trimester=3, year=2025)
    e_a = Enrollment.objects.create(student=s, subject=subj_a, trimester=3, year=2025)
    e_b = Enrollment.objects.create(student=s, subject=subj_b, trimester=3, year=2025)
    return s, e_a, e_b


def test_one_subject_at_risk_w4_only(two_subject_student):
    s, e_a, e_b = two_subject_student
    WeeklyMetric.objects.create(
        enrollment=e_a, week=4,
        attendance_pct=Decimal(20), tutorial_submission_pct=Decimal(80), assessment_attempt_pct=Decimal(80),
    )
    WeeklyMetric.objects.create(
        enrollment=e_b, week=4,
        attendance_pct=Decimal(80), tutorial_submission_pct=Decimal(80), assessment_attempt_pct=Decimal(80),
    )
    evaluate_risk(e_a, 4)
    evaluate_risk(e_b, 4)

    rows = consolidated_for_students([s])
    row = rows[0]
    assert row["subjectsAtRiskW4"] == 1
    assert row["subjectsAtRiskW8"] == 0
    assert row["totalSubjects"] == 2
    assert row["riskPct"] == 50.0
    assert row["overallRiskLevel"] == "Medium"


def test_no_risk_returns_none_level(two_subject_student):
    s, e_a, e_b = two_subject_student
    WeeklyMetric.objects.create(
        enrollment=e_a, week=4,
        attendance_pct=Decimal(80), tutorial_submission_pct=Decimal(80), assessment_attempt_pct=Decimal(80),
    )
    evaluate_risk(e_a, 4)
    rows = consolidated_for_students([s])
    assert rows[0]["overallRiskLevel"] == "None"
