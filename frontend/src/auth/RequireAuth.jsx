import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isFinanceOnly } from "../constants/userRoles.jsx";

export default function RequireAuth({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Finance users: only allow /app/finance — block everything else
  // Don't redirect if already on /app/finance (prevents loop)
  if (isFinanceOnly(userRole)) {
    if (!location.pathname.startsWith("/app/finance")) {
      return <Navigate to="/app/finance" replace />;
    }
    // They're on /app/finance — let allowedRoles check handle it below
  }

  // Role not in allowed list → send to dashboard (not login, to avoid loops)
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}