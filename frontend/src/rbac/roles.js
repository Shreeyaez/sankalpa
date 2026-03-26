export const ROLES = {
  ADMIN:       "ADMIN",
  ENGINEER:    "ENGINEER",
  CHAIRPERSON: "CHAIRPERSON",
  FINANCE:     "FINANCE",
  USER:        "USER",
};

// Use effective_role directly from user object
export const getRole    = (user) => user?.effective_role || "USER";
export const isAdmin    = (user) => getRole(user) === "ADMIN";
export const isEngineer = (user) => getRole(user) === "ENGINEER";
export const isChairperson = (user) => getRole(user) === "CHAIRPERSON";
export const isFinance  = (user) => getRole(user) === "FINANCE";

// Can write = Admin or Engineer only
export const canWrite = (user) =>
  [ROLES.ADMIN, ROLES.ENGINEER].includes(getRole(user));

// Can access a module
export const canAccessModule = (user, module) => {
  const role = getRole(user);
  if (role === ROLES.ADMIN)    return true;
  if (role === ROLES.ENGINEER) return true;      // engineer: full access to main app
  if (role === ROLES.CHAIRPERSON) return true;   // chairperson: view-only, but can access all pages
  return false;
};