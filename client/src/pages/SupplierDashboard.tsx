/**
 * SupplierDashboard — /supplier
 * Supplier cabinet: product management, incoming orders, analytics.
 * Light theme with blue accents.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { marketplaceApi } from "@/lib/marketplace.api";
import type { Product, Order, SupplierOrder, SupplierStats } from "@/lib/marketplace.types";
import MarketplaceLayout, { LightCard, StatusBadge } from "@/components/MarketplaceLayout";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  BarChart3,
  Settings,
  Search,
  Filter,
  ChevronDown,
  Upload,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

type Tab = "overview" | "products" | "orders" | "analytics";

// ── Product management row ────────────────────────────────────────────────────
function ProductRow({
  product,
  onToggle,
  onDelete,
}: {
  product: Product;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const primaryImage = product.images.find((i) => i) ?? product.images[0];
  return (
    <tr className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: "#F3F4F6" }}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {primaryImage ? (
              <img src={primaryImage} alt={"image"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={16} className="text-gray-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{product.name}</p>
            <p className="text-xs text-gray-500">{product.categoryName}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm font-semibold text-gray-900">{formatPrice(product.price)}</td>
      <td className="py-3 px-4">
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={
            product.stockAvailable > 0
              ? { background: "#D1FAE5", color: "#059669" }
              : { background: "#FEE2E2", color: "#DC2626" }
          }
        >
          {product.stockAvailable > 0 ? `В наличии${product.stockAvailable ? ` (${product.stockAvailable})` : ""}` : "Нет"}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-sm text-gray-700">{(product.rating ?? 0).toFixed(1)}</span>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(product.id)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={product.stockAvailable > 0 ? "Снять с продажи" : "Выставить в продажу"}
          >
            {product.stockAvailable > 0 ? <Eye size={15} className="text-blue-600" /> : <EyeOff size={15} className="text-gray-400" />}
          </button>
          <Link href={`/supplier/products/${product.id}/edit`}>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Edit2 size={15} className="text-gray-500" />
            </button>
          </Link>
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Incoming order row ────────────────────────────────────────────────────────
function OrderRow({ order, onUpdateStatus }: { order: SupplierOrder; onUpdateStatus: (id: string, status: string) => void }) {
  const [showActions, setShowActions] = useState(false);
  const NEXT_STATUS: Record<string, string> = {
    pending: "confirmed",
    confirmed: "confirmed",
    processing: "shipped",
    shipped: "delivered",
  };
  const next = NEXT_STATUS[order.status];

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: "#F3F4F6" }}>
      <td className="py-3 px-4">
        <span className="font-mono text-sm font-bold text-gray-900">{(order as any).orderNumber ?? `TD-${order.id.slice(0,6).toUpperCase()}`}</span>
        <div className="text-xs text-gray-400">{formatDate(order.insertedAt)}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-700">{order.deliveryAddress.city}</div>
        <div className="text-xs text-gray-400">{order.deliveryAddress.region}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-700">{order.items.length} поз.</div>
        <div className="text-xs text-gray-400">{order.items.map((i) => i.productSnapshot?.name ?? "Товар").join(", ").slice(0, 40)}...</div>
      </td>
      <td className="py-3 px-4 font-semibold text-sm text-gray-900">{formatPrice(order.totalAmount)}</td>
      <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
      <td className="py-3 px-4">
        {next && (
          <button
            onClick={() => onUpdateStatus(order.id, next)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            style={{ background: "#EFF6FF", color: "#2563EB" }}
          >
            → {next === "confirmed" ? "Подтвердить" : next === "confirmed" ? "В обработку" : next === "shipped" ? "Отправить" : "Доставлен"}
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SupplierDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      marketplaceApi.supplier.products.list(),
      marketplaceApi.supplier.orders.list(),
      marketplaceApi.supplier.stats(),
    ])
      .then(([p, o, s]) => {
        setProducts(p);
        setOrders(o);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive, stockAvailable: p.isActive ? 0 : p.stockTotal } : p))
    );
    toast.success("Статус товара обновлён");
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Товар удалён");
  };

  const handleUpdateOrderStatus = (id: string, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: status as SupplierOrder["status"] } : o))
    );
    toast.success("Статус заказа обновлён");
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const pendingOrders = orders.filter((o) => (["pending", "confirmed"] as SupplierOrder["status"][]).includes(o.status));
  const activeOrders = orders.filter((o) => (["confirmed", "shipped"] as SupplierOrder["status"][]).includes(o.status));

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Обзор", icon: <BarChart3 size={16} /> },
    { id: "products", label: "Товары", icon: <Package size={16} />, badge: products.length },
    { id: "orders", label: "Заказы", icon: <ShoppingBag size={16} />, badge: pendingOrders.length || undefined },
    { id: "analytics", label: "Аналитика", icon: <TrendingUp size={16} /> },
  ];

  return (
    <MarketplaceLayout
      title="Кабинет поставщика"
      breadcrumbs={[{ label: "Маркетплейс", href: "/marketplace" }, { label: "Кабинет поставщика" }]}
      actions={
        <button
          onClick={() => toast.info("Добавление товара — в разработке")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          style={{ background: "#2563EB", color: "#fff", fontFamily: "Montserrat, sans-serif" }}
        >
          <Plus size={16} /> Добавить товар
        </button>
      }
    >
      {/* Tab navigation */}
      <div className="flex gap-1 border-b mb-6" style={{ borderColor: "#E5E7EB" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px relative"
            style={
              tab === t.id
                ? { borderColor: "#2563EB", color: "#2563EB" }
                : { borderColor: "transparent", color: "#6B7280" }
            }
          >
            {t.icon}
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                style={{ background: "#EF4444", color: "#fff" }}
              >
                {t.badge > 9 ? "9+" : t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Выручка (месяц)",
                value: stats ? formatPrice(stats.revenueMonth) : "—",
                delta: stats?.revenueGrowth,
                icon: <DollarSign size={22} className="text-green-600" />,
                bg: "#F0FDF4",
              },
              {
                label: "Заказов (месяц)",
                value: stats?.ordersMonth ?? "—",
                delta: stats?.ordersGrowth,
                icon: <ShoppingBag size={22} className="text-blue-600" />,
                bg: "#EFF6FF",
              },
              {
                label: "Активных товаров",
                value: products.filter((p) => p.stockAvailable > 0).length,
                icon: <Package size={22} className="text-purple-600" />,
                bg: "#F5F3FF",
              },
              {
                label: "Средний рейтинг",
                value: stats ? stats.avgRating.toFixed(1) : "—",
                icon: <Star size={22} className="text-amber-500" />,
                bg: "#FFFBEB",
              },
            ].map((kpi) => (
              <LightCard key={kpi.label} padding="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                    {kpi.icon}
                  </div>
                  {kpi.delta !== undefined && (
                    <span
                      className="flex items-center gap-0.5 text-xs font-bold"
                      style={{ color: kpi.delta >= 0 ? "#059669" : "#DC2626" }}
                    >
                      {kpi.delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(kpi.delta)}%
                    </span>
                  )}
                </div>
                <div className="font-black text-2xl text-gray-900">{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
              </LightCard>
            ))}
          </div>

          {/* Pending orders alert */}
          {pendingOrders.length > 0 && (
            <div className="rounded-2xl border bg-white p-4 border-l-4" style={{ borderLeftColor: "#F59E0B", borderColor: "#E5E7EB" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-amber-500" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {pendingOrders.length} {pendingOrders.length === 1 ? "заказ ожидает" : "заказа ожидают"} подтверждения
                    </p>
                    <p className="text-xs text-gray-500">Подтвердите заказы в течение 24 часов</p>
                  </div>
                </div>
                <button
                  onClick={() => setTab("orders")}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                  style={{ background: "#FEF3C7", color: "#92400E" }}
                >
                  Перейти →
                </button>
               </div>
            </div>
          )}
          {/* Recent orders */}
          <LightCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Последние заказы</h3>
              <button onClick={() => setTab("orders")} className="text-sm text-blue-600 hover:underline">Все заказы</button>
            </div>
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#F3F4F6" }}>
                <div>
                  <span className="font-mono text-sm font-bold text-gray-900">{(order as any).orderNumber ?? `TD-${order.id.slice(0,6).toUpperCase()}`}</span>
                  <span className="text-xs text-gray-400 ml-2">{formatDate(order.insertedAt)}</span>
                </div>
                <StatusBadge status={order.status} />
                <span className="font-semibold text-sm text-gray-900">{formatPrice(order.totalAmount)}</span>
              </div>
            ))}
          </LightCard>
        </div>
      )}

      {/* ── Products ─────────────────────────────────────────────────────── */}
      {tab === "products" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                style={{ borderColor: "#E5E7EB" }}
              />
            </div>
            <button
              onClick={() => toast.info("Импорт товаров — в разработке")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
            >
              <Upload size={15} /> Импорт CSV
            </button>
          </div>

          <LightCard padding="p-0" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Товар</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Цена</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Наличие</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Рейтинг</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-4 py-3">
                          <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">
                        <Package size={36} className="mx-auto mb-2 text-gray-200" />
                        Товары не найдены
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <ProductRow
                        key={p.id}
                        product={p}
                        onToggle={handleToggleProduct}
                        onDelete={handleDeleteProduct}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </LightCard>
        </div>
      )}

      {/* ── Orders ───────────────────────────────────────────────────────── */}
      {tab === "orders" && (
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Ожидают", value: pendingOrders.length, color: "#F59E0B", icon: <Clock size={18} /> },
              { label: "В обработке", value: activeOrders.length, color: "#2563EB", icon: <Truck size={18} /> },
              { label: "Выполнено", value: orders.filter((o) => o.status === "delivered").length, color: "#059669", icon: <CheckCircle2 size={18} /> },
            ].map((s) => (
              <LightCard key={s.label} padding="p-4" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.color + "20", color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div className="font-black text-xl text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </LightCard>
            ))}
          </div>

          <LightCard padding="p-0" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Заказ</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Адрес</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Товары</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Сумма</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Статус</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        <ShoppingBag size={36} className="mx-auto mb-2 text-gray-200" />
                        Заказов пока нет
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <OrderRow key={o.id} order={o} onUpdateStatus={handleUpdateOrderStatus} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </LightCard>
        </div>
      )}

      {/* ── Analytics ────────────────────────────────────────────────────── */}
      {tab === "analytics" && (
        <LightCard className="text-center py-16">
          <BarChart3 size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Аналитика в разработке
          </h3>
          <p className="text-sm text-gray-500">
            Здесь будут графики выручки, конверсии и топ-товаров
          </p>
        </LightCard>
      )}
    </MarketplaceLayout>
  );
}
