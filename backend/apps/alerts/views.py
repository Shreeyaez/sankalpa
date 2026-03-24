from rest_framework.viewsets import ModelViewSet
from django.utils import timezone
from .models import Alert
from .serializers import AlertSerializer
from apps.milestones.models import Milestone
from apps.lookups.models import AlertType


def create_overdue_alerts():
    today = timezone.now().date()
    alert_type, _ = AlertType.objects.get_or_create(name="Overdue Milestone")

    overdue = Milestone.objects.filter(
        is_completed=False,
        planned_completion_date__lt=today,
    ).select_related("project")

    for milestone in overdue:
        Alert.objects.get_or_create(
            milestone=milestone,
            alert_type=alert_type,
            defaults={
                "project": milestone.project,
                "message": (
                    f"Milestone '{milestone.milestone_name}' in project "
                    f"'{milestone.project.project_name}' "
                    f"({milestone.project.project_code}) is overdue by "
                    f"{(today - milestone.planned_completion_date).days} day(s)."
                ),
                "is_read": False,
            }
        )
from apps.accounts.permissions import GlobalRBACPermission

class AlertViewSet(ModelViewSet):
    queryset = Alert.objects.all()       # ← keep this for the router
    serializer_class = AlertSerializer
    permission_classes = [GlobalRBACPermission]

    def get_queryset(self):
        create_overdue_alerts()          # ← auto-check on every fetch
        return Alert.objects.all()