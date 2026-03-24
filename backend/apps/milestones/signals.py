from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from apps.milestones.models import Milestone
from apps.alerts.models import Alert
from apps.lookups.models import AlertType


@receiver(post_save, sender=Milestone)
def check_milestone_overdue(sender, instance, **kwargs):
    """
    Every time a milestone is saved, check if it is overdue.
    Overdue = planned_completion_date < today AND is_completed = False.
    Creates one alert per milestone — never duplicates.
    If milestone gets completed, marks existing alert as read.
    """
    today = timezone.now().date()

    # ── Get or create the AlertType for milestone overdue ──────────────────────
    alert_type, _ = AlertType.objects.get_or_create(name="Milestone Overdue")

    # ── If milestone was just completed → mark existing alert as read ──────────
    if instance.is_completed:
        Alert.objects.filter(
            milestone=instance,
            alert_type=alert_type,
            is_read=False
        ).update(is_read=True)
        return

    # ── Check if overdue ───────────────────────────────────────────────────────
    if not instance.planned_completion_date:
        return  # No completion date set, nothing to check

    if instance.planned_completion_date >= today:
        return  # Not yet overdue

    # ── Avoid duplicate alerts for the same milestone ─────────────────────────
    already_exists = Alert.objects.filter(
        milestone=instance,
        alert_type=alert_type,
        is_read=False
    ).exists()

    if already_exists:
        return

    # ── Create the overdue alert ───────────────────────────────────────────────
    days_overdue = (today - instance.planned_completion_date).days

    Alert.objects.create(
        alert_type=alert_type,
        project=instance.project,
        milestone=instance,
        message=(
            f"Milestone '{instance.milestone_name}' in project "
            f"'{instance.project.project_code} – {instance.project.project_name}' "
            f"was due on {instance.planned_completion_date.strftime('%b %d, %Y')} "
            f"and is {days_overdue} day{'s' if days_overdue != 1 else ''} overdue."
        ),
        is_read=False
    )