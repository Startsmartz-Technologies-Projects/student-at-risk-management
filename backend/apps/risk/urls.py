from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .views import RiskAssessmentViewSet

router = DefaultRouter()
router.register(r"assessments", RiskAssessmentViewSet, basename="risk-assessment")

urlpatterns = [
    path("", include(router.urls)),
    # POST /api/risk/evaluate/ → handled by the @action below /assessments
    # We expose a flat alias for clarity:
    path("evaluate/", RiskAssessmentViewSet.as_view({"post": "evaluate"}), name="risk-evaluate"),
]
