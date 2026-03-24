from rest_framework import serializers
from .models import Chairperson
from apps.accounts.models import Account
from apps.accounts.serializers import AccountSerializer


class ChairpersonSerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=True)
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), source="account", write_only=True
    )

    class Meta:
        model = Chairperson
        fields = ["id", "account", "account_id", "term_start", "term_end"]