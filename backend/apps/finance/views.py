from rest_framework.viewsets import ModelViewSet
from .models import MeasurementBook, Material, AbstractCost
from .serializers import (
    MeasurementBookSerializer,
    MaterialSerializer,
    AbstractCostSerializer,
)
from apps.accounts.permissions import FinanceRBAC

class MeasurementBookViewSet(ModelViewSet):
    serializer_class = MeasurementBookSerializer
    queryset = MeasurementBook.objects.all()
    permission_classes = [FinanceRBAC]

    def get_queryset(self):
        """Filter by project if ?project=ID is provided"""
        qs = MeasurementBook.objects.prefetch_related('items').all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs.order_by('-date')


class MaterialViewSet(ModelViewSet):
    serializer_class = MaterialSerializer
    queryset = Material.objects.all()
    permission_classes = [FinanceRBAC]

    def get_queryset(self):
        """Filter by project if ?project=ID is provided"""
        qs = Material.objects.prefetch_related('items').all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs.order_by('-date')


class AbstractCostViewSet(ModelViewSet):
    serializer_class = AbstractCostSerializer
    queryset = AbstractCost.objects.all()
    permission_classes = [FinanceRBAC]
    
    def get_queryset(self):
        """Filter by project if ?project=ID is provided"""
        qs = AbstractCost.objects.prefetch_related('items').all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs.order_by('-date')