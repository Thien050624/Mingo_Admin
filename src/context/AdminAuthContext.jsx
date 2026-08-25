import { createContext, useContext, useEffect, useState } from "react";
import * as adminApi from "../api/admin";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, SESSION_EXPIRED_EVENT } from "../api/client";

const AdminAuthContext = createContext(null);

function toAdmin(profile) {
  return {
    id: profile.id,
    name: profile.displayName || profile.email,
    email: profile.email,
    avatar: profile.avatarUrl || "",
    role: profile.role,
  };
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .getMe()
      .then((profile) => {
        if (profile.role !== "ADMIN") {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          setAdmin(null);
          return;
        }
        setAdmin(toAdmin(profile));
      })
      .catch(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onSessionExpired = () => setAdmin(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  const loginWithTokens = async (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    const profile = await adminApi.getMe();
    if (profile.role !== "ADMIN") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      throw new Error("Tài khoản này không có quyền quản trị");
    }
    const mapped = toAdmin(profile);
    setAdmin(mapped);
    return mapped;
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, loginWithTokens, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
