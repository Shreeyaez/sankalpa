from django.db import models
from datetime import date
from decimal import Decimal
import os

from apps.lookups.models import (
    BudgetSource,
    FiscalYear,
)
from apps.engineers.models import Engineer
from apps.chairpersons.models import Chairperson
from apps.contractors.models import Contractor


class Project(models.Model):
    """
    Core project entity.
    """

    STATUS_CHOICES = (
        ("COMING_SOON", "Coming Soon"),
        ("ONGOING", "Ongoing"),
        ("DELAYED", "Delayed"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    )

    PRIORITY_CHOICES = (
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
    )

    # 🔹 Basic Info
    project_code = models.CharField(max_length=50, unique=True)
    project_name = models.CharField(max_length=250)
    project_description = models.TextField(blank=True)

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="LOW"
    )

    # 🔹 Location Info
    ward_no = models.PositiveIntegerField(default=16)
    municipality = models.CharField(max_length=100, default="Kathmandu")
    district = models.CharField(max_length=100, default="Kathmandu")
    province = models.CharField(max_length=100, default="Bagmati")
    location = models.CharField(max_length=400)

    # 🔹 Budget Info
    total_approved_budget = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    budget_source = models.ForeignKey(
        BudgetSource,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )

    fiscal_year = models.ForeignKey(
        FiscalYear,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )

    # 🔹 Assignment
    assigned_engineer = models.ForeignKey(
        Engineer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    chairperson = models.ForeignKey(
        Chairperson,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    contractor_contact_person = models.CharField(max_length=250, blank=True)

    # 🔹 Timeline
    proposed_date = models.DateField(null=True, blank=True)
    approved_date = models.DateField(null=True, blank=True)
    planned_start_date = models.DateField(null=True, blank=True)
    planned_completion_date = models.DateField(null=True, blank=True)
    planned_duration_days = models.PositiveIntegerField(null=True, blank=True)

    # 🔹 System Fields
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default="ONGOING"
    )

    project_document = models.FileField(
        upload_to="projects/",
        null=True,
        blank=True
    )

    class Meta:
        db_table = "projects"
        ordering = ["-created_at"]
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def __str__(self):
        return f"{self.project_code} – {self.project_name}"

    # =====================================================
    # 🔥 STATUS CALCULATION LOGIC
    # =====================================================

    def calculate_status(self):
        """
        Calculate project status based on milestone completion and dates.
        """

        today = date.today()

        # 🔥 1️⃣ FIRST PRIORITY: Milestone Completion
        if self.pk:
            try:
                milestones = self.milestones.all()

                if milestones.exists():
                    total_weight = sum(
                        m.weight for m in milestones
                    )

                    completed_weight = sum(
                        m.weight for m in milestones.filter(is_completed=True)
                    )

                    if total_weight > Decimal("0") and completed_weight == total_weight:
                        return "COMPLETED"

            except Exception:
                pass

        # 🔹 2️⃣ If dates not defined, keep current status
        if not self.planned_start_date or not self.planned_completion_date:
            return self.status

        # 🔹 3️⃣ Coming Soon
        if today < self.planned_start_date:
            return "COMING_SOON"

        # 🔹 4️⃣ Delayed (past completion date & not completed)
        if today > self.planned_completion_date:
            return "DELAYED"

        # 🔹 5️⃣ Ongoing
        if self.planned_start_date <= today <= self.planned_completion_date:
            return "ONGOING"

        return self.status

    def update_status(self):
        """
        Update project status safely.
        Call this after milestone updates.
        """

        if not self.pk:
            return

        new_status = self.calculate_status()

        if new_status != self.status:
            self.status = new_status
            self.save(update_fields=["status"])

    # =====================================================
    # 📊 PROGRESS CALCULATIONS
    # =====================================================

    @property
    def completion_percentage(self):
        """
        Calculate project completion based on milestone weights.
        """

        if not self.pk:
            return 0

        try:
            milestones = self.milestones.all()

            if not milestones.exists():
                return 0

            total_weight = sum(m.weight for m in milestones)
            completed_weight = sum(
                m.weight for m in milestones.filter(is_completed=True)
            )

            if total_weight == 0:
                return 0

            percentage = (completed_weight / total_weight) * 100
            return round(float(percentage), 2)

        except Exception:
            return 0

    @property
    def days_remaining(self):
        """
        Days remaining until planned completion.
        Negative if delayed.
        """

        if not self.planned_completion_date:
            return None

        return (self.planned_completion_date - date.today()).days

    @property
    def is_delayed(self):
        """
        Check if project is delayed.
        """

        if not self.planned_completion_date:
            return False

        return (
            date.today() > self.planned_completion_date
            and self.status != "COMPLETED"
        )


# =====================================================
# 📁 PAST PROJECT RECORDS
# =====================================================

def past_project_upload_path(instance, filename):
    """
    Store file in:
    media/past-project-records/<timestamp>_<filename>
    """
    from django.utils.timezone import now
    timestamp = now().strftime("%Y%m%d%H%M%S")
    return os.path.join(
        "past-project-records",
        f"{timestamp}_{filename}"
    )


class PastProjectRecord(models.Model):
    """
    Stores uploaded Excel files for past project records.
    """

    file = models.FileField(
        upload_to=past_project_upload_path
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "past_project_records"
        ordering = ["-uploaded_at"]
        verbose_name = "Past Project Record"
        verbose_name_plural = "Past Project Records"

    def __str__(self):
        return f"Past Record - {self.file.name}"