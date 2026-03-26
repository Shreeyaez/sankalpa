import { useAuth } from "../context/AuthContext";
import { isAdmin, canWrite, getRole, ROLES } from "./roles";

const Can = ({
  children,
  fallback = null,
  adminOnly = false,
  writeOnly = false,
  module = null,
}) => {
  const { userRole } = useAuth();

  // Create a fake user object for helper functions
  const user = { effective_role: userRole };

  if (!userRole) return fallback;
  if (adminOnly && !isAdmin(user)) return fallback;
  if (writeOnly && !canWrite(user)) return fallback;

  return children;
};

export default Can;