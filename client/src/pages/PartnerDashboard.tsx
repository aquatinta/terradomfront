/**
 * PartnerDashboard — кабинет подрядчика / поставщика (B2B)
 *
 * Дизайн-философия: Dark Tech PropTech
 * Цвета: графитовый фон oklch(0.13 0.008 240), янтарный акцент oklch(0.769 0.188 70.08)
 * Типографика: Manrope (заголовки) + system-ui (тело)
 * Три вкладки:
 *   1. Тендеры — лента открытых тендеров с формой ставки
 *   2. Мои офферы — список поданных офферов и их статусы
 *   3. Сделки — активные сделки с управлением этапами работ
 */
import React, { useState, useCallback } from "react";
import {
  Search,
  MapPin,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Tag,
  Handshake,
  AlertCircle,
  RefreshCw,
  FileText,
  Send,
  Loader2,
  X,
  Wifi,
  WifiOff,
  Smartphone,
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  BarChart3,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useTenders } from "@/hooks/useTenders";
import { usePartnerDeals } from "@/hooks/usePartnerDeals";
import { toast } from "sonner";
import type { Tender, TenderBid, Offer, Deal, Milestone } from "@/lib/api.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatMoney(v: number | string | null | undefined): string {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDeadline(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Истёк";
  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Завтра";
  if (diffDays <= 7) return `${diffDays} дн.`;
  return formatDate(iso);
}

const TECH_LABELS: Record<string, string> = {
  brick: "Кирпич",
  wood: "Дерево",
  sip: "SIP-панели",
  concrete: "Монолит",
  frame: "Каркас",
  gas_block: "Газоблок",
  foam_block: "Пеноблок",
};

const OFFER_STATUS_LABELS: Record<string, string> = {
  pending: "На рассмотрении",
  accepted: "Принят",
  rejected: "Отклонён",
};

const OFFER_STATUS_COLORS: Record<string, string> = {
  pending: "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.769_0.188_70.08/0.1)]",
  accepted: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.75_0.18_160/0.1)]",
  rejected: "text-red-400 bg-red-400/10",
};

const DEAL_STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  pending_payment: "Ожидает оплаты",
  in_progress: "В работе",
  completed: "Завершена",
  dispute: "Спор",
};

const DEAL_STATUS_COLORS: Record<string, string> = {
  draft: "text-[oklch(0.55_0.012_240)] bg-[oklch(0.14_0.02_255)]",
  pending_payment: "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.769_0.188_70.08/0.1)]",
  in_progress: "text-[oklch(0.7_0.15_240)] bg-[oklch(0.7_0.15_240/0.1)]",
  completed: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.75_0.18_160/0.1)]",
  dispute: "text-red-400 bg-red-400/10",
};

const MILESTONE_STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает оплаты",
  payment_pending: "Оплата в процессе",
  paid_held: "Оплачен (удержан)",
  completed: "Завершён",
  refunded: "Возврат",
};

// ---------------------------------------------------------------------------
// Bid Form Modal
// ---------------------------------------------------------------------------
interface BidFormProps {
  tender: Tender;
  existingBid: TenderBid | undefined;
  onSubmit: (totalPrice: number, comment: string, timelineDays: number) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}

