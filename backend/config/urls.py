from django.contrib import admin
from django.urls import include, path

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

api_v1 = [
    path("auth/", include("apps.accounts.urls")),
    path("students/", include("apps.students.urls")),
    path("subjects/", include("apps.students.subject_urls")),
    path("enrollments/", include("apps.students.enrollment_urls")),
    path("metrics/", include("apps.metrics.urls")),
    path("risk/", include("apps.risk.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("reports/", include("apps.reports.urls")),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api_v1)),
]
