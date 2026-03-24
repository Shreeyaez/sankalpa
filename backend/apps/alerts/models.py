from django.db import models

from apps.lookups.models import AlertType
from apps.projects.models import Project
from apps.milestones.models import Milestone

class Alert(models.Model):
    """
    System alerts and notifications.
    """

    alert_type = models.ForeignKey(
        AlertType,
        on_delete=models.PROTECT,
        related_name="alerts"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="alerts"
    )

    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="alerts"
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "alerts"
        ordering = ["-created_at"]
        verbose_name = "Alert"
        verbose_name_plural = "Alerts"

    def __str__(self):
        if self.project:
            return f"Alert – {self.project.project_code}"
        return f"Alert – {self.alert_type.name}"
