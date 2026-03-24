from django.db import models
from apps.accounts.models import Account


class Engineer(models.Model):
    """
    Engineer or Supervisor profile linked to an Account.
    """

    ROLE_CHOICES = (
        ("ENGINEER", "Engineer"),
        ("SUPERVISOR", "Supervisor"),
    )

    account = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        related_name="engineer_profile"
    )

    ward_no = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default="Engineer"
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "engineers"
        verbose_name = "Engineer"
        verbose_name_plural = "Engineers"

    def __str__(self):
        return f"{self.account.full_name} ({self.role})"