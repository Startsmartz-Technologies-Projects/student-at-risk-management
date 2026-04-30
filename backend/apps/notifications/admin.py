from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "channel", "status", "sent_at")
    list_filter = ("status", "channel")
    search_fields = ("student__full_name", "student__email")
