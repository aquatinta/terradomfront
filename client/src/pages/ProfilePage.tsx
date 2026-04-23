/* ProfilePage — Terradom
   Design: Dark Tech PropTech v2 — тёмный фон + синий градиент слева
   Fonts: Montserrat (заголовки) + Manrope (тело)
   API: GET /api/user/me (загрузка) + PATCH /api/user/me (сохранение)
   Fields: firstName, lastName, phone (readonly), companyName, regions, specializations
   Validation: react-hook-form + zod
   Toast: sonner */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Building2, Phone, MapPin, Wrench, Save, CheckCircle2, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { User as UserType } from "@/lib/api.types";

/* ─── Constants ─────────────────────────────────────────────────────────── */

const REGIONS = [
  "Москва", "Московская область", "Санкт-Петербург", "Ленинградская область",
  "Краснодарский край", "Свердловская область", "Новосибирская область",
  "Татарстан", "Башкортостан", "Нижегородская область", "Самарская область",
  "Ростовская область", "Челябинская область", "Омская область", "Красноярский край",
  "Воронежская область", "Пермский край", "Волгоградская область", "Саратовская область",
  "Другой регион",
];

const REGION_CODES: Record<string, string> = {
  "Москва": "MSK", "Московская область": "MSK",
  "Санкт-Петербург": "SPB", "Ленинградская область": "SPB",
  "Краснодарский край": "KRD", "Свердловская область": "EKB",
  "Новосибирская область": "NSK", "Татарстан": "KZN",
  "Башкортостан": "UFA", "Нижегородская область": "NNV",
  "Самарская область": "SAM", "Ростовская область": "ROV",
  "Челябинская область": "CHE", "Омская область": "OMS",
  "Красноярский край": "KRS", "Воронежская область": "VRN",
  "Пермский край": "PRM", "Волгоградская область": "VLG",
  "Саратовская область": "SAR", "Другой регион": "OTH",
};

const REGION_CODES_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(REGION_CODES).map(([k, v]) => [v, k])
);

const SPECIALIZATIONS = [
  { label: "Каркасные дома", value: "timber_framing" },
  { label: "СИП-панели", value: "sip" },
  { label: "Клееный брус", value: "glulam" },
  { label: "Газобетон", value: "aerated_concrete" },
  { label: "Модульные дома", value: "modular" },
  { label: "Кирпич", value: "brick" },
  { label: "Монолит", value: "concrete" },
  { label: "Деревянный сруб", value: "log_cabin" },
];

/* ─── Schema ─────────────────────────────────────────────────────────────── */

