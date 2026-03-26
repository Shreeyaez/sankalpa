from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Account


class AccountSerializer(serializers.ModelSerializer):
    effective_role = serializers.CharField(read_only=True)

    class Meta:
        model = Account
        fields = [
            "id",
            "user_id",
            "full_name",
            "email",
            "role",
            "sub_role",
            "effective_role",   # ← add this
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "effective_role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Account
        fields = ["user_id", "full_name", "email", "password", "role", "sub_role"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Account(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        data["user"] = user
        return data