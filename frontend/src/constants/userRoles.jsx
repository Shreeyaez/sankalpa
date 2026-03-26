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

export const canViewAudit = (role) =>
  [ROLES.ADMIN, ROLES.CHAIRPERSON].includes(role);

export const canViewOfficials = (role) =>
  [ROLES.ADMIN, ROLES.ENGINEER].includes(role);

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
