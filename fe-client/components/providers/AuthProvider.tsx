"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { refreshAccessToken, type AuthUser } from "@/components/services/auth.services";

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  showLoginModal: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  requireAuth: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): { id: string; exp: number } | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const setAuth = useCallback((newUser: AuthUser, token: string) => {
    setUser(newUser);
    setAccessToken(token);
    setShowLoginModal(false);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    Cookies.remove("accessToken");
  }, []);

  const openLoginModal = useCallback(() => setShowLoginModal(true), []);
  const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

  const requireAuth = useCallback((): boolean => {
    if (user && accessToken) return true;
    setShowLoginModal(true);
    return false;
  }, [user, accessToken]);

  /**
   * refresh user profile
   */
  const refreshUser = useCallback(async () => {
    const result = await refreshAccessToken();

    if (result.success && result.user && result.accessToken) {
      setUser(result.user);
      setAccessToken(result.accessToken);
    }
  }, []);

  /**
   * init auth when load app
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get("accessToken");

      if (token) {
        const payload = decodeToken(token);

        if (payload && payload.exp * 1000 > Date.now()) {
          setAccessToken(token);

          const result = await refreshAccessToken();

          if (result.success && result.user && result.accessToken) {
            setUser(result.user);
            setAccessToken(result.accessToken);
          }

          setLoading(false);
          return;
        }
      }

      const result = await refreshAccessToken();

      if (result.success && result.user && result.accessToken) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        showLoginModal,
        setAuth,
        clearAuth,
        openLoginModal,
        closeLoginModal,
        requireAuth,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}