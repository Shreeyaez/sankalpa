from rest_framework import viewsets
from .models import (
    PriorityLevel,
    ProjectType,
    RoadType,
    DelayType,
    AlertType,
    BudgetSource,
    FiscalYear,
)
from .serializers import (
    PriorityLevelSerializer,
    ProjectTypeSerializer,
    RoadTypeSerializer,
    DelayTypeSerializer,
    AlertTypeSerializer,
    BudgetSourceSerializer,
    FiscalYearSerializer,
)
from apps.accounts.permissions import GlobalRBACPermission

class PriorityLevelViewSet(viewsets.ModelViewSet):
    queryset = PriorityLevel.objects.all()
    serializer_class = PriorityLevelSerializer
    permission_classes = [GlobalRBACPermission]


class ProjectTypeViewSet(viewsets.ModelViewSet):
    queryset = ProjectType.objects.all()
    serializer_class = ProjectTypeSerializer
    permission_classes = [GlobalRBACPermission]

class RoadTypeViewSet(viewsets.ModelViewSet):
    queryset = RoadType.objects.all()
    serializer_class = RoadTypeSerializer
    permission_classes = [GlobalRBACPermission]

class DelayTypeViewSet(viewsets.ModelViewSet):
    queryset = DelayType.objects.all()
    serializer_class = DelayTypeSerializer
    permission_classes = [GlobalRBACPermission]


class AlertTypeViewSet(viewsets.ModelViewSet):
    queryset = AlertType.objects.all()
    serializer_class = AlertTypeSerializer
    permission_classes = [GlobalRBACPermission]

class BudgetSourceViewSet(viewsets.ModelViewSet):
    queryset = BudgetSource.objects.all()
    serializer_class = BudgetSourceSerializer
    permission_classes = [GlobalRBACPermission]


class FiscalYearViewSet(viewsets.ModelViewSet):
    queryset = FiscalYear.objects.all()
    serializer_class = FiscalYearSerializer
    permission_classes = [GlobalRBACPermission]
