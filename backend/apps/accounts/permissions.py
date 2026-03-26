from rest_framework.permissions import BasePermission, SAFE_METHODS

def get_role(user):
    if not user or not user.is_authenticated:
        return None
    return getattr(user, "effective_role", None)

def is_admin(user):       return get_role(user) == "ADMIN"
def is_engineer(user):    return get_role(user) == "ENGINEER"
def is_chairperson(user): return get_role(user) == "CHAIRPERSON"
def is_finance(user):     return get_role(user) == "FINANCE"


class GlobalRBACPermission(BasePermission):
    """
    ADMIN       → full CRUD everywhere
    ENGINEER    → full CRUD on all main app
    CHAIRPERSON → read-only on projects, contractors, delay-logs ONLY
                  blocked from measurement, abstract, materials, weekly-logs
    FINANCE     → blocked from main app
    USER        → read-only fallback
    """

    # Views chairperson is BLOCKED from entirely
    CHAIRPERSON_BLOCKED_VIEWS = [
        "measurementbook",
        "material",
        "abstractcost",
        "weeklylog",
        "delaylog",
        "engineer",
        "financeperson",
    ]

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        role = get_role(user)

        if role == "ADMIN":
            return True

        if role == "ENGINEER":
            return True

        if role == "CHAIRPERSON":
            # Block specific views entirely
            view_name = getattr(view, "basename", "").lower()
            if view_name in self.CHAIRPERSON_BLOCKED_VIEWS:
                return False
            return request.method in SAFE_METHODS

        if role == "FINANCE":
            return False

        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = get_role(user)

        if role == "ADMIN":    return True
        if role == "ENGINEER": return True

        if role == "CHAIRPERSON":
            view_name = getattr(view, "basename", "").lower()
            if view_name in self.CHAIRPERSON_BLOCKED_VIEWS:
                return False
            return request.method in SAFE_METHODS

        return request.method in SAFE_METHODS


class AuditRBAC(BasePermission):
    """
    ADMIN + CHAIRPERSON → read-only
    Others → blocked
    """
    def has_permission(self, request, view):
        role = get_role(request.user)
        if role == "ADMIN":
            return True
        if role == "CHAIRPERSON":
            return request.method in SAFE_METHODS
        return False

    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)
        if role == "ADMIN":
            return True
        if role == "CHAIRPERSON":
            return request.method in SAFE_METHODS
        return False


class FinanceRBAC(BasePermission):
    """
    FINANCE + ADMIN → full CRUD
    Others → blocked
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        role = get_role(request.user)
        return role in ("ADMIN", "FINANCE")

    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)
        return role in ("ADMIN", "FINANCE")