const profileSchema = z.object({
  firstName: z.string().min(1, "Введите имя").max(50),
  lastName: z.string().max(50).optional(),
  companyName: z.string().max(100).optional(),
  regions: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/* ─── MultiSelect chip component ─────────────────────────────────────────── */

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

function MultiSelectChips({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${isSelected
                  ? "bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] shadow-[0_0_12px_oklch(0.769_0.188_70.08/0.4)]"
                  : "bg-[oklch(0.17_0.02_255)] text-[oklch(0.72_0.01_240)] border border-[oklch(0.28_0.03_255)] hover:border-[oklch(0.769_0.188_70.08/0.5)] hover:text-white"
                }
              `}
            >
              {isSelected && <CheckCircle2 size={13} />}
              {opt.label}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && placeholder && (
        <p className="text-xs text-[oklch(0.50_0.01_240)]">{placeholder}</p>
      )}
    </div>
  );
}

/* ─── RegionMultiSelect ───────────────────────────────────────────────────── */

interface RegionSelectProps {
  selected: string[]; // codes like ["MSK", "SPB"]
  onChange: (codes: string[]) => void;
}

function RegionMultiSelect({ selected, onChange }: RegionSelectProps) {
  const toggleRegion = (regionName: string) => {
    const code = REGION_CODES[regionName] ?? regionName;
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {REGIONS.map((region) => {
        const code = REGION_CODES[region] ?? region;
        const isSelected = selected.includes(code);
        return (
          <button
            key={region}
            type="button"
            onClick={() => toggleRegion(region)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${isSelected
                ? "bg-[oklch(0.50_0.18_255)] text-white shadow-[0_0_12px_oklch(0.50_0.18_255/0.4)]"
                : "bg-[oklch(0.17_0.02_255)] text-[oklch(0.72_0.01_240)] border border-[oklch(0.28_0.03_255)] hover:border-[oklch(0.50_0.18_255/0.6)] hover:text-white"
              }
            `}
          >
            {isSelected && <CheckCircle2 size={13} />}
            {region}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserType | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      regions: [],
      specializations: [],
    },
  });

  const watchedRegions = watch("regions") ?? [];
  const watchedSpecializations = watch("specializations") ?? [];
  const isPartner = user?.role === "partner" || user?.role === "supplier";

  /* Load profile on mount */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.user.me();
        setProfileData(data);
        reset({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          companyName: data.companyName ?? "",
          regions: data.regions ?? [],
          specializations: data.specializations ?? [],
        });
      } catch {
        toast.error("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      await api.user.update({
        firstName: data.firstName,
        lastName: data.lastName || undefined,
        companyName: data.companyName || undefined,
        regions: data.regions?.length ? data.regions : undefined,
        specializations: data.specializations?.length ? data.specializations : undefined,
      });
      await refreshUser();
      toast.success("Профиль успешно обновлён");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка сохранения";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  /* ── Skeleton ── */
  if (loading) {
    return (
      <DashboardLayout title="Профиль" subtitle="Загрузка...">
        <div className="max-w-2xl space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-[oklch(0.17_0.02_255)]" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  /* ── Form ── */
  return (
    <DashboardLayout title="Профиль" subtitle="Личные данные и настройки аккаунта">
      <div className="max-w-2xl p-4 md:p-6" style={{
        background: "radial-gradient(ellipse 60% 50% at 0% 20%, oklch(0.22 0.08 255 / 0.25) 0%, transparent 60%)",
      }}>
        {/* Header card */}
        <div className="mb-6 p-5 rounded-2xl border border-[oklch(0.28_0.03_255)] bg-[oklch(0.13_0.018_255)] flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-[oklch(0.769_0.188_70.08)] flex items-center justify-center text-xl font-bold text-[oklch(0.1_0.01_70)] flex-shrink-0"
            style={{ fontFamily: "Montserrat, sans-serif" }}>
            {`${profileData?.firstName?.charAt(0) ?? ""}${profileData?.lastName?.charAt(0) ?? ""}`.toUpperCase() ||
              user?.phone?.slice(-2) || "?"}
          </div>
          <div>
            <p className="text-lg font-bold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {profileData?.companyName ||
                `${profileData?.firstName ?? ""} ${profileData?.lastName ?? ""}`.trim() ||
                user?.phone}
            </p>
            <p className="text-sm text-[oklch(0.769_0.188_70.08)] mt-0.5">
              {user?.role === "customer" ? "Заказчик"
                : user?.role === "partner" ? "Подрядчик"
                : user?.role === "supplier" ? "Поставщик"
                : "Администратор"}
            </p>
            <p className="text-xs text-[oklch(0.55_0.01_240)] mt-1">{user?.phone}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Personal info ── */}
          <div className="p-5 rounded-2xl border border-[oklch(0.28_0.03_255)] bg-[oklch(0.13_0.018_255)] space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User size={16} className="text-[oklch(0.769_0.188_70.08)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider"
                style={{ fontFamily: "Montserrat, sans-serif" }}>
                Личные данные
              </h3>
            </div>

            {/* Phone (readonly) */}
            <div>
              <label className="block text-xs font-medium text-[oklch(0.60_0.01_240)] mb-1.5 uppercase tracking-wider">
                Телефон
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[oklch(0.11_0.015_255)] border border-[oklch(0.22_0.02_255)] text-[oklch(0.55_0.01_240)] text-sm">
                <Phone size={14} className="flex-shrink-0" />
                <span>{user?.phone ?? "—"}</span>
                <span className="ml-auto text-xs text-[oklch(0.45_0.01_240)]">Нельзя изменить</span>
              </div>
            </div>

            {/* First name */}
            <div>
              <label className="block text-xs font-medium text-[oklch(0.60_0.01_240)] mb-1.5 uppercase tracking-wider">
                Имя <span className="text-[oklch(0.769_0.188_70.08)]">*</span>
              </label>
              <input
                {...register("firstName")}
                placeholder="Введите имя"
                className={`
                  w-full px-4 py-3 rounded-xl bg-[oklch(0.17_0.02_255)] border text-white text-sm
                  placeholder-[oklch(0.45_0.01_240)] outline-none transition-all
                  focus:border-[oklch(0.769_0.188_70.08/0.8)] focus:bg-[oklch(0.19_0.02_255)]
                  ${errors.firstName ? "border-red-500/60" : "border-[oklch(0.28_0.03_255)]"}
                `}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last name */}
            <div>
              <label className="block text-xs font-medium text-[oklch(0.60_0.01_240)] mb-1.5 uppercase tracking-wider">
                Фамилия
              </label>
              <input
                {...register("lastName")}
                placeholder="Введите фамилию"
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.17_0.02_255)] border border-[oklch(0.28_0.03_255)] text-white text-sm placeholder-[oklch(0.45_0.01_240)] outline-none transition-all focus:border-[oklch(0.769_0.188_70.08/0.8)] focus:bg-[oklch(0.19_0.02_255)]"
              />
            </div>
          </div>

          {/* ── Company info (shown for all, required for partners) ── */}
          <div className="p-5 rounded-2xl border border-[oklch(0.28_0.03_255)] bg-[oklch(0.13_0.018_255)] space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-[oklch(0.50_0.18_255)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider"
                style={{ fontFamily: "Montserrat, sans-serif" }}>
                Компания
              </h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-[oklch(0.60_0.01_240)] mb-1.5 uppercase tracking-wider">
                Название компании
              </label>
              <input
                {...register("companyName")}
                placeholder={isPartner ? "ООО «Название»" : "Необязательно"}
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.17_0.02_255)] border border-[oklch(0.28_0.03_255)] text-white text-sm placeholder-[oklch(0.45_0.01_240)] outline-none transition-all focus:border-[oklch(0.50_0.18_255/0.8)] focus:bg-[oklch(0.19_0.02_255)]"
              />
            </div>
          </div>

          {/* ── Regions ── */}
          <div className="p-5 rounded-2xl border border-[oklch(0.28_0.03_255)] bg-[oklch(0.13_0.018_255)] space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} className="text-[oklch(0.50_0.18_255)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider"
                style={{ fontFamily: "Montserrat, sans-serif" }}>
                Регионы работы
              </h3>
              {watchedRegions.length > 0 && (
                <span className="ml-auto text-xs text-[oklch(0.50_0.18_255)] font-medium">
                  Выбрано: {watchedRegions.length}
                </span>
              )}
            </div>
            <RegionMultiSelect
              selected={watchedRegions}
              onChange={(codes) => setValue("regions", codes, { shouldDirty: true })}
            />
          </div>

          {/* ── Specializations (partner/supplier only) ── */}
          {isPartner && (
            <div className="p-5 rounded-2xl border border-[oklch(0.28_0.03_255)] bg-[oklch(0.13_0.018_255)] space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Wrench size={16} className="text-[oklch(0.769_0.188_70.08)]" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Специализации
                </h3>
                {watchedSpecializations.length > 0 && (
                  <span className="ml-auto text-xs text-[oklch(0.769_0.188_70.08)] font-medium">
                    Выбрано: {watchedSpecializations.length}
                  </span>
                )}
              </div>
              <MultiSelectChips
                options={SPECIALIZATIONS}
                selected={watchedSpecializations}
                onChange={(vals) => setValue("specializations", vals, { shouldDirty: true })}
                placeholder="Выберите типы домов, с которыми работаете"
              />
            </div>
          )}

          {/* ── Submit ── */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${saving || !isDirty
                  ? "bg-[oklch(0.22_0.02_255)] text-[oklch(0.50_0.01_240)] cursor-not-allowed"
                  : "btn-amber"
                }
              `}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Сохранить изменения
                </>
              )}
            </button>
            {isDirty && !saving && (
              <button
                type="button"
                onClick={() => reset()}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm text-[oklch(0.60_0.01_240)] hover:text-white transition-colors"
              >
                <X size={14} />
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
