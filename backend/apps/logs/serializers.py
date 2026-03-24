from rest_framework import serializers
from .models import WeeklyLog, DelayLog


class WeeklyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyLog
        fields = "__all__"


class DelayLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DelayLog
        fields = "__all__"