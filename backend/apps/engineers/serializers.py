from rest_framework import serializers
from .models import Engineer
from apps.accounts.models import Account
from apps.accounts.serializers import AccountSerializer


class EngineerSerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=True)
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), source="account", write_only=True
    )

    class Meta:
        model = Engineer
        fields = ["id", "account", "account_id", "ward_no", "role", "is_active"]