from rest_framework.viewsets import ModelViewSet
from .models import Road
from .serializers import RoadSerializer
from apps.accounts.permissions import GlobalRBACPermission

class RoadViewSet(ModelViewSet):
    queryset = Road.objects.all()
    serializer_class = RoadSerializer
    permission_classes = [GlobalRBACPermission]

