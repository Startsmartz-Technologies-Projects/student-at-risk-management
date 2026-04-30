from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import IsAdminOrCoordinator

from .models import RiskAssessment
from .selectors import list_assessments
from .serializers import (
    CreateActionSerializer,
    EvaluateRiskSerializer,
    RiskAssessmentSerializer,
    UpdateRiskStatusSerializer,
)
from .services import add_action, evaluate_all


class RiskAssessmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RiskAssessmentSerializer
    queryset = RiskAssessment.objects.all()
    filterset_fields = {
        "week": ["exact"],
        "is_at_risk": ["exact"],
        "enrollment__student": ["exact"],
        "enrollment__subject": ["exact"],
    }

    def get_queryset(self):
        return list_assessments()

    @action(detail=True, methods=["post"], url_path="actions")
    def add_action(self, request, pk=None):
        ra = self.get_object()
        ser = CreateActionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        log = add_action(
            risk_assessment=ra,
            action_taken=ser.validated_data["actionTaken"],
            action_date=ser.validated_data["actionDate"],
            performed_by=request.user,
            notes=ser.validated_data.get("notes", ""),
        )
        return Response({"id": log.id}, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=["post"],
        url_path="evaluate",
        permission_classes=[IsAdminOrCoordinator],
    )
    def evaluate(self, request):
        ser = EvaluateRiskSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        n = evaluate_all(
            ser.validated_data["week"],
            year=ser.validated_data.get("year"),
            trimester=ser.validated_data.get("trimester"),
        )
        return Response({"evaluated": n})

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        ra = self.get_object()
        ser = UpdateRiskStatusSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ra.current_status = ser.validated_data["currentStatus"]
        if "stillAtRiskWeek9" in ser.validated_data:
            ra.still_at_risk_week9 = ser.validated_data["stillAtRiskWeek9"]
            ra.week9_reviewed_at = timezone.now()
        ra.save(update_fields=["current_status", "still_at_risk_week9", "week9_reviewed_at"])
        return Response({"id": ra.id, "currentStatus": ra.current_status, "stillAtRiskWeek9": ra.still_at_risk_week9})

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        qs = self.get_queryset().filter(is_at_risk=True)
        week = request.query_params.get("week")
        if week:
            qs = qs.filter(week=week)

        total_assessments = qs.count()
        # Pure Python aggregation keeps behavior DB-agnostic.
        tiers = {"tier1": 0, "tier2": 0, "tier3": 0}
        unique_students = set()
        for ra in qs:
            sid = ra.enrollment.student.student_id
            unique_students.add(sid)
        per_student_max = {}
        for ra in qs:
            sid = ra.enrollment.student.student_id
            per_student_max[sid] = max(per_student_max.get(sid, 0), len(ra.reasons or []))
        for max_reasons in per_student_max.values():
            if max_reasons >= 3:
                tiers["tier3"] += 1
            elif max_reasons == 2:
                tiers["tier2"] += 1
            elif max_reasons == 1:
                tiers["tier1"] += 1

        return Response(
            {
                "totalAtRiskStudents": len(unique_students),
                "tier1Students": tiers["tier1"],
                "tier2Students": tiers["tier2"],
                "tier3Students": tiers["tier3"],
                "assessmentRows": total_assessments,
            }
        )
