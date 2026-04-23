/**
 * AuthContext — глобальный контекст аутентификации «Террадом»
 *
 * Жизненный цикл сессии:
 * 1. При монтировании: читает кэшированного пользователя из localStorage,
 *    затем пытается восстановить сессию через refresh token (тихо, без редиректа).
 * 2. login() / register*() — вызывают api.auth.*, сохраняют токены, обновляют state.
 * 3. logout() — инвалидирует refresh token на сервере, очищает все токены и state.
 * 4. При 401 в любом запросе — axios interceptor (api.ts) автоматически обновляет
 *    токен и повторяет запрос. Если refresh тоже упал — вызывает window.location = /login,
 *    что сбрасывает React-состояние через перезагрузку страницы.
 *
 * Экспортирует:
 *   - AuthProvider — оборачивает приложение
 *   - useAuth() — хук для доступа к контексту из любого компонента
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  clearAllTokens,
  getCachedUser,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  setCachedUser,
} from "@/lib/token";
import type {
  LoginRequest,
  RegisterCustomerRequest,
  RegisterPartnerRequest,
  User,
  UserRole,
} from "@/lib/api.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  /** Current auth status — use to show loading spinners or redirect guards */
  status: AuthStatus;
  /** True when session is confirmed and user is loaded */
  isAuthenticated: boolean;
  /** True while initial session restoration is in progress */
  isInitializing: boolean;
  /** Authenticated user profile, or null if not logged in */
  user: User | null;
  /** Last auth error message (login/register failures) */
  error: string | null;
  /** Clear the last error */
  clearError: () => void;

  // Actions
  /** Login with phone + password */
  login: (data: LoginRequest) => Promise<void>;
  /** Register a new customer account */
  registerCustomer: (data: RegisterCustomerRequest) => Promise<void>;
  /** Register a new partner/supplier account */
  registerPartner: (data: RegisterPartnerRequest) => Promise<void>;
  /** Logout — invalidates server session and clears local state */
  logout: () => Promise<void>;
  /** Refresh current user profile from the server */
  refreshUser: () => Promise<void>;
  /** Check if the authenticated user has one of the given roles */
  hasRole: (...roles: UserRole[]) => boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prevent double-initialization in React StrictMode
  const initializingRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Session restoration on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    async function restoreSession() {
      setStatus("loading");

      // Step 1: Load cached user for instant UI (avoids flash of logged-out state)
      const cached = getCachedUser();
      if (cached) {
        setUser(cached);
      }

      // Step 2: Check if we have a refresh token to restore the session
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setStatus("unauthenticated");
        setUser(null);
        return;
      }

      // Step 3: Exchange refresh token for a fresh access token
      try {
        const authData = await api.auth.refresh();
        setUser(authData.user);
        setStatus("authenticated");
      } catch {
        // Refresh token is expired or invalid — clear everything silently
        clearAllTokens();
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    restoreSession();
  }, []);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const login = useCallback(async (data: LoginRequest) => {
    setError(null);
    setStatus("loading");
    try {
      const authData = await api.auth.login(data);
      setUser(authData.user);
      setStatus("authenticated");
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      setStatus("unauthenticated");
      throw err; // re-throw so form can handle it too
    }
  }, []);

  const registerCustomer = useCallback(
    async (data: RegisterCustomerRequest) => {
      setError(null);
      setStatus("loading");
      try {
        const authData = await api.auth.registerCustomer(data);
        setUser(authData.user);
        setStatus("authenticated");
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        setStatus("unauthenticated");
        throw err;
      }
    },
    [],
  );

  const registerPartner = useCallback(
    async (data: RegisterPartnerRequest) => {
      setError(null);
      setStatus("loading");
      try {
        const authData = await api.auth.registerPartner(data);
        setUser(authData.user);
        setStatus("authenticated");
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        setStatus("unauthenticated");
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setError(null);
    try {
      await api.auth.logout();
    } catch {
      // Best-effort — clear locally even if server call fails
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await api.user.me();
      setUser(freshUser);
    } catch (err) {
      // If 401 — the axios interceptor will handle token refresh automatically
      // If it still fails, the interceptor will redirect to /login
      console.warn("[AuthContext] refreshUser failed:", getApiErrorMessage(err));
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const isAuthenticated = status === "authenticated" && user !== null;
  const isInitializing = status === "idle" || status === "loading";

  // ---------------------------------------------------------------------------
  // Context value (stable references via useCallback above)
  // ---------------------------------------------------------------------------

  const value: AuthContextValue = {
    status,
    isAuthenticated,
    isInitializing,
    user,
    error,
    clearError,
    login,
    registerCustomer,
    registerPartner,
    logout,
    refreshUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAuth — access the authentication context from any component.
 *
 * @throws if used outside of <AuthProvider>
 *
 * @example
 * const { isAuthenticated, user, login, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      "useAuth() must be used inside <AuthProvider>. " +
        "Make sure AuthProvider wraps your component tree in App.tsx.",
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Utility guard components
// ---------------------------------------------------------------------------

/**
 * <RequireAuth roles={["customer"]}> — renders children only when authenticated.
 * Shows a loading spinner during session initialization.
 * Redirects to /login when unauthenticated (via window.location for simplicity).
 *
 * For route-level protection, use ProtectedRoute (Этап 1, Задача 3) instead.
 */
export function RequireAuth({
  children,
  roles,
  fallback,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
  fallback?: React.ReactNode;
}) {
  const { isAuthenticated, isInitializing, hasRole } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Восстановление сессии…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  // Role check
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Доступ запрещён</p>
          <p className="text-sm text-muted-foreground mt-1">
            У вас нет прав для просмотра этой страницы.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
