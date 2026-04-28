/**
 * ProjectDetailPanel — детальный просмотр проекта в кабинете заказчика
 *
 * Design: тёмная тема кабинета (oklch palette), Montserrat headings, Manrope body
 * Features:
 *  - Статусная машина с прогресс-баром (7 шагов)
 *  - Геометрия: технология, площадь, этажи, стены/окна/двери
 *  - Смета: разбивка по статьям с визуальными барами
 *  - Переименование проекта (inline edit)
 *  - Публикация проекта (submit) с optimistic lock
 *  - Переход к офферам
 */
import { useState, useCallback } from "react";
import {
  ArrowLeft,
  Pencil,
  Check,
  X,
  Send,
  ChevronRight,
  Layers,
  Building2,
  Maximize2,
  DoorOpen,
  Square,
  BarChart3,
  Wifi,
  RefreshCw,
  AlertCircle,
  Info,
  Tag,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Project } from "@/lib/api.types";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  assembled: "Собран",
  calculated: "Рассчитан",
  request_sent: "Опубликован",
  offers_received: "Есть предложения",
  executor_selected: "Исполнитель выбран",
  deal_started: "Сделка активна",
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  draft: "text-[oklch(0.55_0.012_240)] bg-[oklch(0.14_0.02_255)]",
  assembled: "text-[oklch(0.75_0.15_200)] bg-[oklch(0.16_0.04_200)]",
  calculated: "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.18_0.05_70)]",
  request_sent: "text-[oklch(0.75_0.18_250)] bg-[oklch(0.16_0.05_250)]",
  offers_received: "text-[oklch(0.75_0.18_280)] bg-[oklch(0.16_0.05_280)]",
  executor_selected: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.05_160)]",
  deal_started: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.08_160)]",
};

const STATUS_ORDER = [
  "draft",
  "assembled",
  "calculated",
  "request_sent",
  "offers_received",
  "executor_selected",
  "deal_started",
];

