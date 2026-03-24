from rest_framework.viewsets import ModelViewSet
from .models import Chairperson
from .serializers import ChairpersonSerializer
from apps.accounts.permissions import GlobalRBACPermission

class ChairpersonViewSet(ModelViewSet):
    queryset = Chairperson.objects.all()
    serializer_class = ChairpersonSerializer
    prmission_classes = [GlobalRBACPermission]