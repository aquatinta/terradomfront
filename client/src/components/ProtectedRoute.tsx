/**
 * ProtectedRoute — компонент-обёртка для защищённых маршрутов «Террадом»
 *
 * Использование в App.tsx:
 *
 *   // Любой авторизованный пользователь
 *   <Route path="/dashboard">
 *     <ProtectedRoute>
 *       <CustomerDashboard />
 *     </ProtectedRoute>
 *   </Route>
 *
 *   // Только заказчик
 *   <Route path="/dashboard">
 *     <ProtectedRoute roles={["customer"]}>
 *       <CustomerDashboard />
 *     </ProtectedRoute>
 *   </Route>
 *
 *   // Подрядчик или поставщик
 *   <Route path="/partner">
 *     <ProtectedRoute roles={["partner", "supplier"]}>
 *       <PartnerDashboard />
 *     </ProtectedRoute>
 *   </Route>
 *
 *   // Только администратор
 *   <Route path="/admin">
 *     <ProtectedRoute roles={["admin"]}>
 *       <AdminPanel />
 *     </ProtectedRoute>
 *   </Route>
 *
 * Поведение:
 *   - idle / loading  → показывает полноэкранный спиннер инициализации
 *   - unauthenticated → сохраняет returnTo в sessionStorage, редиректит на /login
 *   - authenticated, роль не совпадает → страница 403 «Доступ запрещён»
 *   - authenticated, роль совпадает → рендерит children
 */

import { useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/api.types";

// ---------------------------------------------------------------------------
// Loading screen
// ---------------------------------------------------------------------------

function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[oklch(0.10_0.008_240)] z-50">
      {/* Animated logo */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-xl bg-[oklch(0.769_0.188_70.08/0.15)] border border-[oklch(0.769_0.188_70.08/0.3)] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L16 7V16H2V7L9 2Z" fill="oklch(0.769 0.188 70.08)" strokeWidth="0" />
            <rect x="6.5" y="10" width="5" height="6" fill="oklch(0.769 0.188 70.08 / 0.4)" />
          </svg>
        </div>
        {/* Spinning ring */}
        <div className="absolute -inset-2 rounded-[18px] border-2 border-transparent border-t-[oklch(0.769_0.188_70.08)] animate-spin" />
      </div>

      <p
        className="text-base font-semibold text-white mb-1"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        Терра<span className="text-[oklch(0.769_0.188_70.08)]">дом</span>
      </p>
      <p className="text-sm text-[oklch(0.55_0.01_240)]">Восстановление сессии…</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Access denied screen (403)
// ---------------------------------------------------------------------------

function AccessDeniedScreen({ requiredRoles }: { requiredRoles: UserRole[] }) {
  const [, navigate] = useLocation();

  const roleLabels: Record<UserRole, string> = {
    customer: "Заказчик",
    partner: "Подрядчик",
    supplier: "Поставщик",
    admin: "Администратор",
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[oklch(0.10_0.008_240)] z-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-red-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Доступ запрещён
        </h1>
        <p className="text-[oklch(0.65_0.01_240)] mb-2">
          Эта страница доступна только для:
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {requiredRoles.map((role) => (
            <span
              key={role}
              className="px-3 py-1 rounded-full text-xs font-medium bg-[oklch(0.769_0.188_70.08/0.15)] text-[oklch(0.769_0.188_70.08)] border border-[oklch(0.769_0.188_70.08/0.3)]"
            >
              {roleLabels[role] ?? role}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-lg border border-[oklch(0.3_0.01_240)] text-[oklch(0.75_0.01_240)] hover:border-[oklch(0.769_0.188_70.08/0.5)] hover:text-white transition-colors text-sm"
          >
            На главную
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 rounded-lg bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors text-sm"
          >
            Войти под другим аккаунтом
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProtectedRoute
// ---------------------------------------------------------------------------

interface ProtectedRouteProps {
  /** Content to render when access is granted */
  children: React.ReactNode;
  /**
   * Allowed roles. If omitted — any authenticated user can access.
   * If provided — user must have at least one of the listed roles.
   */
  roles?: UserRole[];
  /**
   * Custom redirect path when unauthenticated. Defaults to "/login".
   */
  loginPath?: string;
}

export function ProtectedRoute({
  children,
  roles,
  loginPath = "/login",
}: ProtectedRouteProps) {
  const { status, isAuthenticated, isInitializing, hasRole } = useAuth();
  const [location] = useLocation();

  // Persist the intended destination so LoginPage can redirect back after login
  useEffect(() => {
    if (status === "unauthenticated" && location !== loginPath) {
      try {
        sessionStorage.setItem("terradom_return_to", location);
      } catch {
        // sessionStorage unavailable — ignore
      }
    }
  }, [status, location, loginPath]);

  // 1. Still initializing (checking refresh token) — show spinner
  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  // 2. Not authenticated — redirect to login
  if (!isAuthenticated) {
    return <Redirect to={loginPath} />;
  }

  // 3. Authenticated but wrong role — show 403
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <AccessDeniedScreen requiredRoles={roles} />;
  }

  // 4. Access granted — render children
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Convenience wrappers for common role groups
// ---------------------------------------------------------------------------

/** Route accessible only to customers (B2C) */
export function CustomerRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute roles={["customer"]}>{children}</ProtectedRoute>;
}

/** Route accessible to partners and suppliers (B2B) */
export function PartnerRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute roles={["partner", "supplier"]}>{children}</ProtectedRoute>;
}

/** Route accessible only to admins */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute roles={["admin"]}>{children}</ProtectedRoute>;
}

export default ProtectedRoute;