function BidFormModal({ tender, existingBid, onSubmit, onClose, submitting }: BidFormProps) {
  const [price, setPrice] = useState(
    existingBid ? String(existingBid.totalPrice) : String(tender.budgetMin ?? ""),
  );
  const [comment, setComment] = useState(existingBid?.comment ?? "");
  const [days, setDays] = useState(String(existingBid?.timelineDays ?? ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalPrice = parseFloat(price);
    if (isNaN(totalPrice) || totalPrice <= 0) {
      toast.error("Укажите корректную сумму");
      return;
    }
    const timelineDays = parseInt(days, 10);
    if (isNaN(timelineDays) || timelineDays <= 0) {
      toast.error("Укажите срок выполнения в днях");
      return;
    }
    await onSubmit(totalPrice, comment, timelineDays);
  };

  const budgetMin = tender.budgetMin ? parseFloat(String(tender.budgetMin)) : null;
  const budgetMax = tender.budgetMax ? parseFloat(String(tender.budgetMax)) : null;
  const priceNum = parseFloat(price);
  const isSuspiciousLow = budgetMin != null && !isNaN(priceNum) && priceNum < budgetMin * 0.7;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[oklch(0.13_0.008_240)] border border-[oklch(0.20_0.025_255)] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[oklch(0.18_0.01_240)]">
          <div>
            <h2
              className="text-lg font-bold text-white"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {existingBid ? "Ваша ставка" : "Подать ставку"}
            </h2>
            <p className="text-sm text-[oklch(0.5_0.012_240)] mt-0.5 line-clamp-1">
              {tender.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[oklch(0.14_0.02_255)] transition-colors"
          >
            <X size={18} className="text-[oklch(0.5_0.012_240)]" />
          </button>
        </div>

        {/* Budget reference */}
        {(budgetMin != null || budgetMax != null) && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[oklch(0.769_0.188_70.08/0.06)] border border-[oklch(0.769_0.188_70.08/0.2)]">
            <p className="text-xs text-[oklch(0.769_0.188_70.08)]">
              Бюджет заказчика:{" "}
              {budgetMin != null && budgetMax != null
                ? `${formatMoney(budgetMin)} — ${formatMoney(budgetMax)}`
                : budgetMin != null
                ? `от ${formatMoney(budgetMin)}`
                : `до ${formatMoney(budgetMax)}`}
            </p>
          </div>
        )}

        {existingBid ? (
          /* Show existing bid read-only */
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.20_0.025_255)] space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[oklch(0.5_0.012_240)]">Ваша цена</span>
                <span className="text-sm font-bold text-white">
                  {formatMoney(existingBid.totalPrice)}
                </span>
              </div>
              {existingBid.timelineDays != null && (
                <div className="flex justify-between">
                  <span className="text-sm text-[oklch(0.5_0.012_240)]">Срок</span>
                  <span className="text-sm text-white">{existingBid.timelineDays} дн.</span>
                </div>
              )}
              {existingBid.comment && (
                <div>
                  <span className="text-xs text-[oklch(0.5_0.012_240)]">Комментарий</span>
                  <p className="text-sm text-[oklch(0.7_0.01_240)] mt-1">{existingBid.comment}</p>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[oklch(0.20_0.025_255)]">
                <span className="text-xs text-[oklch(0.5_0.012_240)]">Статус</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    existingBid.status === "accepted"
                      ? "text-[oklch(0.75_0.18_160)] bg-[oklch(0.75_0.18_160/0.1)]"
                      : existingBid.status === "rejected"
                      ? "text-red-400 bg-red-400/10"
                      : "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.769_0.188_70.08/0.1)]"
                  }`}
                >
                  {existingBid.status === "accepted"
                    ? "Принята"
                    : existingBid.status === "rejected"
                    ? "Отклонена"
                    : "На рассмотрении"}
                </span>
              </div>
            </div>
            {existingBid.suspiciousLow && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-400/10 border border-orange-400/20">
                <AlertCircle size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-orange-400">
                  Ваша ставка значительно ниже бюджета заказчика. Это может снизить доверие.
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[oklch(0.14_0.02_255)] text-[oklch(0.7_0.01_240)] text-sm font-medium hover:bg-[oklch(0.17_0.02_255)] transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          /* Bid submission form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[oklch(0.6_0.01_240)] mb-1.5">
                Ваша цена (₽) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Введите сумму"
                min={1}
                required
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.20_0.025_255)] text-white placeholder-[oklch(0.4_0.01_240)] text-sm focus:outline-none focus:border-[oklch(0.769_0.188_70.08/0.6)] transition-colors"
              />
              {isSuspiciousLow && (
                <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> Цена значительно ниже бюджета — заказчик может
                  усомниться в качестве
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[oklch(0.6_0.01_240)] mb-1.5">
                Срок выполнения (дней) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="Например: 90"
                min={1}
                required
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.20_0.025_255)] text-white placeholder-[oklch(0.4_0.01_240)] text-sm focus:outline-none focus:border-[oklch(0.769_0.188_70.08/0.6)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[oklch(0.6_0.01_240)] mb-1.5">
                Комментарий
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Опишите ваш опыт, технологию, гарантии..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.20_0.025_255)] text-white placeholder-[oklch(0.4_0.01_240)] text-sm focus:outline-none focus:border-[oklch(0.769_0.188_70.08/0.6)] transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[oklch(0.14_0.02_255)] text-[oklch(0.7_0.01_240)] text-sm font-medium hover:bg-[oklch(0.17_0.02_255)] transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-sm font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Отправка...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Подать ставку
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

// ---------------------------------------------------------------------------
// Tender Card
// ---------------------------------------------------------------------------
function TenderCard({
  tender,
  ownBid,
  onBid,
}: {
  tender: Tender;
  ownBid: TenderBid | undefined;
  onBid: (t: Tender) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const budgetMin = tender.budgetMin ? parseFloat(String(tender.budgetMin)) : null;
  const budgetMax = tender.budgetMax ? parseFloat(String(tender.budgetMax)) : null;
  const deadlineStr = formatDeadline(tender.deadline ? String(tender.deadline) : null);
  const isUrgent =
    tender.deadline != null &&
    new Date(String(tender.deadline)).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] overflow-hidden transition-all duration-200 hover:border-[oklch(0.769_0.188_70.08/0.3)]">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {ownBid && (
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    ownBid.status === "accepted"
                      ? "text-[oklch(0.75_0.18_160)] bg-[oklch(0.75_0.18_160/0.1)]"
                      : ownBid.status === "rejected"
                      ? "text-red-400 bg-red-400/10"
                      : "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.769_0.188_70.08/0.1)]"
                  }`}
                >
                  {ownBid.status === "accepted"
                    ? "✓ Ставка принята"
                    : ownBid.status === "rejected"
                    ? "✗ Ставка отклонена"
                    : "⏳ Ставка подана"}
                </span>
              )}
              {isUrgent && !ownBid && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-red-400 bg-red-400/10">
                  Срочно
                </span>
              )}
            </div>
            <h3
              className="text-sm font-semibold text-white truncate"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {tender.title}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            {(budgetMin != null || budgetMax != null) && (
              <p className="text-sm font-bold text-[oklch(0.769_0.188_70.08)]">
                {budgetMin != null && budgetMax != null
                  ? `${formatMoney(budgetMin)} – ${formatMoney(budgetMax)}`
                  : budgetMin != null
                  ? `от ${formatMoney(budgetMin)}`
                  : `до ${formatMoney(budgetMax)}`}
              </p>
            )}
          </div>
        </div>

        {/* Meta tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tender.region && (
            <div className="flex items-center gap-1 text-xs text-[oklch(0.5_0.012_240)]">
              <MapPin size={11} />
              {tender.region}
            </div>
          )}
          {tender.technology && (
            <div className="flex items-center gap-1 text-xs text-[oklch(0.5_0.012_240)]">
              <Building2 size={11} />
              {TECH_LABELS[tender.technology] ?? tender.technology}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-[oklch(0.5_0.012_240)]">
            <Calendar size={11} />
            {deadlineStr}
          </div>
          <div className="flex items-center gap-1 text-xs text-[oklch(0.5_0.012_240)]">
            <Tag size={11} />
            {tender.bidsCount}{" "}
            {tender.bidsCount === 1
              ? "ставка"
              : tender.bidsCount < 5
              ? "ставки"
              : "ставок"}
          </div>
        </div>

        {/* Description (collapsible) */}
        {tender.description && (
          <div className="mb-4">
            <p
              className={`text-xs text-[oklch(0.5_0.012_240)] leading-relaxed ${
                !expanded ? "line-clamp-2" : ""
              }`}
            >
              {tender.description}
            </p>
            {tender.description.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-[11px] text-[oklch(0.769_0.188_70.08)] mt-1 hover:underline"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={11} /> Свернуть
                  </>
                ) : (
                  <>
                    <ChevronDown size={11} /> Читать далее
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[oklch(0.4_0.01_240)]">
            {formatDate(tender.insertedAt)}
          </span>
          <button
            onClick={() => onBid(tender)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              ownBid
                ? "bg-[oklch(0.14_0.02_255)] text-[oklch(0.6_0.01_240)] hover:bg-[oklch(0.17_0.02_255)]"
                : "bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] hover:bg-[oklch(0.72_0.19_70.08)]"
            }`}
          >
            {ownBid ? (
              <>
                <FileText size={12} /> Моя ставка
              </>
            ) : (
              <>
                <Send size={12} /> Подать ставку
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Offer Card (partner's own offers)
// ---------------------------------------------------------------------------
function OfferCard({ offer }: { offer: Offer }) {
  const status = offer.status as string;
  const colorCls =
    OFFER_STATUS_COLORS[status] ?? "text-[oklch(0.55_0.012_240)] bg-[oklch(0.14_0.02_255)]";
  const label = OFFER_STATUS_LABELS[status] ?? status;

  return (
    <div className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[oklch(0.14_0.02_255)] flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-[oklch(0.769_0.188_70.08)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Оффер #{offer.id.slice(0, 8)}</p>
            <p className="text-xs text-[oklch(0.5_0.012_240)] mt-0.5">
              {formatDate(offer.insertedAt)}
            </p>
          </div>
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${colorCls}`}>
          {label}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[oklch(0.18_0.01_240)]">
        <div>
          <p className="text-xs text-[oklch(0.5_0.012_240)]">Сумма предложения</p>
          <p className="text-lg font-bold text-white mt-0.5">{formatMoney(offer.totalPrice)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[oklch(0.5_0.012_240)]">Проект</p>
          <p className="text-xs text-[oklch(0.7_0.01_240)] mt-0.5 font-mono">
            #{offer.projectId.slice(0, 8)}
          </p>
        </div>
      </div>

      {offer.comment && (
        <p className="text-xs text-[oklch(0.5_0.012_240)] mt-3 pt-3 border-t border-[oklch(0.18_0.01_240)] line-clamp-2">
          {offer.comment}
        </p>
      )}

      {offer.status === "accepted" && (
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-[oklch(0.75_0.18_160/0.08)] border border-[oklch(0.75_0.18_160/0.2)]">
          <BadgeCheck size={14} className="text-[oklch(0.75_0.18_160)] flex-shrink-0" />
          <p className="text-xs text-[oklch(0.75_0.18_160)]">
            Оффер принят — сделка создана автоматически
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deal Card (partner's active deals)
// ---------------------------------------------------------------------------
function DealCard({
  deal,
  onComplete,
  completingId,
}: {
  deal: Deal;
  onComplete: (milestoneId: string) => Promise<void>;
  completingId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = deal.status as string;
  const colorCls =
    DEAL_STATUS_COLORS[status] ?? "text-[oklch(0.55_0.012_240)] bg-[oklch(0.14_0.02_255)]";
  const label = DEAL_STATUS_LABELS[status] ?? status;
  const milestones = deal.milestones ?? [];
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const canComplete = (m: Milestone) => m.status === "paid_held";

  return (
    <div className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[oklch(0.14_0.02_255)] flex items-center justify-center">
              <Handshake size={20} className="text-[oklch(0.769_0.188_70.08)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Сделка #{deal.id.slice(0, 8)}</p>
              <p className="text-xs text-[oklch(0.5_0.012_240)] mt-0.5">
                {formatDate(deal.insertedAt)}
              </p>
            </div>
          </div>
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${colorCls}`}>
            {label}
          </span>
        </div>

        {totalAmount > 0 && (
          <div className="text-xl font-bold text-white mb-3">{formatMoney(totalAmount)}</div>
        )}

        {milestones.length > 0 && (
          <>
            <div className="flex items-center justify-between text-xs text-[oklch(0.5_0.012_240)] mb-1.5">
              <span>Прогресс этапов</span>
              <span>
                {completedCount} / {milestones.length}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[oklch(0.2_0.01_240)] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-[oklch(0.769_0.188_70.08)] rounded-full transition-all"
                style={{
                  width: `${
                    milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0
                  }%`,
                }}
              />
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-[oklch(0.769_0.188_70.08)] hover:underline mb-2"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Скрыть этапы" : "Показать этапы"}
            </button>
          </>
        )}

        {deal.escrowAccount && (
          <div className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.012_240)]">
            <CircleDollarSign size={11} className="text-[oklch(0.75_0.18_160)]" />
            Эскроу активен
          </div>
        )}
      </div>

      {/* Milestones expanded */}
      {expanded && milestones.length > 0 && (
        <div className="border-t border-[oklch(0.18_0.01_240)] divide-y divide-[oklch(0.18_0.01_240)]">
          {milestones.map((m) => {
            const ms = m.status as string;
            const isCompleting = completingId === m.id;
            const canAct = canComplete(m);

            return (
              <div
                key={m.id}
                className="px-5 py-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {ms === "completed" ? (
                    <CheckCircle2
                      size={16}
                      className="text-[oklch(0.75_0.18_160)] flex-shrink-0"
                    />
                  ) : ms === "paid_held" ? (
                    <CircleDollarSign
                      size={16}
                      className="text-[oklch(0.769_0.188_70.08)] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[oklch(0.35_0.01_240)] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{m.title}</p>
                    <p className="text-[11px] text-[oklch(0.5_0.012_240)] mt-0.5">
                      {MILESTONE_STATUS_LABELS[ms] ?? ms}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-sm font-bold text-white">
                    {formatMoney(parseFloat(m.amount))}
                  </p>
                  {canAct && (
                    <button
                      onClick={() => onComplete(m.id)}
                      disabled={isCompleting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-[11px] font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isCompleting ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={11} />
                      )}
                      Выполнено
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[oklch(0.13_0.018_255)] border border-[oklch(0.20_0.025_255)] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[oklch(0.4_0.01_240)]" />
      </div>
      <h3
        className="text-base font-semibold text-white mb-2"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-sm text-[oklch(0.5_0.012_240)] max-w-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
type TabId = "tenders" | "offers" | "deals";

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("tenders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [isOnline] = useState(() => navigator.onLine);

  const {
    tenders,
    loading: tendersLoading,
    error: tendersError,
    filters,
    setFilters,
    refresh: refreshTenders,
    submitBid,
    submittingBidId,
    ownBids,
    fetchTenderDetail,
  } = useTenders();

  const {
    offers,
    deals,
    loading: dealsLoading,
    error: dealsError,
    refresh: refreshDeals,
    completeMilestone,
    completingId,
  } = usePartnerDeals();

  // Filter tenders by search
  const filteredTenders = tenders.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.region?.toLowerCase().includes(q) ||
      t.technology?.toLowerCase().includes(q)
    );
  });

  const handleBidClick = useCallback(
    async (tender: Tender) => {
      try {
        const detail = await fetchTenderDetail(tender.id);
        setSelectedTender(detail);
      } catch {
        setSelectedTender(tender);
      }
    },
    [fetchTenderDetail],
  );

  const handleBidSubmit = useCallback(
    async (totalPrice: number, comment: string, timelineDays: number) => {
      if (!selectedTender) return;
      try {
        await submitBid(selectedTender.id, { totalPrice, comment, timelineDays });
        toast.success("Ставка успешно подана!");
        setSelectedTender(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Ошибка при подаче ставки";
        toast.error(msg);
      }
    },
    [selectedTender, submitBid],
  );

  const handleMilestoneComplete = useCallback(
    async (milestoneId: string) => {
      try {
        await completeMilestone(milestoneId);
        toast.success("Этап отмечен как выполненный. Заказчик получит уведомление.");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Ошибка при обновлении этапа";
        toast.error(msg);
      }
    },
    [completeMilestone],
  );

  // Stats
  const activeTendersCount = tenders.filter((t) => t.status === "open").length;
  const pendingOffersCount = offers.filter((o) => o.status === "pending").length;
  const activeDealsCount = deals.filter((d) => d.status === "in_progress").length;
  const totalEarnings = deals
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => {
      const amount =
        d.milestones?.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0) ?? 0;
      return sum + amount;
    }, 0);

  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "tenders", label: "Тендеры", icon: Search, count: activeTendersCount },
    { id: "offers", label: "Мои офферы", icon: FileText, count: pendingOffersCount },
    { id: "deals", label: "Сделки", icon: Handshake, count: activeDealsCount },
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
              {user?.firstName ? `Кабинет ${user.firstName}` : "Кабинет партнёра"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-[oklch(0.5_0.012_240)]">
                {user?.role === "supplier" ? "Поставщик" : "Подрядчик"}
              </p>
              <span className="text-[oklch(0.3_0.01_240)]">·</span>
              <div className="flex items-center gap-1 text-xs">
                {isOnline ? (
                  <>
                    <Wifi size={11} className="text-[oklch(0.75_0.18_160)]" />
                    <span className="text-[oklch(0.55_0.012_240)]">Онлайн</span>
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
            <span className="text-xs text-[oklch(0.5_0.012_240)]">Обновление каждые 30с</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Открытых тендеров",
              value: activeTendersCount,
              icon: Search,
              color: "text-[oklch(0.769_0.188_70.08)]",
              isText: false,
            },
            {
              label: "Ставок в ожидании",
              value: pendingOffersCount,
              icon: Clock,
              color: "text-[oklch(0.7_0.15_240)]",
              isText: false,
            },
            {
              label: "Активных сделок",
              value: activeDealsCount,
              icon: Handshake,
              color: "text-[oklch(0.75_0.18_160)]",
              isText: false,
            },
            {
              label: "Заработано",
              value: formatMoney(totalEarnings),
              icon: BarChart3,
              color: "text-[oklch(0.769_0.188_70.08)]",
              isText: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[oklch(0.20_0.025_255)] bg-[oklch(0.13_0.008_240)] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} className={stat.color} />
                <span className="text-xs text-[oklch(0.5_0.012_240)] truncate">{stat.label}</span>
              </div>
              <p className={`font-bold text-white ${stat.isText ? "text-base" : "text-2xl"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-[oklch(0.13_0.008_240)] border border-[oklch(0.20_0.025_255)] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)]"
                  : "text-[oklch(0.5_0.012_240)] hover:text-white hover:bg-[oklch(0.14_0.02_255)]"
              }`}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count != null && tab.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-[oklch(0.1_0.01_70/0.3)] text-[oklch(0.1_0.01_70)]"
                      : "bg-[oklch(0.769_0.188_70.08/0.15)] text-[oklch(0.769_0.188_70.08)]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Tenders */}
        {activeTab === "tenders" && (
          <div className="space-y-4">
            {/* Search + refresh */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.4_0.01_240)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по тендерам..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[oklch(0.13_0.008_240)] border border-[oklch(0.20_0.025_255)] text-white placeholder-[oklch(0.4_0.01_240)] text-sm focus:outline-none focus:border-[oklch(0.769_0.188_70.08/0.5)] transition-colors"
                />
              </div>
              <button
                onClick={refreshTenders}
                className="p-2.5 rounded-xl bg-[oklch(0.13_0.008_240)] border border-[oklch(0.20_0.025_255)] text-[oklch(0.5_0.012_240)] hover:text-white hover:border-[oklch(0.769_0.188_70.08/0.4)] transition-all"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Status filter chips */}
            <div className="flex gap-2 flex-wrap">
              {["open", "all"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilters({ ...filters, status: s })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (filters.status ?? "open") === s
                      ? "bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)]"
                      : "bg-[oklch(0.13_0.018_255)] text-[oklch(0.5_0.012_240)] hover:bg-[oklch(0.2_0.01_240)]"
                  }`}
                >
                  {s === "open" ? "Открытые" : "Все"}
                </button>
              ))}
            </div>

            {tendersLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-[oklch(0.769_0.188_70.08)]" />
              </div>
            ) : tendersError ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-400/10 border border-red-400/20">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{tendersError}</p>
              </div>
            ) : filteredTenders.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Тендеры не найдены"
                description={
                  searchQuery
                    ? "Попробуйте изменить поисковый запрос или фильтры"
                    : "Пока нет открытых тендеров. Проверьте позже."
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredTenders.map((tender) => (
                  <TenderCard
                    key={tender.id}
                    tender={tender}
                    ownBid={ownBids[tender.id]}
                    onBid={handleBidClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: My Offers */}
        {activeTab === "offers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[oklch(0.5_0.012_240)]">
                {offers.length}{" "}
                {offers.length === 1 ? "оффер" : offers.length < 5 ? "оффера" : "офферов"}
              </p>
              <button
                onClick={refreshDeals}
                className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.012_240)] hover:text-white transition-colors"
              >
                <RefreshCw size={12} />
                Обновить
              </button>
            </div>

            {dealsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-[oklch(0.769_0.188_70.08)]" />
              </div>
            ) : dealsError ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-400/10 border border-red-400/20">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{dealsError}</p>
              </div>
            ) : offers.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Нет поданных офферов"
                description="Перейдите на вкладку «Тендеры» и подайте ставку на интересующий проект."
                action={
                  <button
                    onClick={() => setActiveTab("tenders")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-sm font-semibold hover:bg-[oklch(0.72_0.19_70.08)] transition-colors"
                  >
                    <ArrowRight size={14} />
                    Смотреть тендеры
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Deals */}
        {activeTab === "deals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[oklch(0.5_0.012_240)]">
                {deals.length}{" "}
                {deals.length === 1 ? "сделка" : deals.length < 5 ? "сделки" : "сделок"}
              </p>
              <button
                onClick={refreshDeals}
                className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.012_240)] hover:text-white transition-colors"
              >
                <RefreshCw size={12} />
                Обновить
              </button>
            </div>

            {dealsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-[oklch(0.769_0.188_70.08)]" />
              </div>
            ) : dealsError ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-400/10 border border-red-400/20">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{dealsError}</p>
              </div>
            ) : deals.length === 0 ? (
              <EmptyState
                icon={Handshake}
                title="Нет активных сделок"
                description="Сделки появятся после того, как заказчик примет ваш оффер или ставку на тендер."
              />
            ) : (
              <div className="space-y-3">
                {deals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onComplete={handleMilestoneComplete}
                    completingId={completingId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bid Form Modal */}
      {selectedTender && (
        <BidFormModal
          tender={selectedTender}
          existingBid={ownBids[selectedTender.id]}
          onSubmit={handleBidSubmit}
          onClose={() => setSelectedTender(null)}
          submitting={submittingBidId === selectedTender.id}
        />
      )}
    </DashboardLayout>
  );
}
