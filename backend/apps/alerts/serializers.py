from rest_framework import serializers
from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    # Nested read-only details so frontend gets names not just IDs
    project_code    = serializers.CharField(source="project.project_code",    read_only=True, default=None)
    project_name    = serializers.CharField(source="project.project_name",    read_only=True, default=None)
    milestone_name  = serializers.CharField(source="milestone.milestone_name", read_only=True, default=None)
    milestone_due   = serializers.DateField(source="milestone.planned_completion_date", read_only=True, default=None)
    alert_type_name = serializers.CharField(source="alert_type.name",         read_only=True, default=None)

    class Meta:
        model  = Alert
        fields = [
            "id",
            "alert_type",
            "alert_type_name",
            "project",
            "project_code",
            "project_name",
            "milestone",
            "milestone_name",
            "milestone_due",
            "message",
            "is_read",
            "created_at",
        ]