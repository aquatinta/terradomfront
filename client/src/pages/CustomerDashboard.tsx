/**
 * CustomerDashboard — кабинет заказчика
 *
 * Три вкладки:
 * 1. Проекты — список с синхронизацией с мобильным приложением
 * 2. Предложения — офферы от подрядчиков по выбранному проекту
 * 3. Сделки — активные и завершённые сделки с этапами
 *
 * Синхронизация с мобильным приложением:
 * - Использует те же поля: serverId, updatedAt, status
 * - Статусы совпадают с _STATUS_ORDER из state.js мобильного клиента
 * - Polling каждые 30 секунд (как в sync-manager.js)
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  FolderOpen,
  Tag,
  Handshake,
  Plus,
  RefreshCw,
  ChevronRight,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  useProjects,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "@/hooks/useProjects";
import { useDeals, useOffers } from "@/hooks/useDeals";

const DEAL_STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  pending_payment: "Ожидает оплаты",
  in_progress: "В работе",
  completed: "Завершена",
  dispute: "Спор",
};

const DEAL_STATUS_COLORS: Record<string, string> = {
  draft: "text-[oklch(0.55_0.012_240)] bg-[oklch(0.14_0.02_255)]",
  pending_payment: "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.18_0.05_70)]",
  in_progress: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.05_160)]",
  completed: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.08_160)]",
  dispute: "text-red-400 bg-red-950/40",
};

const MILESTONE_STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  completed: "Завершён",
};
import { api } from "@/lib/api";
import type { Project, Offer, Deal } from "@/lib/api.types";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(amount: number | null | undefined) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
}

const TECH_LABELS: Record<string, string> = {
  legostroy: "Полистиролбетон",
  pino: "Пинобетон",
  wood: "Дерево",
  brick: "Кирпич",
  sip: "СИП-панели",
  frame: "Каркас",
};

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[oklch(0.13_0.018_255)] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[oklch(0.4_0.01_240)]" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-[oklch(0.5_0.012_240)] max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Project card
// ---------------------------------------------------------------------------

function ProjectCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (p: Project) => void;
}) {
  const status = (project.status as string) ?? "draft";
  const colorCls =
    PROJECT_STATUS_COLORS[status as keyof typeof PROJECT_STATUS_COLORS] ??
    "text-[oklch(0.55_0.012_240)] bg-[oklch(0.14_0.02_255)]";
  const label =
    PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS] ??
    status;

  return (
    <div
      onClick={() => onSelect(project)}
      className="group relative rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-5 cursor-pointer hover:border-[oklch(0.769_0.188_70.08/0.4)] hover:bg-[oklch(0.15_0.01_240)] transition-all duration-200"
    >
      {project.syncVersion > 0 && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <Wifi size={11} className="text-[oklch(0.75_0.18_160)]" />
          <span className="text-[10px] text-[oklch(0.55_0.012_240)]">синхр.</span>
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[oklch(0.14_0.02_255)] flex items-center justify-center flex-shrink-0">
          <Layers size={22} className="text-[oklch(0.769_0.188_70.08)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate mb-1">
            {project.name || "Проект без названия"}
          </h3>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${colorCls}`}
          >
            {label}
          </span>
          <div className="flex flex-wrap gap-3 mt-3">
            {(() => {
              const geo = project.geometry as Record<string, unknown> | null;
              const tech = geo?.selectedTechnology;
              if (!tech) return null;
              const techStr = String(tech);
              return (
                <div className="flex items-center gap-1 text-xs text-[oklch(0.5_0.012_240)]">
                  <Building2 size={11} />
                  {TECH_LABELS[techStr] ?? techStr}
                </div>
              );
            })()}
            {(project.geometry as Record<string, unknown> | null)?.areaTotalM2 != null && (
              <div className="flex items-center gap-1 text-xs text-[oklch(0.5_0.012_240)]">
                <Layers size={11} />
                {String((project.geometry as Record<string, unknown>).areaTotalM2)} м²
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-[oklch(0.5_0.012_240)]">
              <Calendar size={11} />
              {formatDate(project.updatedAt)}
            </div>
          </div>
        </div>
        <ChevronRight
          size={16}
          className="flex-shrink-0 mt-1 text-[oklch(0.35_0.01_240)] group-hover:text-[oklch(0.769_0.188_70.08)] transition-colors"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Offer card
// ---------------------------------------------------------------------------

function OfferCard({
  offer,
  onAccept,
  onReject,
}: {
  offer: Offer;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  const handleAccept = async () => {
    setLoading("accept");
    try {
      await onAccept(offer.id);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading("reject");
    try {
      await onReject(offer.id);
    } finally {
      setLoading(null);
    }
  };

  const isPending = offer.status === "pending";

  return (
    <div className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-11 h-11 rounded-xl bg-[oklch(0.14_0.02_255)] flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-[oklch(0.769_0.188_70.08)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            {(offer as Offer & { partnerName?: string }).partnerName ??
              `Партнёр #${offer.partnerId?.slice(0, 8)}`}
          </p>
          <p className="text-xs text-[oklch(0.5_0.012_240)] mt-0.5">
            {formatDate(offer.insertedAt)}
          </p>
        </div>
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
            offer.status === "pending"
              ? "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.18_0.05_70)]"
              : offer.status === "accepted"
                ? "text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.05_160)]"
                : "text-[oklch(0.55_0.012_240)] bg-[oklch(0.14_0.02_255)]"
          }`}
        >
          {offer.status === "pending"
            ? "Новое"
            : offer.status === "accepted"
              ? "Принято"
              : "Отклонено"}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-white">
          {formatMoney(offer.totalPrice)}
        </span>
        {(offer as Offer & { safeDealSupported?: boolean })
          .safeDealSupported && (
          <span className="text-[11px] text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.05_160)] px-2 py-0.5 rounded-full">
            🔒 Безопасная оплата
          </span>
        )}
      </div>

      {offer.comment && (
        <p className="text-xs text-[oklch(0.55_0.012_240)] mb-4 leading-relaxed bg-[oklch(0.13_0.018_255)] rounded-xl p-3">
          {offer.comment}
        </p>
      )}

      {isPending && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleAccept}
            disabled={!!loading}
            className="flex-1 py-2.5 rounded-xl bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-sm font-semibold hover:bg-[oklch(0.72_0.19_70.08)] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading === "accept" ? (
              <div className="w-4 h-4 border-2 border-[oklch(0.1_0.01_70)] border-t-transparent rounded-full animate-spin" />
            ) : (
              "✓ Принять"
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={!!loading}
            className="flex-1 py-2.5 rounded-xl border border-[oklch(0.26_0.03_255)] text-[oklch(0.6_0.01_240)] text-sm font-medium hover:border-red-500/50 hover:text-red-400 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading === "reject" ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              "✕ Отклонить"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deal card
// ---------------------------------------------------------------------------

function DealCard({
  deal,
  onClick,
}: {
  deal: Deal;
  onClick: () => void;
}) {
  const status = (deal.status as string) ?? "pending";
  const colorCls =
    DEAL_STATUS_COLORS[status as keyof typeof DEAL_STATUS_COLORS] ??
    "text-[oklch(0.55_0.012_240)] bg-[oklch(0.14_0.02_255)]";
  const label =
    DEAL_STATUS_LABELS[status as keyof typeof DEAL_STATUS_LABELS] ?? status;

  const milestones = deal.milestones ?? [];
  const completedCount = milestones.filter(
    (m) => m.status === "completed",
  ).length;
  const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-5 cursor-pointer hover:border-[oklch(0.769_0.188_70.08/0.3)] hover:bg-[oklch(0.15_0.01_240)] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[oklch(0.14_0.02_255)] flex items-center justify-center">
            <Handshake size={20} className="text-[oklch(0.769_0.188_70.08)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Сделка #{deal.id.slice(0, 8)}
            </p>
            <p className="text-xs text-[oklch(0.5_0.012_240)] mt-0.5">
              {formatDate(deal.insertedAt)}
            </p>
          </div>
        </div>
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${colorCls}`}
        >
          {label}
        </span>
      </div>

      {totalAmount > 0 && (
        <div className="text-xl font-bold text-white mb-3">
          {formatMoney(totalAmount)}
        </div>
      )}

      {milestones.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[oklch(0.5_0.012_240)] mb-1">
            <span>Этапы работ</span>
            <span>
              {completedCount} / {milestones.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[oklch(0.2_0.01_240)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[oklch(0.769_0.188_70.08)] rounded-full transition-all"
              style={{
                width: `${milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {milestones.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center gap-1">
                {m.status === "completed" ? (
                  <CheckCircle2
                    size={12}
                    className="text-[oklch(0.75_0.18_160)]"
                  />
                ) : m.status === "paid_held" ? (
                  <Clock
                    size={12}
                    className="text-[oklch(0.769_0.188_70.08)]"
                  />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-[oklch(0.35_0.01_240)]" />
                )}
                <span className="text-[10px] text-[oklch(0.5_0.012_240)] truncate max-w-[80px]">
                  {m.title}
                </span>
              </div>
            ))}
            {milestones.length > 4 && (
              <span className="text-[10px] text-[oklch(0.4_0.01_240)]">
                +{milestones.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[oklch(0.18_0.01_240)]">
        <span className="text-xs text-[oklch(0.5_0.012_240)]">
          {deal.escrowAccount
            ? `Эскроу: ${deal.escrowAccount.slice(0, 12)}...`
            : "Без эскроу"}
        </span>
        <ChevronRight
          size={14}
          className="text-[oklch(0.35_0.01_240)] group-hover:text-[oklch(0.55_0.012_240)] transition-colors"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deal detail panel
// ---------------------------------------------------------------------------

function DealDetail({
  deal,
  onClose,
  onMilestoneAccept,
}: {
  deal: Deal;
  onClose: () => void;
  onMilestoneAccept: (
    milestoneId: string,
    status: "paid" | "completed",
  ) => void;
}) {
  const milestones = deal.milestones ?? [];

  return (
    <div className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-base font-bold text-white"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Сделка #{deal.id.slice(0, 8)}
        </h3>
        <button
          onClick={onClose}
          className="text-[oklch(0.45_0.012_240)] hover:text-white transition-colors text-lg"
        >
          ✕
        </button>
      </div>

      {milestones.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[oklch(0.5_0.012_240)] uppercase tracking-wider mb-3">
            Этапы работ
          </p>
          {milestones.map((m, idx) => {
            const ms = m.status as "pending" | "paid" | "completed";
            const statusLabel = MILESTONE_STATUS_LABELS[ms] ?? m.status;
            const canAccept = ms === "pending" || ms === "paid";

            return (
              <div
                key={m.id}
                className="rounded-xl border border-[oklch(0.2_0.01_240)] bg-[oklch(0.13_0.018_255)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        ms === "completed"
                          ? "bg-[oklch(0.75_0.18_160)] text-[oklch(0.1_0.01_160)]"
                          : ms === "paid"
                            ? "bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)]"
                            : "bg-[oklch(0.17_0.02_255)] text-[oklch(0.55_0.012_240)]"
                      }`}
                    >
                      {ms === "completed" ? "✓" : idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {m.title}
                      </p>
                      {m.description && (
                        <p className="text-xs text-[oklch(0.5_0.012_240)] mt-0.5">
                          {m.description}
                        </p>
                      )}
                      <p className="text-xs text-[oklch(0.5_0.012_240)] mt-1">
                        {statusLabel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">
                      {formatMoney(parseFloat(m.amount))}
                    </p>
                    {canAccept && (
                      <button
                        onClick={() =>
                          onMilestoneAccept(
                            m.id,
                            ms === "pending" ? "paid" : "completed",
                          )
                        }
                        className="mt-2 text-[11px] px-3 py-1 rounded-lg bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors"
                      >
                        {ms === "pending" ? "Оплатить" : "Принять"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock size={24} className="text-[oklch(0.4_0.01_240)] mx-auto mb-2" />
          <p className="text-sm text-[oklch(0.5_0.012_240)]">
            Этапы ещё не добавлены
          </p>
          <p className="text-xs text-[oklch(0.4_0.01_240)] mt-1">
            Подрядчик добавит этапы работ
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Offers panel
// ---------------------------------------------------------------------------

function OffersPanel({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const { offers, loading, error, refetch } = useOffers(project.id);

  const handleAccept = async (offerId: string) => {
    try {
      await api.offers.accept(offerId);
      toast.success("Предложение принято! Сделка создана.");
      refetch();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Ошибка при принятии предложения",
      );
    }
  };

  const handleReject = async (offerId: string) => {
    try {
      await api.offers.reject(offerId);
      toast.success("Предложение отклонено");
      refetch();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Ошибка при отклонении предложения",
      );
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-xs text-[oklch(0.5_0.012_240)] hover:text-white transition-colors flex items-center gap-1"
        >
          ← Все проекты
        </button>
        <span className="text-[oklch(0.35_0.01_240)]">/</span>
        <span className="text-sm text-white font-medium truncate">
          {project.name || "Проект"}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[oklch(0.769_0.188_70.08)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-950/30 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Предложений пока нет"
          description="Подрядчики увидят ваш проект и пришлют предложения после публикации на маркетплейс"
          action={
            project.status === "calculated" ? (
              <button
                onClick={async () => {
                  try {
                    await api.projects.submit(project.id, { syncVersion: project.syncVersion });
                    toast.success("Проект опубликован на маркетплейс!");
                  } catch {
                    toast.error("Ошибка публикации");
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-sm font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors"
              >
                Опубликовать проект
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[oklch(0.5_0.012_240)]">
              {offers.length} предложений
            </p>
            <button
              onClick={refetch}
              className="text-xs text-[oklch(0.5_0.012_240)] hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Обновить
            </button>
          </div>
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

type Tab = "projects" | "offers" | "deals";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects();
  const {
    deals,
    loading: dealsLoading,
    error: dealsError,
    refetch: refetchDeals,
  } = useDeals();

  // Online/offline indicator
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Polling every 30 seconds (same as sync-manager.js in mobile app)
  useEffect(() => {
    const timer = setInterval(() => {
      if (navigator.onLine) {
        refetchProjects();
        refetchDeals();
      }
    }, 30_000);
    return () => clearInterval(timer);
  }, [refetchProjects, refetchDeals]);

  const handleMilestoneAccept = useCallback(
    async (milestoneId: string, status: "paid" | "completed") => {
      try {
        await api.milestones.accept(milestoneId, { status });
        toast.success(status === "paid" ? "Этап оплачен" : "Этап принят");
        refetchDeals();
        if (selectedDeal) {
          const updated = await api.deals.get(selectedDeal.id);
          setSelectedDeal(updated);
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Ошибка при подтверждении этапа",
        );
      }
    },
    [selectedDeal, refetchDeals],
  );

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number | null }[] = [
    { id: "projects", label: "Проекты", icon: FolderOpen, count: projects.length },
    { id: "offers", label: "Предложения", icon: Tag, count: null },
    {
      id: "deals",
      label: "Сделки",
      icon: Handshake,
      count: deals.filter((d) => d.status === "in_progress").length,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-6" style={{
        background: "radial-gradient(ellipse 60% 50% at 0% 20%, oklch(0.22 0.08 255 / 0.25) 0%, transparent 60%)",
      }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {user?.firstName ? `Добро пожаловать, ${user.firstName}` : "Кабинет заказчика"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-[oklch(0.5_0.012_240)]">
                Кабинет заказчика
              </p>
              <span className="text-[oklch(0.3_0.01_240)]">·</span>
              <div className="flex items-center gap-1 text-xs">
                {isOnline ? (
                  <>
                    <Wifi size={11} className="text-[oklch(0.75_0.18_160)]" />
                    <span className="text-[oklch(0.55_0.012_240)]">
                      Синхронизировано
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff size={11} className="text-red-400" />
                    <span className="text-red-400">Офлайн</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.20_0.025_255)]">
            <Smartphone size={14} className="text-[oklch(0.769_0.188_70.08)]" />
            <span className="text-xs text-[oklch(0.5_0.012_240)]">
              Синхр. с приложением
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Проектов",
              value: projects.length,
              icon: FolderOpen,
              color: "text-[oklch(0.769_0.188_70.08)]",
            },
            {
              label: "Предложений",
              value: projects.reduce(
                (sum, p) =>
                  sum + ((p as Project & { offersCount?: number }).offersCount ?? 0),
                0,
              ),
              icon: Tag,
              color: "text-[oklch(0.7_0.15_240)]",
            },
            {
              label: "Активных сделок",
              value: deals.filter((d) => d.status === "in_progress").length,
              icon: Handshake,
              color: "text-[oklch(0.75_0.18_160)]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} className={stat.color} />
                <span className="text-xs text-[oklch(0.5_0.012_240)]">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-[oklch(0.13_0.008_240)] border border-[oklch(0.18_0.01_240)] mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedProject(null);
                setSelectedDeal(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)]"
                  : "text-[oklch(0.55_0.012_240)] hover:text-white"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-[oklch(0.1_0.01_70/0.3)]"
                      : "bg-[oklch(0.17_0.02_255)]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Projects */}
        {activeTab === "projects" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[oklch(0.5_0.012_240)]">
                {projectsLoading ? "Загрузка..." : `${projects.length} проектов`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={refetchProjects}
                  className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.012_240)] hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-[oklch(0.14_0.02_255)]"
                >
                  <RefreshCw size={12} /> Обновить
                </button>
                <button
                  onClick={() =>
                    toast.info(
                      "Создание проектов доступно в мобильном приложении",
                    )
                  }
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors"
                >
                  <Plus size={13} /> Новый проект
                </button>
              </div>
            </div>

            {projectsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[oklch(0.769_0.188_70.08)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : projectsError ? (
              <div className="rounded-xl bg-red-950/30 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
                <AlertCircle size={16} /> {projectsError}
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="Проектов пока нет"
                description="Создайте первый проект в мобильном приложении Террадом — спроектируйте дом в 3D и примерьте его на участке через AR"
                action={
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.20_0.025_255)]">
                    <Smartphone
                      size={16}
                      className="text-[oklch(0.769_0.188_70.08)]"
                    />
                    <span className="text-sm text-[oklch(0.6_0.01_240)]">
                      Скачайте приложение для создания проектов
                    </span>
                  </div>
                }
              />
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={(p) => {
                      setSelectedProject(p);
                      setActiveTab("offers");
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Offers */}
        {activeTab === "offers" && (
          <div>
            {selectedProject ? (
              <OffersPanel
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
              />
            ) : (
              <EmptyState
                icon={Tag}
                title="Выберите проект"
                description="Перейдите на вкладку «Проекты» и выберите проект, чтобы увидеть предложения от подрядчиков"
                action={
                  <button
                    onClick={() => setActiveTab("projects")}
                    className="px-4 py-2.5 rounded-xl bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-sm font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors"
                  >
                    К проектам
                  </button>
                }
              />
            )}
          </div>
        )}

        {/* Tab: Deals */}
        {activeTab === "deals" && (
          <div
            className={`grid gap-6 ${selectedDeal ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[oklch(0.5_0.012_240)]">
                  {dealsLoading ? "Загрузка..." : `${deals.length} сделок`}
                </p>
                <button
                  onClick={refetchDeals}
                  className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.012_240)] hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-[oklch(0.14_0.02_255)]"
                >
                  <RefreshCw size={12} /> Обновить
                </button>
              </div>

              {dealsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-[oklch(0.769_0.188_70.08)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : dealsError ? (
                <div className="rounded-xl bg-red-950/30 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} /> {dealsError}
                </div>
              ) : deals.length === 0 ? (
                <EmptyState
                  icon={Handshake}
                  title="Сделок пока нет"
                  description="Примите предложение от подрядчика, чтобы открыть сделку с безопасной оплатой через эскроу"
                />
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onClick={async () => {
                        try {
                          const full = await api.deals.get(deal.id);
                          setSelectedDeal(full);
                        } catch {
                          setSelectedDeal(deal);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {selectedDeal && (
              <DealDetail
                deal={selectedDeal}
                onClose={() => setSelectedDeal(null)}
                onMilestoneAccept={handleMilestoneAccept}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
