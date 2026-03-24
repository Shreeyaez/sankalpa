from rest_framework import serializers
from .models import (
    PriorityLevel,
    ProjectType,
    BudgetSource,
    FiscalYear,
    RoadType,
    DelayType,
    AlertType
)


class PriorityLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriorityLevel
        fields = "__all__"


class ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectType
        fields = "__all__"


class BudgetSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetSource
        fields = "__all__"


class FiscalYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiscalYear
        fields = "__all__"


class RoadTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadType
        fields = "__all__"


class DelayTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DelayType
        fields = "__all__"


class AlertTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertType
        fields = "__all__"