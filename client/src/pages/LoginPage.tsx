/**
 * LoginPage — страница входа «Террадом»
 * Использует useAuth().login() из AuthContext.
 * После успешного входа редиректит на returnTo из sessionStorage
 * или на соответствующий кабинет по роли.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Phone, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { LoginRequest } from "@/lib/api.types";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  phone: z
    .string()
    .min(10, "Введите номер телефона")
    .regex(/^[\d\s\-\+\(\)]+$/, "Некорректный формат телефона"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type LoginForm = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Role → dashboard path
// ---------------------------------------------------------------------------

const ROLE_PATH: Record<string, string> = {
  customer: "/dashboard",
  partner: "/partner",
  supplier: "/partner",
  admin: "/admin",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const req: LoginRequest = { phone: data.phone, password: data.password };
      await login(req);

      // After login, useAuth().user is updated — read from context
      // We navigate after a tick so the state propagates
      let returnTo: string | null = null;
      try {
        returnTo = sessionStorage.getItem("terradom_return_to");
        sessionStorage.removeItem("terradom_return_to");
      } catch {
        // ignore
      }

      // We don't have the user object here (login returns void),
      // so we redirect to returnTo or generic dashboard; Navbar will
      // show the correct role-based link once AuthContext updates.
      const destination = returnTo ?? "/dashboard";
      toast.success("Добро пожаловать!");
      navigate(destination);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Неверный телефон или пароль";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.015_255)] flex items-center justify-center px-4">
      {/* Blueprint grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.769 0.188 70.08) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.769 0.188 70.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.769_0.188_70.08)] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L16 7V16H2V7L9 2Z" fill="oklch(0.1 0.01 70)" />
                <rect x="6.5" y="10" width="5" height="6" fill="oklch(0.1 0.01 70 / 0.5)" />
              </svg>
            </div>
            <span
              className="font-bold text-xl text-white"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Терра<span className="text-[oklch(0.769_0.188_70.08)]">дом</span>
            </span>
          </a>
          <p className="text-sm text-[oklch(0.55_0.012_240)] mt-3">
            Войдите в личный кабинет
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-8 shadow-2xl">
          <h1
            className="text-xl font-bold text-white mb-6"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Вход
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[oklch(0.75_0.01_240)] mb-2">
                Телефон
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]"
                />
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+7 (900) 000-00-00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.25_0.01_240)] text-white placeholder-[oklch(0.4_0.01_240)] text-sm focus:outline-none focus:border-[oklch(0.769_0.188_70.08/0.6)] focus:ring-1 focus:ring-[oklch(0.769_0.188_70.08/0.3)] transition-colors"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-400 mt-1.5">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[oklch(0.75_0.01_240)] mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]"
                />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.25_0.01_240)] text-white placeholder-[oklch(0.4_0.01_240)] text-sm focus:outline-none focus:border-[oklch(0.769_0.188_70.08/0.6)] focus:ring-1 focus:ring-[oklch(0.769_0.188_70.08/0.3)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)] hover:text-[oklch(0.65_0.012_240)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] font-semibold text-sm hover:bg-[oklch(0.72_0.19_70.08)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[oklch(0.1_0.01_70)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Войти
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 pt-6 border-t border-[oklch(0.20_0.025_255)] text-center">
            <p className="text-sm text-[oklch(0.55_0.012_240)]">
              Ещё нет аккаунта?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-[oklch(0.769_0.188_70.08)] hover:text-[oklch(0.85_0.18_70.08)] font-medium transition-colors"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </div>

        {/* Back to landing */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-[oklch(0.45_0.012_240)] hover:text-[oklch(0.65_0.012_240)] transition-colors"
          >
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
}
