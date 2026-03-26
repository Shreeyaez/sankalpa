from django.db import models
from apps.engineers.models import Engineer

class AuditLog(models.Model):
    """
    Generic audit log for tracking data changes.
    """

    ACTION_CHOICES = (
        ("INSERT", "Insert"),
        ("UPDATE", "Update"),
        ("DELETE", "Delete"),
    )

    table_name = models.CharField(
        max_length=100
    )

    record_id = models.PositiveIntegerField()

    action = models.CharField(
        max_length=10,
        choices=ACTION_CHOICES
    )

    old_data = models.TextField(
        null=True,
        blank=True
    )

    new_data = models.TextField(
        null=True,
        blank=True
    )

    changed_by = models.ForeignKey(
        'accounts.Account',
        on_delete=models.PROTECT,
        related_name="audit_logs"
    )

    changed_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "audit_logs"
        ordering = ["-changed_at"]
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        return f"{self.table_name} | {self.action} | ID {self.record_id}"
