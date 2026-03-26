export const ROLES = {
  ADMIN:       "ADMIN",
  ENGINEER:    "ENGINEER",
  CHAIRPERSON: "CHAIRPERSON",
  FINANCE:     "FINANCE",
  USER:        "USER",
};

export const getAllUserRoles = () => Object.values(ROLES);

export const canEdit = (role) =>
  [ROLES.ADMIN, ROLES.ENGINEER].includes(role);

// Audit — Admin + Chairperson only (NOT engineer)
export const canViewAudit = (role) =>
  [ROLES.ADMIN, ROLES.CHAIRPERSON].includes(role);

// Officials — Admin only (NOT engineer, NOT chairperson)
export const canViewOfficials = (role) =>
  role === ROLES.ADMIN;

export const isFinanceOnly = (role) =>
  role === ROLES.FINANCE;

export const isChairperson = (role) =>
  role === ROLES.CHAIRPERSON;

export const isAdminRole = (role) =>
  role === ROLES.ADMIN;

export const isEngineerRole = (role) =>
  role === ROLES.ENGINEER;

export const canAccessModule = (role, module) => {
  if (role === ROLES.ADMIN || role === ROLES.ENGINEER) return true;
  if (role === ROLES.CHAIRPERSON) {
    const blocked = ["measurement", "abstract", "materials", "weekly-logs", "delay-logs"];
    return !blocked.includes(module);
  }
  return false;
};