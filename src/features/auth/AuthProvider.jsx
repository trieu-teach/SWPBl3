import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../../api/auth.api";
import {
  clearStoredAuthToken,
  setStoredAuthToken,
} from "../../lib/http";
import {
  signUpEmailPassword,
  signInEmailPassword,
  signInGoogle as serviceSignInGoogle,
  logout as serviceLogout,
} from "../../lib/authService";

const AuthContext = createContext(null);

function extractUser(data) {
  if (!data || typeof data !== "object") return null;
  const baseUser = data.user && typeof data.user === "object" ? data.user : data;
  if (!baseUser) return null;
  return {
    ...baseUser,
    role: baseUser.role || data.role || "USER",
    permissions: data.permissions || baseUser.permissions || [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.getCurrentUser();
      const userData = extractUser(data);
      setUser(userData);
      return userData;
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

  // Email/password sign up — returns { email, needsVerification }
  const handleSignUp = useCallback(async ({ email, password, fullName, acceptedTerms }) => {
    return signUpEmailPassword({ email, password, fullName, acceptedTerms });
  }, []);

  // Email/password sign in
  const handleSignIn = useCallback(async ({ email, password }) => {
    const data = await signInEmailPassword({ email, password });
    const userData = extractUser(data);
    setUser(userData);
    return userData;
  }, []);

  // Google sign-in (handles register-then-login)
  const handleSignInGoogle = useCallback(async ({ fullName, acceptedTerms } = {}) => {
    const data = await serviceSignInGoogle({ fullName, acceptedTerms });
    const userData = extractUser(data);
    setUser(userData);
    return userData;
  }, []);

  // Backwards-compat aliases
  const handleRegisterWithFirebase = useCallback(
    async ({ idToken, fullName, acceptedTerms }) => {
      const data = await authApi.registerWithFirebase({
        idToken,
        fullName,
        acceptedTerms,
      });
      return extractUser(data);
    },
    []
  );

  const handleLoginWithFirebase = useCallback(async (idToken) => {
    const data = await authApi.loginWithFirebaseToken({ idToken });
    if (data?.accessToken) {
      setStoredAuthToken(data.accessToken);
    }
    const userData = extractUser(data);
    setUser(userData);
    return userData;
  }, []);

  const handleLogout = useCallback(async () => {
    await serviceLogout();
    clearStoredAuthToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signUp: handleSignUp,
      signIn: handleSignIn,
      signInGoogle: handleSignInGoogle,
      registerWithFirebase: handleRegisterWithFirebase,
      loginWithFirebase: handleLoginWithFirebase,
      logout: handleLogout,
      refreshUser,
      setUser,
    }),
    [
      handleSignUp,
      handleSignIn,
      handleSignInGoogle,
      handleRegisterWithFirebase,
      handleLoginWithFirebase,
      handleLogout,
      refreshUser,
      isLoading,
      user,
    ]
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