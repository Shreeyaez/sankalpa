from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_admin(user):
    return user.is_authenticated and user.role == "ADMIN"


def is_finance(user):
    return hasattr(user, "financeperson_profile")


def is_engineer(user):
    return hasattr(user, "engineer_profile")


def is_chairperson(user):
    return hasattr(user, "chairperson_profile")

class GlobalRBACPermission(BasePermission):
    """
    Global permission rule:

    IF user has scoped access → full CRUD
    ELSE → read-only
    """

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        # ADMIN → full CRUD
        if is_admin(user):
            return True

        # Engineer or Chairperson → allow endpoint access
        if is_engineer(user) or is_chairperson(user):
            return True

        # Normal user → read-only
        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        user = request.user

        # ADMIN → full CRUD
        if is_admin(user):
            return True

        # READ access always allowed
        if request.method in SAFE_METHODS:
            return True

        # Engineer access
        if is_engineer(user):
            engineer = user.engineer_profile

            # Must belong to assigned project
            if hasattr(obj, "project"):
                if obj.project.assigned_engineer != engineer:
                    return False
            elif hasattr(obj, "assigned_engineer"):
                if obj.assigned_engineer != engineer:
                    return False

            # Role-specific model access
            if engineer.role == "ENGINEER":
                return view.basename in [
                    "milestone", "road", "weekly-logs", "delay-logs",
                ]

            if engineer.role == "SUPERVISOR":
                return view.basename in [
                    "milestone", "road", "weekly-logs", "delay-logs", "alerts",
                ]

        # Chairperson access
        if is_chairperson(user):
            chair = user.chairperson_profile

            if hasattr(obj, "project"):
                if obj.project.chairperson != chair:
                    return False
            elif hasattr(obj, "chairperson"):
                if obj.chairperson != chair:
                    return False

            return view.basename in [
                "project", "milestone", "road", "weekly-logs", "delay-logs", "alerts",
            ]

        # Default → read-only
        return False

class FinanceRBAC(BasePermission):
    """
    FinancePerson → full CRUD in finance app
    Others → read-only
    """

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        if is_admin(user):
            return True

        if is_finance(user):
            return True

        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        user = request.user

        if is_admin(user):
            return True

        if is_finance(user):
            return True

        return request.method in SAFE_METHODS

class AuditRBAC(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        if is_admin(user):
            return True

        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)
