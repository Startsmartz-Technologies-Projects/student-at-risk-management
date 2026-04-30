from django.urls import path

from .views import ConsolidatedReportView, ConsolidatedStudentReportView, ExportXlsxView

urlpatterns = [
    path("consolidated/", ConsolidatedReportView.as_view(), name="report-consolidated"),
    path(
        "consolidated/<str:student_id>/",
        ConsolidatedStudentReportView.as_view(),
        name="report-consolidated-detail",
    ),
    path("export.xlsx", ExportXlsxView.as_view(), name="report-export-xlsx"),
]
