from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("risk", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="riskassessment",
            name="current_status",
            field=models.CharField(default="At Risk", max_length=64),
        ),
        migrations.AddField(
            model_name="riskassessment",
            name="still_at_risk_week9",
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="riskassessment",
            name="week9_reviewed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
