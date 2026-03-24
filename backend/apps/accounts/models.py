from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class AccountManager(BaseUserManager):
    def create_user(self, email, full_name, user_id, password=None, role="USER"):
        if not email:
            raise ValueError("Email address is required")
        if not user_id:
            raise ValueError("User ID is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            full_name=full_name,
            user_id=user_id,
            role=role,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, user_id, password):
        user = self.create_user(
            email=email,
            full_name=full_name,
            user_id=user_id,
            password=password,
            role="ADMIN",
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class Account(AbstractBaseUser, PermissionsMixin):
    """
    Core authentication model.
    Roles: ADMIN, USER
    """

    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("USER", "User"),
    )

    user_id = models.CharField(
        max_length=50,
        unique=True
    )

    full_name = models.CharField(
        max_length=150
    )

    email = models.EmailField(
        unique=True
    )

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="USER"
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AccountManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "user_id"]

    class Meta:
        db_table = "accounts"
        verbose_name = "Account"
        verbose_name_plural = "Accounts"

    def __str__(self):
        return f"{self.full_name} ({self.email})"
