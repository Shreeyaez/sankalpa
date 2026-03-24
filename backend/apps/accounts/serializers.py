from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Account
# from .constants import UserRoles


class AccountSerializer(serializers.ModelSerializer):
    """
    Serializer for Account model.
    Used for returning user data after login/register.
    """
    # role = serializers.SerializerMethodField()
    
    class Meta:
        model = Account
        fields = [
            "id",
            "user_id",
            "full_name",
            "email",
            "role",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    # def get_role(self, obj):
    #     """
    #     Return specific role based on related profiles.
    #     Checks for engineer, chairperson, or financeperson profiles.
    #     """
    #     if hasattr(obj, "engineer_profile"):
    #         return UserRoles.ENGINEER.value
    #     if hasattr(obj, "chairperson_profile"):
    #         return UserRoles.CHAIRPERSON.value
    #     if hasattr(obj, "financeperson_profile"):
    #         return UserRoles.FINANCE.value
    #     # Convert database role to display format
    #     if obj.role == "ADMIN":
    #         return UserRoles.ADMIN.value
    #     return UserRoles.USER.value


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Handles password validation and user creation.
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )

    class Meta:
        model = Account
        fields = ["user_id", "full_name", "email", "password", "role"]

    def validate_email(self, value):
        """Check if email already exists"""
        if Account.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_user_id(self, value):
        """Check if user_id already exists"""
        if Account.objects.filter(user_id=value).exists():
            raise serializers.ValidationError("User ID already exists")
        return value

    def create(self, validated_data):
        """Create new user with hashed password"""
        return Account.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            user_id=validated_data["user_id"],
            password=validated_data["password"],
            role=validated_data.get("role", "USER"),
        )


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Validates email and password.
    """
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, data):
        """
        Authenticate user with email and password.
        Returns user object if valid.
        """
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required")

        # Authenticate without request context
        user = authenticate(
            username=email,  # Django's authenticate uses 'username' parameter
            password=password
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        data["user"] = user
        return data