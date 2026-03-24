from rest_framework.viewsets import ModelViewSet
from .models import DelayLog, WeeklyLog
from .serializers import DelayLogSerializer, WeeklyLogSerializer
from apps.accounts.permissions import GlobalRBACPermission

class WeeklyLogViewSet(ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    permission_classes = [GlobalRBACPermission]
    
    def get_queryset(self):
        """
        Filter weekly logs by project ID from query params
        """
        queryset = WeeklyLog.objects.all()
        project_id = self.request.query_params.get('project', None)
        
        if project_id is not None:
            queryset = queryset.filter(project=project_id)
        
        return queryset.order_by('-log_date')


class DelayLogViewSet(ModelViewSet):
    queryset = DelayLog.objects.all()
    serializer_class = DelayLogSerializer
    permission_classes = [GlobalRBACPermission]
    
    def get_queryset(self):
        """
        Filter delay logs by project ID from query params
        """
        queryset = DelayLog.objects.all()
        project_id = self.request.query_params.get('project', None)
        
        if project_id is not None:
            queryset = queryset.filter(project=project_id)
        
        return queryset.order_by('-log_date')