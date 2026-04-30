from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import IsAdminOrCoordinator

from .models import Notification
from .selectors import list_notifications
from .serializers import NotificationSerializer, SendNotificationSerializer
from .services import queue_notifications_for_week


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    filterset_fields = ("channel", "status", "student", "subject")

    def get_queryset(self):
        return list_notifications()

    @action(
        detail=False,
        methods=["post"],
        url_path="send",
        permission_classes=[IsAdminOrCoordinator],
    )
    def send(self, request):
        ser = SendNotificationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        n = queue_notifications_for_week(ser.validated_data["week"])
        return Response({"queued": n})
