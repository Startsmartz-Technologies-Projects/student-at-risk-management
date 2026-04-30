from datetime import date
from decimal import Decimal

import pytest

from apps.metrics.models import WeeklyMetric
from apps.risk.services import evaluate_all, evaluate_risk
from apps.students.models import Enrollment, Student, Subject


@pytest.fixture
def enrollment(db) -> Enrollment:
    student = Student.objects.create(
        student_id="S1", full_name="Test Student", email="t@x.io", enrolled_at=date.today()
    )
    subject = Subject.objects.create(code="MIS602", name="DB", trimester=3, year=2025)
    return Enrollment.objects.create(student=student, subject=subject, trimester=3, year=2025)


def _metric(enrollment, week, att, tut, ass):
    return WeeklyMetric.objects.create(
        enrollment=enrollment,
        week=week,
        attendance_pct=Decimal(att),
        tutorial_submission_pct=Decimal(tut),
        assessment_attempt_pct=Decimal(ass),
    )


def test_no_metric_marks_not_at_risk(enrollment):
    ra = evaluate_risk(enrollment, 4)
    assert ra.is_at_risk is False
    assert ra.reasons == []


def test_attendance_below_threshold_flags(enrollment):
    _metric(enrollment, 4, 49, 80, 80)
    ra = evaluate_risk(enrollment, 4)
    assert ra.is_at_risk is True
    assert ra.reasons == ["attendance"]


def test_tutorial_below_threshold_flags(enrollment):
    _metric(enrollment, 4, 80, 49, 80)
    ra = evaluate_risk(enrollment, 4)
    assert ra.reasons == ["tutorial"]


def test_assessment_below_threshold_flags(enrollment):
    _metric(enrollment, 4, 80, 80, 49)
    ra = evaluate_risk(enrollment, 4)
    assert ra.reasons == ["assessment"]


def test_all_three_low(enrollment):
    _metric(enrollment, 4, 10, 10, 10)
    ra = evaluate_risk(enrollment, 4)
    assert ra.is_at_risk is True
    assert set(ra.reasons) == {"attendance", "tutorial", "assessment"}


def test_exactly_at_threshold_is_not_at_risk(enrollment):
    _metric(enrollment, 8, 50, 50, 50)
    ra = evaluate_risk(enrollment, 8)
    assert ra.is_at_risk is False
    assert ra.reasons == []


def test_evaluate_all_processes_each_enrollment(enrollment):
    _metric(enrollment, 4, 30, 30, 30)
    n = evaluate_all(4)
    assert n == 1


def test_evaluate_is_idempotent(enrollment):
    _metric(enrollment, 4, 30, 30, 30)
    evaluate_risk(enrollment, 4)
    evaluate_risk(enrollment, 4)
    from apps.risk.models import RiskAssessment
    assert RiskAssessment.objects.filter(enrollment=enrollment, week=4).count() == 1
