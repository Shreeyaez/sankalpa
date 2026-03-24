from decimal import Decimal
from django.db.models import Sum
from rest_framework.viewsets import ModelViewSet

from .models import Milestone
from .serializers import MilestoneSerializer
from apps.accounts.permissions import GlobalRBACPermission


class MilestoneViewSet(ModelViewSet):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer
    permission_classes = [GlobalRBACPermission]

    def get_queryset(self):
        queryset = Milestone.objects.all()
        project_id = self.request.query_params.get('project', None)

        if project_id is not None:
            queryset = queryset.filter(project=project_id)

        return queryset.order_by('milestone_order')

    # 🔥 CORE LOGIC
    def update_project_status(self, project):
        """
        Update project status based on milestone completion + date logic.
        """
        total_weight = project.milestones.aggregate(
            total=Sum("weight")
        )["total"] or Decimal("0")

        completed_weight = project.milestones.filter(
            is_completed=True
        ).aggregate(total=Sum("weight"))["total"] or Decimal("0")

        # 🎯 If fully completed → mark COMPLETED
        if total_weight > 0 and completed_weight == total_weight:
            if project.status != "COMPLETED":
                project.status = "COMPLETED"
                project.save(update_fields=["status"])
            return

        # Otherwise use normal date-based logic
        project.update_status()

    # When milestone created
    def perform_create(self, serializer):
        milestone = serializer.save()
        self.update_project_status(milestone.project)

    # When milestone updated (like toggling is_completed)
    def perform_update(self, serializer):
        milestone = serializer.save()
        self.update_project_status(milestone.project)

    #  FIXED: When milestone deleted
    def perform_destroy(self, instance):
        project_id = instance.project_id  # Store just the ID
        instance.delete()  # Delete the milestone
        
        # Re-fetch project from DB after deletion to avoid stale object issues
        from apps.projects.models import Project
        try:
            project = Project.objects.get(id=project_id)
            self.update_project_status(project)
        except Project.DoesNotExist:
            # Project was deleted independently, nothing to update
            pass