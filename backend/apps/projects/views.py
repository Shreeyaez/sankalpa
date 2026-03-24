from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Project, PastProjectRecord
from .serializers import ProjectSerializer, PastProjectRecordSerializer
from apps.accounts.permissions import GlobalRBACPermission


class ProjectViewSet(ModelViewSet):
    """
    ViewSet for Project CRUD operations.
    Ensures nested relationship data is loaded efficiently.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [GlobalRBACPermission]
    
    def get_queryset(self):
        """
        Optimize queryset with select_related to avoid N+1 queries.
        This ensures nested serializer data is available in both list and detail views.
        """
        return Project.objects.select_related(
            'assigned_engineer',
            'assigned_engineer__account',
            'chairperson',
            'chairperson__account',
            'contractor',
            'budget_source',
            'fiscal_year'
        ).all()
    
    @action(detail=False, methods=['get'])
    def cancelled(self, request):
        """Get all cancelled projects"""
        cancelled = self.get_queryset().filter(status='CANCELLED')
        serializer = self.get_serializer(cancelled, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def ongoing(self, request):
        """Get all ongoing projects"""
        ongoing = self.get_queryset().filter(status='ONGOING')
        serializer = self.get_serializer(ongoing, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def delayed(self, request):
        """Get all delayed projects"""
        delayed = self.get_queryset().filter(status='DELAYED')
        serializer = self.get_serializer(delayed, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get all completed projects"""
        completed = self.get_queryset().filter(status='COMPLETED')
        serializer = self.get_serializer(completed, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a project"""
        project = self.get_object()
        project.status = 'CANCELLED'
        project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a cancelled project"""
        project = self.get_object()
        project.status = 'ONGOING'
        project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)


class PastProjectRecordViewSet(ModelViewSet):
    queryset = PastProjectRecord.objects.all()
    serializer_class = PastProjectRecordSerializer
    permission_classes = [IsAuthenticated, GlobalRBACPermission]