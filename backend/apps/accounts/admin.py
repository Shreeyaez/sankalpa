from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Account


@admin.register(Account)
class AccountAdmin(UserAdmin):
    model = Account

    # Fields shown when EDITING a user
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name", "user_id")}),
        ("Roles", {"fields": ("role", "sub_role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Important Dates", {"fields": ("last_login",)}),
    )

    # Fields shown when CREATING a new user
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email", "full_name", "user_id",
                "password1", "password2",
                "role", "sub_role",
                "is_active", "is_staff",
            ),
        }),
    )

    list_display  = ("email", "full_name", "user_id", "role", "sub_role", "is_active")
    list_filter   = ("role", "sub_role", "is_active")
    search_fields = ("email", "full_name", "user_id")
    ordering      = ("email",)

    # Tell Django to use email instead of username
    USERNAME_FIELD = "email"