const TECH_LABELS: Record<string, string> = {
  legostroy: "Полистиролбетон",
  pino: "Пинобетон",
  wood: "Дерево",
  brick: "Кирпич",
  sip: "СИП-панели",
  frame: "Каркас",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMoney(v: number | string | null | undefined) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (n == null || isNaN(n)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

// ---------------------------------------------------------------------------
// Status progress bar
// ---------------------------------------------------------------------------

function StatusProgress({ status }: { status: string }) {
  const idx = STATUS_ORDER.indexOf(status);
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / STATUS_ORDER.length) * 100);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-semibold text-[oklch(0.5_0.012_240)] uppercase tracking-wider"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Статус проекта
        </span>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            PROJECT_STATUS_COLORS[status] ??
            "text-[oklch(0.55_0.012_240)] bg-[oklch(0.14_0.02_255)]"
          }`}
        >
          {PROJECT_STATUS_LABELS[status] ?? status}
        </span>
      </div>
      {/* Progress bar */}
      <div className="relative h-1.5 rounded-full bg-[oklch(0.18_0.02_255)] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background:
              status === "deal_started" || status === "executor_selected"
                ? "oklch(0.75 0.18 160)"
                : "oklch(0.769 0.188 70.08)",
          }}
        />
      </div>
      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {STATUS_ORDER.map((s, i) => (
          <div
            key={s}
            title={PROJECT_STATUS_LABELS[s]}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i <= idx
                ? "bg-[oklch(0.769_0.188_70.08)]"
                : "bg-[oklch(0.22_0.02_255)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Geometry section
// ---------------------------------------------------------------------------

type GeoData = Record<string, unknown>;

function GeometrySection({ geometry }: { geometry: GeoData | null }) {
  if (!geometry || Object.keys(geometry).length === 0) {
    return (
      <div className="rounded-xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-5 mb-4">
        <h4
          className="text-sm font-bold text-white mb-3 flex items-center gap-2"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <Layers size={15} className="text-[oklch(0.769_0.188_70.08)]" />
          Геометрия
        </h4>
        <div className="flex items-center gap-2 text-sm text-[oklch(0.45_0.012_240)]">
          <Info size={14} />
          Геометрия не задана. Откройте проект в мобильном приложении для редактирования.
        </div>
      </div>
    );
  }

  const tech = geometry.selectedTechnology as string | undefined;
  const area = geometry.areaTotalM2 as number | undefined;
  const floors = geometry.floors as number | undefined;
  const walls = geometry.wallsCount as number | undefined;
  const windows = geometry.windowsCount as number | undefined;
  const doors = geometry.doorsCount as number | undefined;
  const perimeter = geometry.perimeterM as number | undefined;

  const stats = [
    { icon: Building2, label: "Технология", value: tech ? (TECH_LABELS[tech] ?? tech) : "—" },
    { icon: Maximize2, label: "Площадь", value: area != null ? `${area} м²` : "—" },
    { icon: Layers, label: "Этажей", value: floors != null ? String(floors) : "—" },
    { icon: Square, label: "Периметр", value: perimeter != null ? `${perimeter} м` : "—" },
    { icon: Square, label: "Стен", value: walls != null ? String(walls) : "—" },
    { icon: Square, label: "Окон", value: windows != null ? String(windows) : "—" },
    { icon: DoorOpen, label: "Дверей", value: doors != null ? String(doors) : "—" },
  ].filter((s) => s.value !== "—");

  return (
    <div className="rounded-xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-5 mb-4">
      <h4
        className="text-sm font-bold text-white mb-4 flex items-center gap-2"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <Layers size={15} className="text-[oklch(0.769_0.188_70.08)]" />
        Геометрия проекта
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-lg bg-[oklch(0.11_0.015_255)] border border-[oklch(0.18_0.02_255)] p-3"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={12} className="text-[oklch(0.5_0.012_240)]" />
              <span className="text-[10px] text-[oklch(0.45_0.012_240)] uppercase tracking-wider">
                {label}
              </span>
            </div>
            <p className="text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estimate section
// ---------------------------------------------------------------------------

type EstimateData = Record<string, unknown>;

function EstimateSection({ estimate }: { estimate: EstimateData | null }) {
  if (!estimate || Object.keys(estimate).length === 0) {
    return (
      <div className="rounded-xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-5 mb-4">
        <h4
          className="text-sm font-bold text-white mb-3 flex items-center gap-2"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <BarChart3 size={15} className="text-[oklch(0.769_0.188_70.08)]" />
          Смета
        </h4>
        <div className="flex items-center gap-2 text-sm text-[oklch(0.45_0.012_240)]">
          <Info size={14} />
          Смета не рассчитана. Завершите проектирование в приложении.
        </div>
      </div>
    );
  }

  // Extract known fields from estimate JSONB
  const total = estimate.totalCost as number | undefined ?? estimate.total as number | undefined;
  const materials = estimate.materialsCost as number | undefined;
  const labor = estimate.laborCost as number | undefined;
  const foundation = estimate.foundationCost as number | undefined;
  const roofing = estimate.roofingCost as number | undefined;
  const finishing = estimate.finishingCost as number | undefined;
  const engineering = estimate.engineeringCost as number | undefined;

  // Build line items
  const lines: { label: string; value: number }[] = [];
  if (foundation != null) lines.push({ label: "Фундамент", value: foundation });
  if (materials != null) lines.push({ label: "Материалы стен", value: materials });
  if (roofing != null) lines.push({ label: "Кровля", value: roofing });
  if (labor != null) lines.push({ label: "Работы", value: labor });
  if (finishing != null) lines.push({ label: "Отделка", value: finishing });
  if (engineering != null) lines.push({ label: "Инженерия", value: engineering });

  // If no known fields, try to render raw keys
  if (lines.length === 0) {
    Object.entries(estimate).forEach(([key, val]) => {
      if (typeof val === "number" && key !== "syncVersion") {
        lines.push({ label: key, value: val });
      }
    });
  }

  const maxVal = lines.length > 0 ? Math.max(...lines.map((l) => l.value)) : 1;

  return (
    <div className="rounded-xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-5 mb-4">
      <h4
        className="text-sm font-bold text-white mb-4 flex items-center gap-2"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <BarChart3 size={15} className="text-[oklch(0.769_0.188_70.08)]" />
        Смета
      </h4>

      {total != null && (
        <div className="flex items-baseline justify-between mb-5 pb-4 border-b border-[oklch(0.18_0.02_255)]">
          <span className="text-sm text-[oklch(0.5_0.012_240)]">Итого</span>
          <span
            className="text-xl font-black text-[oklch(0.769_0.188_70.08)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {formatMoney(total)}
          </span>
        </div>
      )}

      {lines.length > 0 ? (
        <div className="space-y-3">
          {lines.map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[oklch(0.55_0.012_240)]">{label}</span>
                <span className="font-semibold text-white">{formatMoney(value)}</span>
              </div>
              <div className="h-1 rounded-full bg-[oklch(0.18_0.02_255)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((value / maxVal) * 100)}%`,
                    background: "oklch(0.769 0.188 70.08)",
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[oklch(0.45_0.012_240)]">
          Детализация сметы недоступна
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ProjectDetailPanelProps {
  project: Project;
  onBack: () => void;
  onGoToOffers: (project: Project) => void;
  onProjectUpdated: (project: Project) => void;
}

