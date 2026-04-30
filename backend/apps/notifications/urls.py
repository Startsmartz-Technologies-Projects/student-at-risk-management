from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .views import NotificationViewSet

router = DefaultRouter()
router.register(r"", NotificationViewSet, basename="notification")

urlpatterns = [
    path("send/", NotificationViewSet.as_view({"post": "send"}), name="notification-send"),
    path("", include(router.urls)),
]
