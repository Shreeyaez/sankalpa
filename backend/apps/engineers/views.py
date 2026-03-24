from rest_framework.viewsets import ModelViewSet
from .models import Engineer
from .serializers import EngineerSerializer
from apps.accounts.permissions import GlobalRBACPermission

class EngineerViewSet(ModelViewSet):
    queryset = Engineer.objects.select_related("account").all()
    serializer_class = EngineerSerializer
    permission_classes = [GlobalRBACPermission]