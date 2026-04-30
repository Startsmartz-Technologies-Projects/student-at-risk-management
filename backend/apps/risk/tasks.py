from celery import shared_task

from .services import evaluate_all


@shared_task(name="risk.evaluate_week")
def evaluate_week_task(week: int) -> int:
    return evaluate_all(week)
