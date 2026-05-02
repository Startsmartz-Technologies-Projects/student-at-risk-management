from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import IsAdminOrCoordinator

from .models import Notification
from .selectors import list_notifications
from .serializers import NotificationSerializer, SendNotificationSerializer
from .services import deliver_notification, queue_notifications_for_week


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
        week = ser.validated_data["week"]
        queued = queue_notifications_for_week(week)
        # Dispatch every pending queued notification so old/null-assessment queued rows
        # are not stranded forever in QUEUED state.
        queued_ids = Notification.objects.filter(
            status=Notification.Status.QUEUED,
        ).values_list("id", flat=True)
        for n_id in queued_ids:
            deliver_notification(n_id)
        return Response({"queuedAndDispatched": queued})
