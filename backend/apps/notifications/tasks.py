from celery import shared_task

from .models import Notification
from .services import deliver_notification, queue_notifications_for_week


@shared_task(name="notifications.dispatch_for_week")
def dispatch_for_week(week: int) -> int:
    queued = queue_notifications_for_week(week)
    for n_id in Notification.objects.filter(status=Notification.Status.QUEUED).values_list(
        "id", flat=True
    ):
        deliver_notification.delay(n_id)
    return queued


@shared_task(name="notifications.deliver")
def deliver(notification_id: int) -> None:
    deliver_notification(notification_id)
