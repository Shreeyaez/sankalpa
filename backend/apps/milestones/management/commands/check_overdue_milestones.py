from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.milestones.models import Milestone
from apps.alerts.models import Alert
from apps.lookups.models import AlertType


class Command(BaseCommand):
    help = "Check all milestones and create alerts for overdue ones"

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        alert_type, _ = AlertType.objects.get_or_create(name="Milestone Overdue")

        # ── Step 1: Resolve alerts for completed milestones OR cancelled projects ──
        completed_milestones = Milestone.objects.filter(
            is_completed=True
        )
        cancelled_project_milestones = Milestone.objects.filter(
            project__status="CANCELLED"
        )

        resolved = Alert.objects.filter(
            milestone__in=completed_milestones | cancelled_project_milestones,
            alert_type=alert_type,
            is_read=False
        ).update(is_read=True)

        if resolved:
            self.stdout.write(f"  ✅ Resolved {resolved} alerts for completed/cancelled milestones.")

        # ── Step 2: Create alerts for overdue incomplete milestones ──────────
        overdue = Milestone.objects.filter(
            is_completed=False,
            planned_completion_date__lt=today,
        ).exclude(
            project__status="CANCELLED"
        ).select_related("project")

        created = 0
        skipped = 0

        for milestone in overdue:
            already_exists = Alert.objects.filter(
                milestone=milestone,
                alert_type=alert_type,
                is_read=False
            ).exists()

            if already_exists:
                skipped += 1
                continue

            days_overdue = (today - milestone.planned_completion_date).days

            Alert.objects.create(
                alert_type=alert_type,
                project=milestone.project,
                milestone=milestone,
                message=(
                    f"Milestone '{milestone.milestone_name}' in project "
                    f"'{milestone.project.project_code} – {milestone.project.project_name}' "
                    f"was due on {milestone.planned_completion_date.strftime('%b %d, %Y')} "
                    f"and is {days_overdue} day{'s' if days_overdue != 1 else ''} overdue."
                ),
                is_read=False
            )
            created += 1
            self.stdout.write(f"  ⚠️  Alert created: {milestone.milestone_name} ({days_overdue}d overdue)")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created} alerts created, {skipped} already existed, {resolved} resolved."
            )
        )