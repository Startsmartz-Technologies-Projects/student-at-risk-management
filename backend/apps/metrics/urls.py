from rest_framework.routers import DefaultRouter

from .views import WeeklyMetricViewSet

router = DefaultRouter()
router.register(r"", WeeklyMetricViewSet, basename="metric")

urlpatterns = router.urls
