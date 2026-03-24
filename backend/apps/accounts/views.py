from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    AccountSerializer,
)


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token(request):
    """
    Explicitly set CSRF cookie and return the token.
    This endpoint should be called before any POST/PUT/DELETE requests.
    """
    token = get_token(request)
    response = Response({"detail": "CSRF cookie set"})
    return response


class RegisterView(APIView):
    """
    Register a new user account.
    No authentication required.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Automatically log in the user after registration
        login(request, user)
        
        return Response(
            AccountSerializer(user).data,
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """
    Login with email and password.
    Returns user data and sets session cookie.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        login(request, user)

        return Response(
            AccountSerializer(user).data,
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    Logout the current user.
    Clears session cookie.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(
            {"detail": "Successfully logged out"},
            status=status.HTTP_200_OK
        )


class MeView(APIView):
    """
    Get current authenticated user information.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            AccountSerializer(request.user).data,
            status=status.HTTP_200_OK
        )