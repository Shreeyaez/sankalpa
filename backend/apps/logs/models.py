from django.db import models

from apps.projects.models import Project
from apps.milestones.models import Milestone
from apps.engineers.models import Engineer
from apps.lookups.models import DelayType

class WeeklyLog(models.Model):
    """
    Weekly site progress log for a project.
    """

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="weekly_logs"
    )

    log_date = models.DateField()

    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.PROTECT,
        related_name="weekly_logs"
    )

    weather_conditions = models.CharField(
        max_length=100
    )

    crew_size = models.PositiveIntegerField()

    equipment_used = models.TextField()

    work_progress_detail = models.TextField()

    area_completed = models.CharField(
        max_length=200
    )

    issues_risks = models.TextField(
        null=True,
        blank=True
    )

    next_week_plan = models.TextField()

    is_milestone_completed = models.BooleanField(
        default=False
    )

    created_by = models.ForeignKey(
        Engineer,
        on_delete=models.PROTECT,
        related_name="weekly_logs"
    )

    log_photo = models.FileField(
        upload_to="logs/",
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "weekly_logs"
        ordering = ["-log_date"]
        verbose_name = "Weekly Log"
        verbose_name_plural = "Weekly Logs"
        unique_together = ("project", "log_date", "milestone")

    def __str__(self):
        return f"{self.project.project_code} – {self.log_date}"


class DelayLog(models.Model):
    """
    Delay reporting for projects.
    """
    STATUS_CHOICES = (
        ("ONGOING", "Ongoing"),
        ("CRITICAL", "Critical"),
        ("RESOLVED", "Resolved"),
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="delay_logs"
    )

    log_date = models.DateField()

    delay_type = models.ForeignKey(
        DelayType,
        on_delete=models.PROTECT,
        related_name="delay_logs"
    )

    estimated_days = models.PositiveIntegerField(default=0)
    progress_percent = models.FloatField(default=0)

    delay_description = models.TextField()

    actions_taken = models.TextField()

    impact_on_schedule = models.TextField(
        null=True,
        blank=True
    )

    reported_by = models.ForeignKey(
        Engineer,
        on_delete=models.PROTECT,
        related_name="delay_logs"
    )

    status = models.CharField(
        choices=STATUS_CHOICES,
        max_length=250,
        default="Ongoing"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "delay_logs"
        ordering = ["-log_date"]
        verbose_name = "Delay Log"
        verbose_name_plural = "Delay Logs"

    def __str__(self):
        return f"Delay – {self.project.project_code} ({self.log_date})"
