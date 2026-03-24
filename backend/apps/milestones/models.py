from django.db import models
from apps.projects.models import Project


class Milestone(models.Model):
    """
    Project milestone definition and tracking.
    """

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="milestones"
    )

    milestone_name = models.CharField(
        max_length=200
    )

    milestone_order = models.PositiveIntegerField(
        help_text="Order of milestone execution"
    )

    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Weight of milestone in percentage"
    )

    planned_start_date = models.DateField(
        null=True,
        blank=True
    )

    planned_completion_date = models.DateField(
        null=True,
        blank=True
    )

    is_critical_path = models.BooleanField(
        default=False
    )

    is_completed = models.BooleanField(
        default=False
    )

    class Meta:
        db_table = "milestones"
        ordering = ["project", "milestone_order"]
        verbose_name = "Milestone"
        verbose_name_plural = "Milestones"
        unique_together = ("project", "milestone_order")

    def __str__(self):
        return f"{self.project.project_code} – {self.milestone_name}"