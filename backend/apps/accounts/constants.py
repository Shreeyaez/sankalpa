from enum import Enum


class UserRoles(Enum):
    """
    User role constants for the application.
    """

    ENGINEER = "Engineer"
    CHAIRPERSON = "Chairperson"
    FINANCE = "Finance"
    ADMIN = "Admin"
    USER = "User"

    @classmethod
    def choices(cls):
        """Return choices for Django model field"""
        return [(role.name, role.value) for role in cls]
