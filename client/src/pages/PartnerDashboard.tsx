/**
 * PartnerDashboard — кабинет подрядчика / поставщика (B2B)
 * Этап 1, Задача 3: заглушка с каркасом UI.
 * Полная реализация — Этап 4 плана фронтенда.
 */

import { Package, FileText, Handshake, Search, ArrowRight, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        accent
          ? "bg-[oklch(0.769_0.188_70.08/0.08)] border-[oklch(0.769_0.188_70.08/0.25)]"
          : "bg-[oklch(0.14_0.01_240)] border-[oklch(0.22_0.01_240)]"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            accent
              ? "bg-[oklch(0.769_0.188_70.08/0.2)] text-[oklch(0.769_0.188_70.08)]"
              : "bg-[oklch(0.18_0.01_240)] text-[oklch(0.55_0.01_240)]"
          }`}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
        {value}
      </p>
      <p className="text-sm text-[oklch(0.65_0.01_240)] mt-0.5">{label}</p>
      {sub && <p className="text-xs text-[oklch(0.769_0.188_70.08)] mt-1">{sub}</p>}
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl p-5 border border-[oklch(0.22_0.01_240)] bg-[oklch(0.14_0.01_240)] hover:border-[oklch(0.769_0.188_70.08/0.4)] hover:bg-[oklch(0.16_0.01_240)] transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[oklch(0.18_0.01_240)] flex items-center justify-center text-[oklch(0.769_0.188_70.08)]">
          {icon}
        </div>
        <ArrowRight
          size={16}
          className="text-[oklch(0.4_0.01_240)] group-hover:text-[oklch(0.769_0.188_70.08)] group-hover:translate-x-1 transition-all"
        />
      </div>
      <p className="text-sm font-semibold text-white mb-1">{title}</p>
      <p className="text-xs text-[oklch(0.55_0.01_240)]">{description}</p>
    </button>
  );
}

export default function PartnerDashboard() {
  const { user } = useAuth();

  const isSupplier = user?.role === "supplier";
  const greeting = user?.companyName
    ? `Добро пожаловать, ${user.companyName}!`
    : user?.firstName
    ? `Добро пожаловать, ${user.firstName}!`
    : "Добро пожаловать!";

  const roleTitle = isSupplier ? "Поставщик" : "Подрядчик";

  return (
    <DashboardLayout title="Кабинет партнёра" subtitle={roleTitle}>
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        {/* Welcome banner */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-[oklch(0.769_0.188_70.08/0.12)] to-[oklch(0.769_0.188_70.08/0.04)] border border-[oklch(0.769_0.188_70.08/0.2)]">
          <h2
            className="text-xl font-bold text-white mb-1"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {greeting}
          </h2>
          <p className="text-sm text-[oklch(0.65_0.01_240)]">
            {isSupplier
              ? "Разместите каталог материалов и получайте заявки от заказчиков по всей России."
              : "Находите тендеры в вашем регионе и подавайте предложения на строительство."}
          </p>
          <button
            onClick={() => toast.info(isSupplier ? "Каталог — в разработке (Этап 4)" : "Тендеры — в разработке (Этап 4)")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-sm font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors"
          >
            <Search size={16} />
            {isSupplier ? "Разместить каталог" : "Найти тендеры"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Package size={20} />}
            label={isSupplier ? "Позиций в каталоге" : "Доступных тендеров"}
            value="0"
            sub="Начните работу"
            accent
          />
          <StatCard
            icon={<FileText size={20} />}
            label="Мои предложения"
            value="0"
          />
          <StatCard
            icon={<Handshake size={20} />}
            label="Активные сделки"
            value="0"
          />
        </div>

        {/* Regions & specializations */}
        {(user?.regions?.length ?? 0) > 0 || (user?.specializations?.length ?? 0) > 0 ? (
          <div className="rounded-2xl p-5 border border-[oklch(0.22_0.01_240)] bg-[oklch(0.14_0.01_240)]">
            <h3
              className="text-sm font-semibold text-white mb-3"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Ваш профиль
            </h3>
            {(user?.regions?.length ?? 0) > 0 && (
              <div className="mb-3">
                <p className="text-xs text-[oklch(0.55_0.01_240)] mb-2">Регионы работы</p>
                <div className="flex flex-wrap gap-2">
                  {user!.regions.map((r) => (
                    <span
                      key={r}
                      className="px-2.5 py-1 rounded-full text-xs bg-[oklch(0.18_0.01_240)] text-[oklch(0.75_0.01_240)] border border-[oklch(0.28_0.01_240)]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(user?.specializations?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs text-[oklch(0.55_0.01_240)] mb-2">Специализации</p>
                <div className="flex flex-wrap gap-2">
                  {user!.specializations.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-full text-xs bg-[oklch(0.769_0.188_70.08/0.1)] text-[oklch(0.769_0.188_70.08)] border border-[oklch(0.769_0.188_70.08/0.25)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Quick actions */}
        <div>
          <h3
            className="text-sm font-semibold text-[oklch(0.55_0.01_240)] uppercase tracking-wider mb-3"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Быстрые действия
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ActionCard
              icon={<Search size={20} />}
              title={isSupplier ? "Каталог материалов" : "Лента тендеров"}
              description={isSupplier ? "Разместите прайс-лист и описания" : "Найдите проекты в вашем регионе"}
              onClick={() => toast.info("В разработке (Этап 4)")}
            />
            <ActionCard
              icon={<FileText size={20} />}
              title="Мои предложения"
              description="Отслеживайте статус поданных офферов"
              onClick={() => toast.info("В разработке (Этап 4)")}
            />
            <ActionCard
              icon={<TrendingUp size={20} />}
              title="Аналитика"
              description="Статистика по заявкам и конверсии"
              onClick={() => toast.info("В разработке (Этап 4)")}
            />
          </div>
        </div>

        {/* Coming soon notice */}
        <div className="rounded-xl p-4 border border-dashed border-[oklch(0.28_0.01_240)] bg-[oklch(0.13_0.008_240)]">
          <p className="text-xs text-[oklch(0.5_0.01_240)] text-center">
            Полный функционал кабинета партнёра реализуется в{" "}
            <span className="text-[oklch(0.769_0.188_70.08)]">Этапе 4</span> плана разработки.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
