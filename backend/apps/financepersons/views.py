from rest_framework.viewsets import ModelViewSet
from .models import Financeperson
from .serializers import FinancepersonSerializer
from apps.accounts.permissions import GlobalRBACPermission

class FinancepersonViewSet(ModelViewSet):
    queryset = Financeperson.objects.all()
    serializer_class = FinancepersonSerializer
    permission_classes = [GlobalRBACPermission]