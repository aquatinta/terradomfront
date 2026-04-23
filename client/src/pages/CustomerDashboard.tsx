/**
 * CustomerDashboard — кабинет заказчика (B2C)
 * Этап 1, Задача 3: заглушка с каркасом UI.
 * Полная реализация — Этап 3 плана фронтенда.
 */

import { useLocation } from "wouter";
import { FolderOpen, FileText, Handshake, Plus, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Quick action card
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const greeting = user?.firstName ? `Добро пожаловать, ${user.firstName}!` : "Добро пожаловать!";

  return (
    <DashboardLayout title="Личный кабинет" subtitle="Заказчик">
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
            Создайте первый проект и получите предложения от проверенных подрядчиков.
          </p>
          <button
            onClick={() => toast.info("Создание проекта — в разработке (Этап 3)")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-sm font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors"
          >
            <Plus size={16} />
            Новый проект
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={<FolderOpen size={20} />}
            label="Проекты"
            value="0"
            sub="Создайте первый"
            accent
          />
          <StatCard
            icon={<FileText size={20} />}
            label="Предложения"
            value="0"
          />
          <StatCard
            icon={<Handshake size={20} />}
            label="Активные сделки"
            value="0"
          />
        </div>

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
              icon={<Plus size={20} />}
              title="Создать проект"
              description="Нарисуйте план дома в 3D-редакторе"
              onClick={() => toast.info("3D-редактор — в мобильном приложении")}
            />
            <ActionCard
              icon={<FileText size={20} />}
              title="Мои предложения"
              description="Просмотрите офферы от подрядчиков"
              onClick={() => toast.info("Предложения — в разработке (Этап 3)")}
            />
            <ActionCard
              icon={<Handshake size={20} />}
              title="Сделки"
              description="Управляйте этапами строительства"
              onClick={() => toast.info("Сделки — в разработке (Этап 3)")}
            />
          </div>
        </div>

        {/* Coming soon notice */}
        <div className="rounded-xl p-4 border border-dashed border-[oklch(0.28_0.01_240)] bg-[oklch(0.13_0.008_240)]">
          <p className="text-xs text-[oklch(0.5_0.01_240)] text-center">
            Полный функционал кабинета заказчика реализуется в{" "}
            <span className="text-[oklch(0.769_0.188_70.08)]">Этапе 3</span> плана разработки.
            Сейчас доступна базовая структура и навигация.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