export default function ProjectDetailPanel({
  project: initialProject,
  onBack,
  onGoToOffers,
  onProjectUpdated,
}: ProjectDetailPanelProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(project.name || "");
  const [renameLoading, setRenameLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Refresh from API
  const handleRefresh = useCallback(async () => {
    setRefreshLoading(true);
    try {
      const updated = await api.projects.get(project.id);
      setProject(updated);
      onProjectUpdated(updated);
    } catch {
      toast.error("Не удалось обновить проект");
    } finally {
      setRefreshLoading(false);
    }
  }, [project.id, onProjectUpdated]);

  // Rename project
  const handleRename = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === project.name) {
      setIsRenaming(false);
      return;
    }
    setRenameLoading(true);
    try {
      const updated = await api.projects.update(project.id, {
        name: trimmed,
        syncVersion: project.syncVersion,
      });
      setProject(updated);
      onProjectUpdated(updated);
      toast.success("Название обновлено");
      setIsRenaming(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка переименования";
      toast.error(msg);
    } finally {
      setRenameLoading(false);
    }
  };

  // Submit (publish) project
  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      const updated = await api.projects.submit(project.id, {
        syncVersion: project.syncVersion,
      });
      setProject(updated);
      onProjectUpdated(updated);
      toast.success("Проект опубликован! Подрядчики уже видят его.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка публикации";
      if (msg.includes("409") || msg.includes("conflict")) {
        toast.error("Конфликт версий. Обновите проект и попробуйте снова.");
      } else if (msg.includes("geometry") || msg.includes("422")) {
        toast.error("Добавьте геометрию перед публикацией");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const canSubmit = project.status === "calculated";
  const isPublished = [
    "request_sent",
    "offers_received",
    "executor_selected",
    "deal_started",
  ].includes(project.status);

  const geo = project.geometry as Record<string, unknown> | null;
  const est = project.estimate as Record<string, unknown> | null;

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.012_240)] hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Мои проекты
        </button>
        <span className="text-[oklch(0.3_0.01_240)]">/</span>
        <span className="text-sm text-white font-medium truncate max-w-[200px]">
          {project.name || "Проект без названия"}
        </span>
      </div>

      {/* ── Title + actions ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-6 mb-4">
        {/* Project name */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") setIsRenaming(false);
                  }}
                  className="flex-1 bg-[oklch(0.11_0.015_255)] border border-[oklch(0.25_0.03_255)] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.769_0.188_70.08/0.5)]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                />
                <button
                  onClick={handleRename}
                  disabled={renameLoading}
                  className="p-1.5 rounded-lg bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] hover:bg-[oklch(0.72_0.19_70.08)] transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setIsRenaming(false)}
                  className="p-1.5 rounded-lg bg-[oklch(0.16_0.02_255)] text-[oklch(0.5_0.012_240)] hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2
                  className="text-lg font-bold text-white truncate"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {project.name || "Проект без названия"}
                </h2>
                {!isPublished && (
                  <button
                    onClick={() => {
                      setNameInput(project.name || "");
                      setIsRenaming(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-[oklch(0.45_0.012_240)] hover:text-white transition-all"
                    title="Переименовать"
                  >
                    <Pencil size={13} />
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-[oklch(0.4_0.01_240)] mt-1">
              Обновлён {formatDate(project.updatedAt)}
              {project.syncVersion > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-[oklch(0.75_0.18_160)]">
                  <Wifi size={10} /> синхр. v{project.syncVersion}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshLoading}
            className="p-2 rounded-lg text-[oklch(0.45_0.012_240)] hover:text-white hover:bg-[oklch(0.16_0.02_255)] transition-all disabled:opacity-50"
            title="Обновить"
          >
            <RefreshCw size={14} className={refreshLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Status progress */}
        <StatusProgress status={project.status} />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Publish button */}
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={submitLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 hover:opacity-90"
              style={{
                background: "oklch(0.769 0.188 70.08)",
                color: "oklch(0.1 0.01 70)",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <Send size={14} />
              {submitLoading ? "Публикация..." : "Опубликовать проект"}
            </button>
          )}

          {/* Go to offers */}
          {isPublished && (
            <button
              onClick={() => onGoToOffers(project)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{
                background: "oklch(0.769 0.188 70.08)",
                color: "oklch(0.1 0.01 70)",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <Tag size={14} />
              Смотреть предложения
              <ChevronRight size={14} />
            </button>
          )}

          {/* Info for draft/assembled */}
          {(project.status === "draft" || project.status === "assembled") && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.20_0.025_255)] text-xs text-[oklch(0.5_0.012_240)]">
              <AlertCircle size={13} />
              Завершите проектирование в приложении для публикации
            </div>
          )}
        </div>
      </div>

      {/* ── Geometry ────────────────────────────────────────────────────── */}
      <GeometrySection geometry={geo} />

      {/* ── Estimate ────────────────────────────────────────────────────── */}
      <EstimateSection estimate={est} />

      {/* ── Meta info ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[oklch(0.18_0.02_255)] bg-[oklch(0.11_0.015_255)] p-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[oklch(0.4_0.01_240)]">ID проекта</span>
            <p className="text-[oklch(0.6_0.01_240)] font-mono mt-0.5 truncate">{project.id}</p>
          </div>
          <div>
            <span className="text-[oklch(0.4_0.01_240)]">Версия синхр.</span>
            <p className="text-white font-semibold mt-0.5">{project.syncVersion}</p>
          </div>
          <div>
            <span className="text-[oklch(0.4_0.01_240)]">Создан</span>
            <p className="text-white mt-0.5">{formatDate(project.insertedAt)}</p>
          </div>
          <div>
            <span className="text-[oklch(0.4_0.01_240)]">Документы</span>
            <p className={`mt-0.5 font-semibold ${project.docsUnlocked ? "text-[oklch(0.75_0.18_160)]" : "text-[oklch(0.45_0.012_240)]"}`}>
              {project.docsUnlocked ? "Открыты" : "Закрыты"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
