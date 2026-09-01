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
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  authApi,
  setToken,
} from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<User>;

  googleLogin: (
    idToken: string
  ) => Promise<{
    user: User;
    isNewUser: boolean;
  }>;

  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) => Promise<User>;

  setPassword: (data: {
    password: string;
    password_confirmation: string;
  }) => Promise<User>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

/*
|--------------------------------------------------------------------------
| Auth Provider
|--------------------------------------------------------------------------
*/

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | Refresh Current User
  |--------------------------------------------------------------------------
  */

  const refreshUser = useCallback(async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser =
        await authApi.getUser();

      setUser(currentUser);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Restore Authentication
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /*
  |--------------------------------------------------------------------------
  | Email / Password Login
  |--------------------------------------------------------------------------
  */

  const login = useCallback(
    async (
      email: string,
      password: string
    ) => {
      const response =
        await authApi.login({
          email,
          password,
        });

      setToken(response.token);

      setUser(response.user);

      return response.user;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Google Login
  |--------------------------------------------------------------------------
  */

  const googleLogin = useCallback(
    async (idToken: string) => {
      const response =
        await authApi.google({
          id_token: idToken,
        });

      setToken(response.token);

      setUser(response.user);

      return {
        user: response.user,

        isNewUser:
          response.message
            ?.toLowerCase()
            .includes("registration") ??
          false,
      };
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Register
  |--------------------------------------------------------------------------
  */

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      phone?: string;
    }) => {
      const response =
        await authApi.register(data);

      setToken(response.token);

      setUser(response.user);

      return response.user;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Set Password
  |--------------------------------------------------------------------------
  |
  | Primarily used by Google-created accounts where:
  |
  | password_set = false
  |
  | After successfully setting the password, we immediately
  | update the AuthContext user so all guards see:
  |
  | password_set = true
  |
  */

  const setPassword = useCallback(
    async (data: {
      password: string;
      password_confirmation: string;
    }) => {
      const response =
        await authApi.setPassword(data);

      setUser(response.user);

      return response.user;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /*
       * Ignore backend logout failure.
       *
       * The local token should still be removed.
       */
    } finally {
      setToken(null);

      setUser(null);

      router.replace("/login");
    }
  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | Context Value
  |--------------------------------------------------------------------------
  */

  const value = useMemo(
    () => ({
      user,

      loading,

      isAuthenticated: !!user,

      isAdmin:
        user?.role === "admin",

      login,

      googleLogin,

      register,

      setPassword,

      logout,

      refreshUser,
    }),
    [
      user,
      loading,
      login,
      googleLogin,
      register,
      setPassword,
      logout,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| useAuth
|--------------------------------------------------------------------------
*/

export function useAuth(): AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}

/*
|--------------------------------------------------------------------------
| Require Authentication
|--------------------------------------------------------------------------
*/

export function useRequireAuth(
  redirectTo = "/login"
): {
  user: User | null;
  loading: boolean;
} {
  const auth = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (
      !auth.loading &&
      !auth.isAuthenticated
    ) {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname
          : "/";

      router.replace(
        `${redirectTo}?redirect=${encodeURIComponent(
          currentPath
        )}`
      );
    }
  }, [
    auth.loading,
    auth.isAuthenticated,
    router,
    redirectTo,
  ]);

  return {
    user: auth.user,
    loading: auth.loading,
  };
}

/*
|--------------------------------------------------------------------------
| Require Password Setup
|--------------------------------------------------------------------------
|
| Use this guard on authenticated customer areas.
|
| If a user is authenticated but:
|
| password_set = false
|
| they are forced to /set-password.
|
| /set-password itself is excluded so we don't redirect
| the page back to itself.
|
*/

export function useRequirePasswordSet(): {
  user: User | null;
  loading: boolean;
} {
  const auth = useAuth();

  const router = useRouter();

  const pathname = usePathname();

  useEffect(() => {
    /*
     * Wait until authentication restoration
     * has completed.
     */
    if (auth.loading) {
      return;
    }

    /*
     * Authentication itself is handled by
     * useRequireAuth().
     */
    if (
      !auth.isAuthenticated ||
      !auth.user
    ) {
      return;
    }

    /*
     * The password setup page must remain accessible
     * while password_set = false.
     */
    if (pathname === "/set-password") {
      return;
    }

    /*
     * Google user has not created their own
     * application password yet.
     */
    if (!(auth.user as User & { password_set: boolean }).password_set) {
      router.replace("/set-password");
    }
  }, [
    auth.loading,
    auth.isAuthenticated,
    auth.user,
    pathname,
    router,
  ]);

  return {
    user: auth.user,
    loading: auth.loading,
  };
}

/*
|--------------------------------------------------------------------------
| Require Admin
|--------------------------------------------------------------------------
*/

export function useRequireAdmin(): {
  user: User | null;
  loading: boolean;
} {
  const auth = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (auth.loading) {
      return;
    }

    if (!auth.isAuthenticated) {
      router.replace(
        "/login?redirect=/admin"
      );
      return;
    }

    if (!auth.isAdmin) {
      router.replace("/");
    }
  }, [
    auth.loading,
    auth.isAuthenticated,
    auth.isAdmin,
    router,
  ]);

  return {
    user: auth.user,
    loading: auth.loading,
  };
}