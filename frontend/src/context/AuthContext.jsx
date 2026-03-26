import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      await api.get("auth/csrf/");
      const response = await api.get("auth/me/");
      setUser(response.data);
      setUserRole(response.data.effective_role);
    } catch {
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    await api.get("auth/csrf/");
    const response = await api.post("auth/login/", { email, password });
    setUser(response.data);
    setUserRole(response.data.effective_role);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("auth/logout/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setUserRole(null);
    }
  };

  const register = async (userData) => {
    await api.get("auth/csrf/");
    const response = await api.post("auth/register/", userData);
    setUser(response.data);
    setUserRole(response.data.effective_role);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, logout, register, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};