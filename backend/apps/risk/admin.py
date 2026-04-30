from django.contrib import admin

from .models import ActionLog, RiskAssessment


@admin.register(RiskAssessment)
class RiskAssessmentAdmin(admin.ModelAdmin):
    list_display = ("enrollment", "week", "is_at_risk", "evaluated_at")
    list_filter = ("week", "is_at_risk")


@admin.register(ActionLog)
class ActionLogAdmin(admin.ModelAdmin):
    list_display = ("risk_assessment", "action_date", "performed_by")
    list_filter = ("action_date",)
