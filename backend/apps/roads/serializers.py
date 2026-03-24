from rest_framework import serializers
from .models import Road


class RoadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Road
        fields = "__all__"
