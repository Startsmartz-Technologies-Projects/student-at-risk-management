from django.core.management.base import BaseCommand, CommandError

from apps.risk.services import evaluate_all


class Command(BaseCommand):
    help = "Evaluate risk for every enrollment with metrics for the given week."

    def add_arguments(self, parser):
        parser.add_argument("--week", type=int, required=True, choices=[4, 8])

    def handle(self, *args, **opts):
        week = opts["week"]
        if week not in (4, 8):
            raise CommandError("week must be 4 or 8")
        n = evaluate_all(week)
        self.stdout.write(self.style.SUCCESS(f"Evaluated {n} enrollments for week {week}."))
