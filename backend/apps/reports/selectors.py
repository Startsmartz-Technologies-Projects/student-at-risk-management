from __future__ import annotations

from collections import defaultdict
from typing import Iterable

from apps.risk.models import RiskAssessment
from apps.students.models import Student


def _risk_level(pct: float) -> str:
    if pct >= 75:
        return "High"
    if pct >= 40:
        return "Medium"
    if pct > 0:
        return "Low"
    return "None"


def consolidated_for_students(students: Iterable[Student]) -> list[dict]:
    """Aggregate per-student risk across all subjects, week 4 + week 8."""
    student_ids = [s.id for s in students]
    assessments = (
        RiskAssessment.objects.filter(enrollment__student_id__in=student_ids)
        .select_related("enrollment", "enrollment__subject", "enrollment__student")
        .prefetch_related("actions")
    )

    # Map: student_id → { week → set(subject_id at risk) , total_subjects: set(subject_id) }
    buckets: dict[int, dict] = defaultdict(
        lambda: {
            "w4": set(),
            "w8": set(),
            "subjects": set(),
            "latest_action": "",
            "still_potentially_at_risk": None,
            "final_status": "",
            "week9_reviewed_at": None,
        }
    )
    for ra in assessments:
        sid = ra.enrollment.student_id
        subj = ra.enrollment.subject_id
        buckets[sid]["subjects"].add(subj)
        if ra.is_at_risk:
            if ra.week == 4:
                buckets[sid]["w4"].add(subj)
            elif ra.week == 8:
                buckets[sid]["w8"].add(subj)
        if ra.week == 8:
            if ra.actions.exists():
                latest_action = ra.actions.order_by("-action_date", "-id").first()
                if latest_action:
                    buckets[sid]["latest_action"] = latest_action.action_taken
            buckets[sid]["still_potentially_at_risk"] = ra.still_at_risk_week9
            buckets[sid]["final_status"] = ra.current_status
            buckets[sid]["week9_reviewed_at"] = ra.week9_reviewed_at

    results: list[dict] = []
    for s in students:
        b = buckets.get(
            s.id,
            {
                "w4": set(),
                "w8": set(),
                "subjects": set(),
                "latest_action": "",
                "still_potentially_at_risk": None,
                "final_status": "",
                "week9_reviewed_at": None,
            },
        )
        total = len(b["subjects"])
        at_risk = len(b["w4"] | b["w8"])
        pct = (at_risk / total * 100) if total else 0
        results.append(
            {
                "studentId": s.student_id,
                "studentName": s.full_name,
                "email": s.email,
                "subjectsAtRiskW4": len(b["w4"]),
                "subjectsAtRiskW8": len(b["w8"]),
                "totalSubjects": total,
                "riskPct": round(pct, 2),
                "overallRiskLevel": _risk_level(pct),
                "actionTaken": b["latest_action"],
                "stillPotentiallyAtRisk": b["still_potentially_at_risk"],
                "finalStatus": b["final_status"] or ("At Risk" if pct > 0 else "Recovered"),
                "week9ReviewedAt": b["week9_reviewed_at"],
            }
        )
    return results


def consolidated_for_student(student: Student) -> dict:
    rows = consolidated_for_students([student])
    return rows[0] if rows else {}
