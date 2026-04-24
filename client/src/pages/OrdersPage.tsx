/**
 * OrdersPage — /orders
 * Customer order history with status tracking. Light theme.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { marketplaceApi } from "@/lib/marketplace.api";
import type { Order } from "@/lib/marketplace.types";
import MarketplaceLayout, { LightCard, StatusBadge } from "@/components/MarketplaceLayout";
import {
  Package,
  Truck,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

const ORDER_TIMELINE: Record<string, { steps: string[]; current: number }> = {
  pending:    { steps: ["Оформлен", "Подтверждён", "В обработке", "Отправлен", "Доставлен"], current: 0 },
  confirmed:  { steps: ["Оформлен", "Подтверждён", "В обработке", "Отправлен", "Доставлен"], current: 1 },
  processing: { steps: ["Оформлен", "Подтверждён", "В обработке", "Отправлен", "Доставлен"], current: 2 },
  shipped:    { steps: ["Оформлен", "Подтверждён", "В обработке", "Отправлен", "Доставлен"], current: 3 },
  delivered:  { steps: ["Оформлен", "Подтверждён", "В обработке", "Отправлен", "Доставлен"], current: 4 },
  cancelled:  { steps: ["Оформлен", "Отменён"], current: 1 },
  refunded:   { steps: ["Оформлен", "Отменён", "Возврат выполнен"], current: 2 },
};

function OrderTimeline({ status }: { status: string }) {
  const tl = ORDER_TIMELINE[status] ?? ORDER_TIMELINE.pending;
  return (
    <div className="flex items-center gap-0">
      {tl.steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={
                i < tl.current
                  ? { background: "#D1FAE5", color: "#059669" }
                  : i === tl.current
                  ? { background: "#2563EB", color: "#fff" }
                  : { background: "#F3F4F6", color: "#9CA3AF" }
              }
            >
              {i < tl.current ? <CheckCircle2 size={12} /> : i + 1}
            </div>
            <span className="text-[9px] text-gray-500 mt-1 text-center max-w-[52px] leading-tight">{step}</span>
          </div>
          {i < tl.steps.length - 1 && (
            <div
              className="w-8 sm:w-12 h-0.5 mb-4 mx-0.5"
              style={{ background: i < tl.current ? "#D1FAE5" : "#E5E7EB" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <LightCard padding="p-0" className="overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
            <Package size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>
                {order.orderNumber}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {formatDate(order.createdAt)} · {order.items.length} поз. · {formatPrice(order.total)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
              <Truck size={12} className="text-blue-500" />
              до {new Date(order.estimatedDelivery).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
            </div>
          )}
          {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-5 py-4 space-y-5" style={{ borderColor: "#F3F4F6" }}>
          {/* Timeline */}
          <div className="overflow-x-auto pb-1">
            <OrderTimeline status={order.status} />
          </div>

          {/* Items */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Товары</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.supplierName} · {item.quantity} {item.unit}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: "#F3F4F6" }}>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin size={11} /> Доставка
              </div>
              <p className="text-sm text-gray-700">{order.deliveryAddress.region}</p>
              <p className="text-xs text-gray-500">{order.deliveryAddress.city}, {order.deliveryAddress.street}</p>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CreditCard size={11} /> Оплата
              </div>
              <p className="text-sm text-gray-700">
                {order.paymentMethod === "card" ? "Банковская карта" : order.paymentMethod === "escrow" ? "Эскроу" : "Счёт"}
              </p>
              <StatusBadge status={order.paymentStatus} />
            </div>
            {order.trackingNumber && (
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Truck size={11} /> Трекинг
                </div>
                <p className="text-sm font-mono text-blue-600">{order.trackingNumber}</p>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#F3F4F6" }}>
            <div className="text-sm text-gray-500">
              Товары {formatPrice(order.subtotal)} + доставка {formatPrice(order.deliveryCost)}
            </div>
            <div className="font-black text-lg text-gray-900">{formatPrice(order.total)}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {order.status === "delivered" && (
              <button className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                Оставить отзыв
              </button>
            )}
            {(order.status === "pending" || order.status === "confirmed") && (
              <button className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors hover:bg-red-50" style={{ borderColor: "#FCA5A5", color: "#DC2626" }}>
                Отменить заказ
              </button>
            )}
            <Link href="/marketplace">
              <button className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors" style={{ background: "#F3F4F6", color: "#374151" }}>
                Повторить заказ
              </button>
            </Link>
          </div>
        </div>
      )}
    </LightCard>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    marketplaceApi.orders.list()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const STATUS_FILTERS = [
    { id: "all", label: "Все" },
    { id: "pending", label: "Ожидают" },
    { id: "processing", label: "В обработке" },
    { id: "shipped", label: "В пути" },
    { id: "delivered", label: "Доставлены" },
    { id: "cancelled", label: "Отменены" },
  ];

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <MarketplaceLayout
      title="Мои заказы"
      breadcrumbs={[{ label: "Каталог", href: "/marketplace" }, { label: "Мои заказы" }]}
      actions={
        <Link href="/marketplace">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors" style={{ background: "#2563EB", color: "#fff" }}>
            <ShoppingBag size={16} /> Каталог
          </button>
        </Link>
      }
    >
      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors"
            style={
              filter === f.id
                ? { background: "#2563EB", color: "#fff", borderColor: "#2563EB" }
                : { borderColor: "#E5E7EB", color: "#6B7280", background: "#fff" }
            }
          >
            {f.label}
            {f.id !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                {orders.filter((o) => o.status === f.id).length || ""}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white border animate-pulse" style={{ borderColor: "#E5E7EB" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <LightCard className="text-center py-16">
          <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {filter === "all" ? "Заказов пока нет" : "Нет заказов в этом статусе"}
          </h3>
          <p className="text-sm text-gray-500 mb-5">Перейдите в каталог, чтобы выбрать товары</p>
          <Link href="/marketplace">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm mx-auto" style={{ background: "#F59E0B", color: "#1C1917" }}>
              Перейти в каталог <ArrowRight size={16} />
            </button>
          </Link>
        </LightCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}

      {/* Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Всего заказов", value: orders.length, icon: <Package size={20} className="text-blue-600" /> },
            { label: "Доставлено", value: orders.filter((o) => o.status === "delivered").length, icon: <CheckCircle2 size={20} className="text-green-600" /> },
            { label: "В обработке", value: orders.filter((o) => ["pending","confirmed","processing","shipped"].includes(o.status)).length, icon: <Clock size={20} className="text-amber-600" /> },
            { label: "Потрачено", value: formatPrice(orders.reduce((s, o) => s + o.total, 0)), icon: <CreditCard size={20} className="text-purple-600" /> },
          ].map((stat) => (
            <LightCard key={stat.label} padding="p-4" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F8FAFC" }}>
                {stat.icon}
              </div>
              <div>
                <div className="font-black text-lg text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </LightCard>
          ))}
        </div>
      )}
    </MarketplaceLayout>
  );
}
