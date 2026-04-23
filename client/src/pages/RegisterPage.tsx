/**
 * RegisterPage — страница регистрации «Террадом»
 * Три роли: заказчик (customer), подрядчик (partner), поставщик (supplier).
 * Использует useAuth().registerCustomer() / registerPartner().
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Phone, Lock, User, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { normalizePhone } from "@/lib/api";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Role selector
// ---------------------------------------------------------------------------

type Role = "customer" | "contractor" | "supplier";

const ROLES: { id: Role; icon: string; title: string; desc: string }[] = [
  {
    id: "customer",
    icon: "🏠",
    title: "Заказчик",
    desc: "Хочу построить дом, использовать 3D-конфигуратор и найти подрядчика",
  },
  {
    id: "contractor",
    icon: "🔨",
    title: "Подрядчик",
    desc: "Строительная компания — хочу получать заказы на строительство домов",
  },
  {
    id: "supplier",
    icon: "📦",
    title: "Поставщик",
    desc: "Поставщик материалов — хочу разместить каталог и получать заявки",
  },
];

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const RUSSIAN_PHONE = /^[\d\s\-\+\(\)]+$/;
const INN_RE = /^\d{10}(\d{2})?$/;

const customerSchema = z
  .object({
    firstName: z.string().min(2, "Введите имя"),
    lastName: z.string().min(2, "Введите фамилию"),
    phone: z.string().regex(RUSSIAN_PHONE, "Некорректный номер телефона").min(10, "Введите телефон"),
    password: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string().min(6, "Минимум 6 символов"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

const partnerSchema = z
  .object({
    firstName: z.string().min(2, "Введите имя"),
    lastName: z.string().min(2, "Введите фамилию"),
    companyName: z.string().min(2, "Введите название компании"),
    inn: z.string().regex(INN_RE, "ИНН: 10 или 12 цифр"),
    phone: z.string().regex(RUSSIAN_PHONE, "Некорректный номер телефона").min(10, "Введите телефон"),
    password: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string().min(6, "Минимум 6 символов"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type CustomerForm = z.infer<typeof customerSchema>;
type PartnerForm = z.infer<typeof partnerSchema>;

// ---------------------------------------------------------------------------
// Role → dashboard path
// ---------------------------------------------------------------------------

const ROLE_PATH: Record<Role, string> = {
  customer: "/dashboard",
  contractor: "/partner",
  supplier: "/partner",
};

// ---------------------------------------------------------------------------
// Input component
// ---------------------------------------------------------------------------

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[oklch(0.75_0.01_240)] mb-2">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full pl-10 pr-4 py-3 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.25_0.01_240)] text-white placeholder-[oklch(0.4_0.01_240)] text-sm focus:outline-none focus:border-[oklch(0.769_0.188_70.08/0.6)] focus:ring-1 focus:ring-[oklch(0.769_0.188_70.08/0.3)] transition-colors";

// ---------------------------------------------------------------------------
// Customer registration form
// ---------------------------------------------------------------------------

function CustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const { registerCustomer } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({ resolver: zodResolver(customerSchema) });

  const onSubmit = async (data: CustomerForm) => {
    setLoading(true);
    try {
      await registerCustomer({
        phone: normalizePhone(data.phone),
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "customer",
      });
      toast.success("Аккаунт создан! Добро пожаловать!");
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Имя" error={errors.firstName?.message}>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
            <input {...register("firstName")} placeholder="Иван" className={inputCls} />
          </div>
        </Field>
        <Field label="Фамилия" error={errors.lastName?.message}>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
            <input {...register("lastName")} placeholder="Иванов" className={inputCls} />
          </div>
        </Field>
      </div>
      <Field label="Телефон" error={errors.phone?.message}>
        <div className="relative">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
          <input {...register("phone")} type="tel" placeholder="+7 (900) 000-00-00" className={inputCls} />
        </div>
      </Field>
      <Field label="Пароль" error={errors.password?.message}>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
          <input {...register("password")} type={showPwd ? "text" : "password"} placeholder="Минимум 6 символов" className={`${inputCls} pr-12`} />
          <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)] hover:text-[oklch(0.65_0.012_240)] transition-colors">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>
      <Field label="Повторите пароль" error={errors.confirmPassword?.message}>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
          <input {...register("confirmPassword")} type={showConfirm ? "text" : "password"} placeholder="Повторите пароль" className={`${inputCls} pr-12`} />
          <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)] hover:text-[oklch(0.65_0.012_240)] transition-colors">
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] font-semibold text-sm hover:bg-[oklch(0.72_0.19_70.08)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-[oklch(0.1_0.01_70)] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>Создать аккаунт <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Partner / Supplier registration form
// ---------------------------------------------------------------------------

function PartnerForm({ role, onSuccess }: { role: "contractor" | "supplier"; onSuccess: () => void }) {
  const { registerPartner } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerForm>({ resolver: zodResolver(partnerSchema) });

  const onSubmit = async (data: PartnerForm) => {
    setLoading(true);
    try {
      await registerPartner({
        phone: normalizePhone(data.phone),
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        inn: data.inn,
        regions: [],
        specializations: [],
      });
      toast.success("Аккаунт партнёра создан! Добро пожаловать!");
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Имя" error={errors.firstName?.message}>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
            <input {...register("firstName")} placeholder="Иван" className={inputCls} />
          </div>
        </Field>
        <Field label="Фамилия" error={errors.lastName?.message}>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
            <input {...register("lastName")} placeholder="Иванов" className={inputCls} />
          </div>
        </Field>
      </div>
      <Field label="Название компании" error={errors.companyName?.message}>
        <div className="relative">
          <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
          <input {...register("companyName")} placeholder={role === "contractor" ? "ООО «СтройГрупп»" : "ООО «МатериалПлюс»"} className={inputCls} />
        </div>
      </Field>
      <Field label="ИНН" error={errors.inn?.message}>
        <div className="relative">
          <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
          <input {...register("inn")} placeholder="1234567890" maxLength={12} className={inputCls} />
        </div>
      </Field>
      <Field label="Телефон" error={errors.phone?.message}>
        <div className="relative">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
          <input {...register("phone")} type="tel" placeholder="+7 (900) 000-00-00" className={inputCls} />
        </div>
      </Field>
      <Field label="Пароль" error={errors.password?.message}>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
          <input {...register("password")} type={showPwd ? "text" : "password"} placeholder="Минимум 6 символов" className={`${inputCls} pr-12`} />
          <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)] hover:text-[oklch(0.65_0.012_240)] transition-colors">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>
      <Field label="Повторите пароль" error={errors.confirmPassword?.message}>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)]" />
          <input {...register("confirmPassword")} type={showConfirm ? "text" : "password"} placeholder="Повторите пароль" className={`${inputCls} pr-12`} />
          <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.012_240)] hover:text-[oklch(0.65_0.012_240)] transition-colors">
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] font-semibold text-sm hover:bg-[oklch(0.72_0.19_70.08)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-[oklch(0.1_0.01_70)] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>Зарегистрироваться <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleSuccess = () => {
    const path = selectedRole ? ROLE_PATH[selectedRole] : "/dashboard";
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.015_255)] flex items-center justify-center px-4 py-10">
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

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.769_0.188_70.08)] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L16 7V16H2V7L9 2Z" fill="oklch(0.1 0.01 70)" />
                <rect x="6.5" y="10" width="5" height="6" fill="oklch(0.1 0.01 70 / 0.5)" />
              </svg>
            </div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
              Терра<span className="text-[oklch(0.769_0.188_70.08)]">дом</span>
            </span>
          </a>
          <p className="text-sm text-[oklch(0.55_0.012_240)] mt-3">
            {selectedRole ? "Заполните данные для регистрации" : "Выберите тип аккаунта"}
          </p>
        </div>

        <div className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-8 shadow-2xl">

          {/* ── Step 1: Role selection ── */}
          {!selectedRole && (
            <div className="space-y-3">
              <h1 className="text-xl font-bold text-white mb-5" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Кто вы?
              </h1>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.018_255)] hover:border-[oklch(0.769_0.188_70.08/0.5)] hover:bg-[oklch(0.14_0.02_255)] transition-all text-left group"
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white group-hover:text-[oklch(0.769_0.188_70.08)] transition-colors">
                      {r.title}
                    </p>
                    <p className="text-xs text-[oklch(0.5_0.012_240)] mt-0.5 leading-relaxed">{r.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-[oklch(0.35_0.01_240)] group-hover:text-[oklch(0.769_0.188_70.08)] transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Form ── */}
          {selectedRole && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-[oklch(0.14_0.02_255)] hover:bg-[oklch(0.17_0.02_255)] text-[oklch(0.6_0.01_240)] hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {ROLES.find((r) => r.id === selectedRole)?.title}
                </h1>
                <span className="text-lg">{ROLES.find((r) => r.id === selectedRole)?.icon}</span>
              </div>

              {selectedRole === "customer" ? (
                <CustomerForm onSuccess={handleSuccess} />
              ) : (
                <PartnerForm role={selectedRole} onSuccess={handleSuccess} />
              )}
            </div>
          )}
        </div>

        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-sm text-[oklch(0.55_0.012_240)]">
            Уже есть аккаунт?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[oklch(0.769_0.188_70.08)] hover:text-[oklch(0.85_0.18_70.08)] font-medium transition-colors"
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
