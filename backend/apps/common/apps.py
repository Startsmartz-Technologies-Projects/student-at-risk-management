import os

from django.apps import AppConfig


class CommonConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.common"

    def ready(self) -> None:
        # Auto-reset DB on runserver startup in dev only.
        # Skip the autoreloader parent process (RUN_MAIN not set there) but
        # also allow --noreload runs where RUN_MAIN is absent entirely.
        settings_module = os.environ.get("DJANGO_SETTINGS_MODULE", "")
        run_main = os.environ.get("RUN_MAIN")
        if settings_module.endswith(".dev") and run_main == "true":
            from django.core.management import call_command
            call_command("reset_and_seed")

