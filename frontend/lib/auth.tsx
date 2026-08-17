"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, setToken, ApiError } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getUser();
      setUser(currentUser);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      return response.user;
    },
    [],
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      phone?: string;
    }) => {
      const response = await authApi.register(data);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    },
    [],
  );

  const logout = useCallback(async () => {
  try {
    await authApi.logout();
  } catch {
    // Ignore backend logout failure.
  } finally {
    setToken(null);
    setUser(null);
    router.replace("/login");
  }
}, [router]);
  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useRequireAuth(redirectTo = "/login"): {
  user: User | null;
  loading: boolean;
} {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`);
    }
  }, [auth.loading, auth.isAuthenticated, router, redirectTo]);

  return { user: auth.user, loading: auth.loading };
}

export function useRequireAdmin(): {
  user: User | null;
  loading: boolean;
} {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.isAuthenticated) {
      router.replace("/login?redirect=/admin");
      return;
    }
    if (!auth.isAdmin) {
      router.replace("/");
    }
  }, [auth.loading, auth.isAuthenticated, auth.isAdmin, router]);

  return { user: auth.user, loading: auth.loading };
}
