/**
 * AdminPanel — панель администратора
 * Этап 1, Задача 3: заглушка с каркасом UI.
 * Полная реализация — Этап 7 плана фронтенда.
 */

import { ShieldCheck, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        accent
          ? "bg-[oklch(0.769_0.188_70.08/0.08)] border-[oklch(0.769_0.188_70.08/0.25)]"
          : "bg-[oklch(0.14_0.01_240)] border-[oklch(0.20_0.025_255)]"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
          accent
            ? "bg-[oklch(0.769_0.188_70.08/0.2)] text-[oklch(0.769_0.188_70.08)]"
            : "bg-[oklch(0.14_0.02_255)] text-[oklch(0.55_0.012_240)]"
        }`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
        {value}
      </p>
      <p className="text-sm text-[oklch(0.65_0.012_240)] mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <DashboardLayout title="Панель администратора" subtitle="Управление платформой">
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        {/* Warning banner */}
        <div className="rounded-2xl p-5 border border-red-500/20 bg-red-500/5 flex items-start gap-4">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Режим администратора</p>
            <p className="text-xs text-[oklch(0.55_0.012_240)] mt-0.5">
              Вы вошли с правами администратора. Все действия логируются.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users size={20} />} label="Пользователей" value="—" />
          <StatCard icon={<ShieldCheck size={20} />} label="Открытых споров" value="—" accent />
          <StatCard icon={<TrendingUp size={20} />} label="Сделок за месяц" value="—" />
          <StatCard icon={<AlertTriangle size={20} />} label="На модерации" value="—" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => toast.info("Управление спорами — в разработке (Этап 7)")}
            className="rounded-2xl p-5 border border-[oklch(0.20_0.025_255)] bg-[oklch(0.14_0.01_240)] hover:border-[oklch(0.769_0.188_70.08/0.4)] transition-all text-left"
          >
            <ShieldCheck size={20} className="text-[oklch(0.769_0.188_70.08)] mb-3" />
            <p className="text-sm font-semibold text-white">Споры и арбитраж</p>
            <p className="text-xs text-[oklch(0.55_0.012_240)] mt-1">
              Разрешение конфликтов между заказчиками и подрядчиками
            </p>
          </button>
          <button
            onClick={() => toast.info("Пользователи — в разработке (Этап 7)")}
            className="rounded-2xl p-5 border border-[oklch(0.20_0.025_255)] bg-[oklch(0.14_0.01_240)] hover:border-[oklch(0.769_0.188_70.08/0.4)] transition-all text-left"
          >
            <Users size={20} className="text-[oklch(0.769_0.188_70.08)] mb-3" />
            <p className="text-sm font-semibold text-white">Управление пользователями</p>
            <p className="text-xs text-[oklch(0.55_0.012_240)] mt-1">
              Верификация партнёров, блокировки, роли
            </p>
          </button>
        </div>

        <div className="rounded-xl p-4 border border-dashed border-[oklch(0.24_0.03_255)] bg-[oklch(0.13_0.008_240)]">
          <p className="text-xs text-[oklch(0.5_0.012_240)] text-center">
            Полный функционал администратора реализуется в{" "}
            <span className="text-[oklch(0.769_0.188_70.08)]">Этапе 7</span> плана разработки.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
