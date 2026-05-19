from __future__ import annotations

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Drop all data, re-apply migrations, and seed demo data."

    def handle(self, *args, **opts):
        self.stdout.write("Flushing database...")
        call_command("flush", "--no-input")
        self.stdout.write("Running migrations...")
        call_command("migrate", "--no-input")
        self.stdout.write(self.style.SUCCESS("Database cleared."))
