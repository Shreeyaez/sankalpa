/**
 * User role constants for the application.
 * These should match the backend UserRoles enum values.
 */
export const USER_ROLES = {
  ADMIN: "Admin",
  USER: "User",
  ENGINEER: "Engineer",
  CHAIRPERSON: "Chairperson",
  FINANCE: "Finance",
};

/**
 * Get all user role values as an array
 */
export const getAllUserRoles = () => Object.values(USER_ROLES);

/**
 * Check if a role is valid
 */
export const isValidRole = (role) => Object.values(USER_ROLES).includes(role);
