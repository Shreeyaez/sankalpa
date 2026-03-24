from rest_framework import serializers
from .models import Financeperson
from apps.accounts.models import Account
from apps.accounts.serializers import AccountSerializer


class FinancepersonSerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=True)
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), source="account", write_only=True
    )

    class Meta:
        model = Financeperson
        fields = ["id", "account", "account_id"]