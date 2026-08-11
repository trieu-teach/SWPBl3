import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../../api/auth.api";
import {
  clearStoredAuthToken,
  setStoredAuthToken,
} from "../../lib/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    function handleUnauthorized() {
      clearStoredAuthToken();
      setUser(null);
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const handleLogin = useCallback(async (payload) => {
    const response = await authApi.login(payload);
    if (response?.token) setStoredAuthToken(response.token);
    setUser(response.user || response);
    setIsLoading(false);
    return response.user || response;
  }, []);

  const handleRegister = useCallback(async (payload) => {
    return authApi.register(payload);
  }, []);

  const handleLogout = useCallback(async () => {
    clearStoredAuthToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshUser,
    }),
    [handleLogin, handleLogout, handleRegister, refreshUser, isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
