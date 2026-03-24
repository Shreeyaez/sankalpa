from django.db import models


class BaseLookup(models.Model):
    """
    Abstract base model for lookup tables.
    Provides a reusable 'name' field and common meta options.
    """
    name = models.CharField(
        max_length=100,
        unique=True
    )

    class Meta:
        abstract = True
        ordering = ["name"]

    def __str__(self):
        return self.name


class PriorityLevel(BaseLookup):
    """
    High, Medium, Low
    """
    name = models.CharField(
        max_length=20,
        unique=True
    )

    class Meta(BaseLookup.Meta):
        db_table = "priority_levels"
        verbose_name = "Priority Level"
        verbose_name_plural = "Priority Levels"


class ProjectType(BaseLookup):
    """
    Road, Building, Bridge
    """
    name = models.CharField(
        max_length=50,
        unique=True
    )

    class Meta(BaseLookup.Meta):
        db_table = "project_types"
        verbose_name = "Project Type"
        verbose_name_plural = "Project Types"


class RoadType(BaseLookup):
    """
    New, Expansion, Maintenance
    """
    name = models.CharField(
        max_length=50,
        unique=True
    )

    class Meta(BaseLookup.Meta):
        db_table = "road_types"
        verbose_name = "Road Type"
        verbose_name_plural = "Road Types"


class DelayType(BaseLookup):
    """
    Compensable, Non-Compensable
    """
    name = models.CharField(
        max_length=50,
        unique=True
    )

    class Meta(BaseLookup.Meta):
        db_table = "delay_types"
        verbose_name = "Delay Type"
        verbose_name_plural = "Delay Types"


class AlertType(BaseLookup):
    """
    Milestone Completed, Project Completed, Delay Reported, etc.
    """
    name = models.CharField(
        max_length=100,
        unique=True
    )

    class Meta(BaseLookup.Meta):
        db_table = "alert_types"
        verbose_name = "Alert Type"
        verbose_name_plural = "Alert Types"


class BudgetSource(BaseLookup):
    """
    Federal, Provincial, Municipal, Donor, etc.
    """
    name = models.CharField(
        max_length=100,
        unique=True
    )

    class Meta(BaseLookup.Meta):
        db_table = "budget_sources"
        verbose_name = "Budget Source"
        verbose_name_plural = "Budget Sources"


class FiscalYear(models.Model):
    """
    Example: 2081/82
    """
    year_label = models.CharField(
        max_length=20,
        unique=True
    )

    class Meta:
        db_table = "fiscal_years"
        ordering = ["year_label"]
        verbose_name = "Fiscal Year"
        verbose_name_plural = "Fiscal Years"

    def __str__(self):
        return self.year_label
