from rest_framework.viewsets import ModelViewSet
from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.accounts.permissions import AuditRBAC

class AuditLogViewSet(ModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [AuditRBAC]

