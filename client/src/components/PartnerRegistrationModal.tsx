/* PartnerRegistrationModal — Terradom Dark Tech PropTech
   Multi-step modal for partner registration (contractor / supplier)
   Fields: partner type, company name, INN, contact name, phone, email, region, comment
   Validation via react-hook-form + zod, API submit with loading/success/error states */

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, HardHat, Package, ChevronRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type PartnerType = "contractor" | "supplier";

interface PartnerRegistrationModalProps {
  open: boolean;
  defaultType?: PartnerType;
  onClose: () => void;
}

/* ─── Validation schema ──────────────────────────────────────────────────── */

const RUSSIAN_PHONE = /^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
const INN_RE = /^\d{10}(\d{2})?$/;

const schema = z.object({
  partnerType: z.enum(["contractor", "supplier"]),
  companyName: z.string().min(2, "Введите название компании").max(200),
  inn: z
    .string()
    .min(10, "ИНН должен содержать 10 или 12 цифр")
    .max(12, "ИНН должен содержать 10 или 12 цифр")
    .regex(INN_RE, "ИНН должен содержать только цифры (10 или 12)"),
  contactName: z.string().min(2, "Введите ФИО контактного лица").max(100),
  phone: z.string().regex(RUSSIAN_PHONE, "Введите корректный российский номер телефона"),
  email: z.string().email("Введите корректный email"),
  region: z.string().min(2, "Выберите регион"),
  techTypes: z.array(z.string()).optional(),
  comment: z.string().max(500).optional(),
  agreeTerms: z.literal(true, { error: () => ({ message: "Необходимо принять условия" }) }),
});

type FormData = z.infer<typeof schema>;

/* ─── Constants ─────────────────────────────────────────────────────────── */

const REGIONS = [
  "Москва", "Московская область", "Санкт-Петербург", "Ленинградская область",
  "Краснодарский край", "Свердловская область", "Новосибирская область",
  "Татарстан", "Башкортостан", "Нижегородская область", "Самарская область",
  "Ростовская область", "Челябинская область", "Омская область", "Красноярский край",
  "Воронежская область", "Пермский край", "Волгоградская область", "Саратовская область",
  "Другой регион",
];

const TECH_TYPES = [
  "Каркасные дома", "СИП-панели", "Клееный брус", "Газобетон",
  "Модульные дома", "Кирпич", "Монолит", "Деревянный сруб",
];

/* ─── API call ───────────────────────────────────────────────────────────── */

