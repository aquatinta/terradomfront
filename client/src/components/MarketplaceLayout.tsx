/**
 * MarketplaceLayout — light-themed layout for marketplace pages
 * Design: Clean white/light-grey e-commerce aesthetic
 * Contrast with dark main app — intentionally different to signal "shopping mode"
 *
 * Palette:
 *   bg: #F8F9FB (very light blue-grey)
 *   sidebar: #FFFFFF with subtle border
 *   accent: #2563EB (blue) + #F59E0B (amber for CTA)
 *   text: #111827 (near-black) / #6B7280 (muted)
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  ShoppingCart,
  Package,
  ClipboardList,
  LayoutDashboard,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Bell,
  User,
  BarChart3,
  Plus,
  Truck,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  roles?: ("customer" | "partner" | "supplier" | "admin")[];
}

function useMarketplaceNav(cartCount: number): NavItem[] {
  return [
    { label: "Каталог", href: "/marketplace", icon: <Store size={18} /> },
    { label: "Корзина", href: "/cart", icon: <ShoppingCart size={18} />, badge: cartCount, roles: ["customer", "admin"] },
    { label: "Мои заказы", href: "/orders", icon: <ClipboardList size={18} />, roles: ["customer", "admin"] },
    { label: "Мои товары", href: "/supplier/products", icon: <Package size={18} />, roles: ["supplier", "partner"] },
    { label: "Заказы клиентов", href: "/supplier/orders", icon: <Truck size={18} />, roles: ["supplier", "partner"] },
    { label: "Аналитика", href: "/supplier/analytics", icon: <BarChart3 size={18} />, roles: ["supplier", "partner"] },
  ];
}

interface MarketplaceLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export default function MarketplaceLayout({ children, title, breadcrumbs, actions }: MarketplaceLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = useMarketplaceNav(cart.itemCount);

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role as "customer" | "partner" | "supplier" | "admin");
  });

  const isActive = (href: string) => {
    if (href === "/marketplace") return location === "/marketplace" || location.startsWith("/marketplace/");
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen" style={{ background: "#F0F4F8" }}>
      {/* ── Top header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          {/* Left: Logo + hamburger */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
                style={{ background: "#F59E0B", color: "#1C1917" }}
              >
                Т
              </div>
              <span className="font-bold text-gray-900 text-sm hidden sm:block" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Террадом
              </span>
              <span className="text-xs text-gray-400 hidden sm:block">/</span>
              <span className="text-xs font-semibold text-blue-600 hidden sm:block" style={{ fontFamily: "Manrope, sans-serif" }}>
                Маркетплейс
              </span>
            </Link>
          </div>

          {/* Center: breadcrumbs (desktop) */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="hidden lg:flex items-center gap-1 text-sm">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Home size={14} />
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight size={14} className="text-gray-300" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="text-gray-500 hover:text-blue-600 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-800 font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* Right: cart + user */}
          <div className="flex items-center gap-2">
            {/* Cart icon */}
            <Link href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ShoppingCart size={20} className="text-gray-600" />
              {cart.itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "#2563EB", color: "#fff" }}
                >
                  {cart.itemCount > 9 ? "9+" : cart.itemCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>

            {/* User */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "#EFF6FF", color: "#2563EB" }}
                >
                  {(user.firstName?.[0] ?? user.phone[1] ?? "U").toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-800 leading-none" style={{ fontFamily: "Manrope, sans-serif" }}>
                    {user.firstName ?? "Пользователь"}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: "#2563EB", color: "#fff" }}
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar (desktop) ──────────────────────────────────────────── */}
        <aside
          className="hidden lg:flex flex-col w-56 min-h-[calc(100vh-3.5rem)] sticky top-14 border-r"
          style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
        >
          <nav className="flex-1 p-3 space-y-0.5">
            {visibleItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
                  style={
                    active
                      ? { background: "#EFF6FF", color: "#2563EB" }
                      : { color: "#374151" }
                  }
                >
                  <span
                    className="flex-shrink-0 transition-colors"
                    style={{ color: active ? "#2563EB" : "#9CA3AF" }}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#2563EB", color: "#fff" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: back to main + logout */}
          <div className="p-3 border-t space-y-0.5" style={{ borderColor: "#E5E7EB" }}>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: "#6B7280" }}
            >
              <LayoutDashboard size={18} className="text-gray-400" />
              <span>Мой кабинет</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: "#6B7280" }}
            >
              <User size={18} className="text-gray-400" />
              <span>Профиль</span>
            </Link>
            {user && (
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-red-50"
                style={{ color: "#6B7280" }}
              >
                <LogOut size={18} className="text-gray-400" />
                <span>Выйти</span>
              </button>
            )}
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ─────────────────────────────────────── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-black/30" />
            <aside
              className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
              style={{ background: "#FFFFFF" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
                <span className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Маркетплейс
                </span>
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-600" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                      style={active ? { background: "#EFF6FF", color: "#2563EB" } : { color: "#374151" }}
                    >
                      <span style={{ color: active ? "#2563EB" : "#9CA3AF" }}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#2563EB", color: "#fff" }}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Page header */}
          {(title || actions) && (
            <div
              className="border-b px-4 lg:px-8 py-4 flex items-center justify-between"
              style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
            >
              <div>
                {title && (
                  <h1
                    className="text-xl font-bold text-gray-900"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {title}
                  </h1>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          )}

          {/* Content */}
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Reusable light-theme UI primitives ─────────────────────────────────────

export function LightCard({
  children,
  className = "",
  padding = "p-5",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div
      className={`rounded-2xl border ${padding} ${className}`}
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {children}
    </div>
  );
}

export function BlueBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: "#EFF6FF", color: "#2563EB" }}
    >
      {children}
    </span>
  );
}

export function AmberBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: "#FFFBEB", color: "#D97706" }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending:    { label: "Ожидает",     bg: "#FEF3C7", color: "#D97706" },
    confirmed:  { label: "Подтверждён", bg: "#DBEAFE", color: "#2563EB" },
    processing: { label: "В обработке", bg: "#EDE9FE", color: "#7C3AED" },
    shipped:    { label: "Отправлен",   bg: "#D1FAE5", color: "#059669" },
    delivered:  { label: "Доставлен",   bg: "#D1FAE5", color: "#059669" },
    cancelled:  { label: "Отменён",     bg: "#FEE2E2", color: "#DC2626" },
    refunded:   { label: "Возврат",     bg: "#F3F4F6", color: "#6B7280" },
    active:     { label: "Активен",     bg: "#D1FAE5", color: "#059669" },
    draft:      { label: "Черновик",    bg: "#F3F4F6", color: "#6B7280" },
    out_of_stock: { label: "Нет в наличии", bg: "#FEE2E2", color: "#DC2626" },
    archived:   { label: "Архив",       bg: "#F3F4F6", color: "#9CA3AF" },
  };
  const s = map[status] ?? { label: status, bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export function BlueButton({
  children,
  onClick,
  disabled,
  type = "button",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{ background: "#2563EB", color: "#fff", fontFamily: "Manrope, sans-serif" }}
    >
      {children}
    </button>
  );
}

export function AmberButton({
  children,
  onClick,
  disabled,
  type = "button",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{ background: "#F59E0B", color: "#1C1917", fontFamily: "Montserrat, sans-serif" }}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  onClick,
  disabled,
  type = "button",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold border transition-all ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50`}
      style={{ borderColor: "#D1D5DB", color: "#374151", fontFamily: "Manrope, sans-serif" }}
    >
      {children}
    </button>
  );
}

export { Plus };
