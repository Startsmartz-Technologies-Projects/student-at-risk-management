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
        n = evaluate_all(ser.validated_data["week"])
        return Response({"evaluated": n})
