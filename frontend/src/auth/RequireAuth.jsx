import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#062A4D] to-[#0C3F6E]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role (if roles are specified)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User doesn't have permission - redirect to login or show unauthorized page
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and has required role - render children
  return children;
}