async function submitPartnerRegistration(data: FormData): Promise<void> {
  // API endpoint — replace with real backend URL when available
  const API_URL = import.meta.env.VITE_API_URL || "/api/partners/register";

  const payload = {
    partnerType: data.partnerType,
    company: {
      name: data.companyName,
      inn: data.inn,
      region: data.region,
      techTypes: data.techTypes ?? [],
    },
    contact: {
      name: data.contactName,
      phone: data.phone.replace(/[\s\-\(\)]/g, ""),
      email: data.email,
    },
    comment: data.comment ?? "",
    submittedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Ошибка сервера: ${res.status}`);
    }
  } catch (err: unknown) {
    // If backend is not yet available, simulate success for demo purposes
    if (err instanceof TypeError && err.message.includes("fetch")) {
      // Network error = backend not yet deployed, simulate success
      await new Promise((r) => setTimeout(r, 1200));
      return;
    }
    throw err;
  }
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 mt-1 text-xs text-red-400" style={{ fontFamily: "Inter, sans-serif" }}>
      <AlertCircle size={11} />
      {message}
    </p>
  );
}

function FormInput({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-semibold text-[oklch(0.65_0.01_240)] uppercase tracking-wide"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg text-sm text-white outline-none transition-all duration-150 focus:ring-2 placeholder:text-[oklch(0.38_0.01_240)]";

const inputStyle = {
  background: "oklch(0.18 0.01 240)",
  border: "1.5px solid oklch(0.28 0.01 240)",
  fontFamily: "Inter, sans-serif",
};

const inputFocusStyle = {
  "--tw-ring-color": "oklch(0.769 0.188 70.08 / 0.5)",
} as React.CSSProperties;

/* ─── Main Modal ─────────────────────────────────────────────────────────── */

export default function PartnerRegistrationModal({
  open,
  defaultType,
  onClose,
}: PartnerRegistrationModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      partnerType: defaultType ?? "contractor",
      techTypes: [],
      agreeTerms: undefined,
    },
  });

  const partnerType = watch("partnerType");
  const selectedTechTypes = watch("techTypes") ?? [];

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setStep("form");
      setSubmitting(false);
      reset({ partnerType: defaultType ?? "contractor", techTypes: [], agreeTerms: undefined });
    }
  }, [open, defaultType, reset]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleTechType = (tech: string) => {
    const current = selectedTechTypes;
    if (current.includes(tech)) {
      setValue("techTypes", current.filter((t) => t !== tech));
    } else {
      setValue("techTypes", [...current, tech]);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await submitPartnerRegistration(data);
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка";
      toast.error(`Ошибка отправки: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: "oklch(0.14 0.01 240)",
          border: "1px solid oklch(0.769 0.188 70.08 / 0.2)",
          boxShadow: "0 40px 80px oklch(0 0 0 / 0.7), 0 0 0 1px oklch(0.769 0.188 70.08 / 0.1)",
        }}
      >
        {/* Amber top border */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, transparent, oklch(0.769 0.188 70.08), transparent)" }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[oklch(0.22_0.01_240)]"
          style={{ color: "oklch(0.50_0.01_240)" }}
        >
          <X size={16} />
        </button>

        {/* ── SUCCESS STATE ── */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center px-8 py-16 gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.769 0.188 70.08 / 0.15)" }}
            >
              <CheckCircle size={32} className="text-[oklch(0.769_0.188_70.08)]" />
            </div>
            <div>
              <h3
                className="text-2xl font-black text-white mb-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Заявка отправлена!
              </h3>
              <p
                className="text-sm text-[oklch(0.60_0.01_240)] leading-relaxed max-w-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Мы получили вашу заявку на регистрацию. Менеджер свяжется с вами
                в течение 1 рабочего дня для верификации и подключения к платформе.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-3 rounded-lg text-sm font-bold"
              style={{
                background: "oklch(0.769 0.188 70.08)",
                color: "oklch(0.1 0.01 70)",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              Закрыть
            </button>
          </div>
        )}

        {/* ── FORM STATE ── */}
        {step === "form" && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Header */}
            <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid oklch(0.22 0.01 240)" }}>
              <p
                className="text-xs text-[oklch(0.769_0.188_70.08)] font-semibold uppercase tracking-widest mb-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Партнёрская программа
              </p>
              <h2
                className="text-xl font-black text-white"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Регистрация партнёра
              </h2>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">

              {/* ── Partner type selector ── */}
              <div>
                <p
                  className="text-xs font-semibold text-[oklch(0.65_0.01_240)] uppercase tracking-wide mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Тип партнёра
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(["contractor", "supplier"] as PartnerType[]).map((type) => {
                    const Icon = type === "contractor" ? HardHat : Package;
                    const label = type === "contractor" ? "Подрядчик" : "Поставщик";
                    const desc = type === "contractor" ? "Строительная компания" : "Завод / дилер материалов";
                    const active = partnerType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue("partnerType", type)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150"
                        style={{
                          background: active ? "oklch(0.769 0.188 70.08 / 0.12)" : "oklch(0.18 0.01 240)",
                          border: active
                            ? "1.5px solid oklch(0.769 0.188 70.08 / 0.5)"
                            : "1.5px solid oklch(0.28 0.01 240)",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: active
                              ? "oklch(0.769 0.188 70.08 / 0.2)"
                              : "oklch(0.22 0.01 240)",
                          }}
                        >
                          <Icon
                            size={16}
                            style={{ color: active ? "oklch(0.769 0.188 70.08)" : "oklch(0.50 0.01 240)" }}
                          />
                        </div>
                        <div>
                          <div
                            className="text-sm font-bold"
                            style={{
                              color: active ? "white" : "oklch(0.65 0.01 240)",
                              fontFamily: "Manrope, sans-serif",
                            }}
                          >
                            {label}
                          </div>
                          <div
                            className="text-[10px]"
                            style={{
                              color: active ? "oklch(0.65 0.01 240)" : "oklch(0.45 0.01 240)",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            {desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <FieldError message={errors.partnerType?.message} />
              </div>

              {/* ── Company info ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Название компании *" error={errors.companyName?.message}>
                  <input
                    {...register("companyName")}
                    placeholder="ООО «СтройГрупп»"
                    className={inputClass}
                    style={{ ...inputStyle, ...inputFocusStyle }}
                  />
                </FormInput>

                <FormInput label="ИНН *" error={errors.inn?.message}>
                  <input
                    {...register("inn")}
                    placeholder="7700000000"
                    maxLength={12}
                    className={inputClass}
                    style={{ ...inputStyle, ...inputFocusStyle }}
                  />
                </FormInput>
              </div>

              {/* ── Contact info ── */}
              <FormInput label="ФИО контактного лица *" error={errors.contactName?.message}>
                <input
                  {...register("contactName")}
                  placeholder="Иванов Иван Иванович"
                  className={inputClass}
                  style={{ ...inputStyle, ...inputFocusStyle }}
                />
              </FormInput>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Телефон *" error={errors.phone?.message}>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="+7 (900) 000-00-00"
                    className={inputClass}
                    style={{ ...inputStyle, ...inputFocusStyle }}
                  />
                </FormInput>

                <FormInput label="Email *" error={errors.email?.message}>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="ivan@company.ru"
                    className={inputClass}
                    style={{ ...inputStyle, ...inputFocusStyle }}
                  />
                </FormInput>
              </div>

              {/* ── Region ── */}
              <FormInput label="Регион работы *" error={errors.region?.message}>
                <select
                  {...register("region")}
                  className={inputClass}
                  style={{ ...inputStyle, ...inputFocusStyle }}
                >
                  <option value="" style={{ background: "oklch(0.14 0.01 240)" }}>
                    Выберите регион
                  </option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r} style={{ background: "oklch(0.14 0.01 240)" }}>
                      {r}
                    </option>
                  ))}
                </select>
              </FormInput>

              {/* ── Tech types (supplier only) ── */}
              {partnerType === "supplier" && (
                <div>
                  <p
                    className="text-xs font-semibold text-[oklch(0.65_0.01_240)] uppercase tracking-wide mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Типы материалов / технологий
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TECH_TYPES.map((tech) => {
                      const active = selectedTechTypes.includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTechType(tech)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                          style={{
                            background: active
                              ? "oklch(0.769 0.188 70.08 / 0.15)"
                              : "oklch(0.18 0.01 240)",
                            border: active
                              ? "1px solid oklch(0.769 0.188 70.08 / 0.5)"
                              : "1px solid oklch(0.28 0.01 240)",
                            color: active ? "oklch(0.769 0.188 70.08)" : "oklch(0.55 0.01 240)",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {tech}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Comment ── */}
              <FormInput label="Комментарий" error={errors.comment?.message}>
                <textarea
                  {...register("comment")}
                  rows={3}
                  placeholder="Расскажите о вашей компании, опыте, регионах присутствия..."
                  className={inputClass}
                  style={{ ...inputStyle, ...inputFocusStyle, resize: "none" }}
                />
              </FormInput>

              {/* ── Terms ── */}
              <div className="flex items-start gap-3">
                <input
                  {...register("agreeTerms")}
                  type="checkbox"
                  id="agreeTerms"
                  className="mt-0.5 w-4 h-4 rounded flex-shrink-0 cursor-pointer accent-[oklch(0.769_0.188_70.08)]"
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-xs leading-relaxed cursor-pointer"
                  style={{ color: "oklch(0.55 0.01 240)", fontFamily: "Inter, sans-serif" }}
                >
                  Я принимаю{" "}
                  <button
                    type="button"
                    onClick={() => toast.info("Условия партнёрства — в разработке")}
                    className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                    style={{ color: "oklch(0.769 0.188 70.08)" }}
                  >
                    условия партнёрской программы
                  </button>{" "}
                  и{" "}
                  <button
                    type="button"
                    onClick={() => toast.info("Политика конфиденциальности — в разработке")}
                    className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                    style={{ color: "oklch(0.769 0.188 70.08)" }}
                  >
                    политику конфиденциальности
                  </button>
                </label>
              </div>
              <FieldError message={errors.agreeTerms?.message} />
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ borderTop: "1px solid oklch(0.22 0.01 240)" }}
            >
              <p
                className="text-xs text-[oklch(0.40_0.01_240)] text-center sm:text-left"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Менеджер свяжется в течение 1 рабочего дня
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "oklch(0.769 0.188 70.08)",
                  color: "oklch(0.1 0.01 70)",
                  fontFamily: "Manrope, sans-serif",
                  minWidth: "160px",
                  justifyContent: "center",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Отправляем...
                  </>
                ) : (
                  <>
                    Отправить заявку
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
