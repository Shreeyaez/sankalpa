from rest_framework.viewsets import ModelViewSet
from .models import Contractor
from .serializers import ContractorSerializer
from apps.accounts.permissions import GlobalRBACPermission

class ContractorViewSet(ModelViewSet):
    queryset = Contractor.objects.all()
    serializer_class = ContractorSerializer
    permission_classes = [GlobalRBACPermission]