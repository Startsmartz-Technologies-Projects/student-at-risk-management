from django.core.management.base import BaseCommand

from apps.risk.tasks import finalize_week9_task


class Command(BaseCommand):
    help = "Finalize week-9 status from week-8 risk outcomes."

    def handle(self, *args, **opts):
        n = finalize_week9_task()
        self.stdout.write(self.style.SUCCESS(f"Finalized week-9 status for {n} assessments."))
