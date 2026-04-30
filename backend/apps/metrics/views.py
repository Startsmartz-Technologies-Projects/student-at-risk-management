from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import WeeklyMetric
from .selectors import list_metrics
from .serializers import WeeklyMetricSerializer


class WeeklyMetricViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyMetricSerializer
    queryset = WeeklyMetric.objects.all()
    filterset_fields = ("week", "enrollment")

    def get_queryset(self):
        return list_metrics()

    @action(detail=False, methods=["post"], url_path="bulk")
    def bulk(self, request):
        ser = WeeklyMetricSerializer(data=request.data, many=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response({"created": len(ser.data)}, status=status.HTTP_201_CREATED)
