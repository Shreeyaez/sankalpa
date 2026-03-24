from rest_framework.viewsets import ModelViewSet
from .models import Location
from .serializers import LocationSerializer
from apps.accounts.permissions import GlobalRBACPermission

class LocationViewSet(ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [GlobalRBACPermission]
