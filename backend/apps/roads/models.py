from django.db import models
from apps.projects.models import Project
from apps.lookups.models import RoadType


class Road(models.Model):
    """
    Road-specific project details.
    Each road is exactly one project.
    """

    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name="road"
    )

    road_length_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )

    road_width_m = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    road_type = models.ForeignKey(
        RoadType,
        on_delete=models.PROTECT
    )

    class Meta:
        db_table = "road_details"
        verbose_name = "Road"
        verbose_name_plural = "Roads"

    def __str__(self):
        return f"Road – {self.project.project_code}"
