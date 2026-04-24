/**
 * DashboardLayout — общий layout для всех страниц кабинета «Террадом»
 *
 * Используется в CustomerDashboard, PartnerDashboard, AdminPanel.
 * Содержит: боковую навигацию (desktop), верхнюю панель с аватаром,
 * мобильное меню-шторку.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Handshake,
  Package,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Store,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { UserRole } from "@/lib/api.types";

// ---------------------------------------------------------------------------
// Nav items per role
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  comingSoon?: boolean;
}

const CUSTOMER_NAV: NavItem[] = [
  { label: "Обзор", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Мои проекты", href: "/dashboard/projects", icon: <FolderOpen size={18} />, comingSoon: true },
  { label: "Предложения", href: "/dashboard/offers", icon: <FileText size={18} />, comingSoon: true },
  { label: "Сделки", href: "/dashboard/deals", icon: <Handshake size={18} />, comingSoon: true },
  { label: "Маркетплейс", href: "/marketplace", icon: <Store size={18} /> },
  { label: "Мои заказы", href: "/orders", icon: <ShoppingBag size={18} /> },
  { label: "Настройки", href: "/dashboard/settings", icon: <Settings size={18} />, comingSoon: true },
];

const PARTNER_NAV: NavItem[] = [
  { label: "Обзор", href: "/partner", icon: <LayoutDashboard size={18} /> },
  { label: "Тендеры", href: "/partner/tenders", icon: <Package size={18} />, comingSoon: true },
  { label: "Мои предложения", href: "/partner/offers", icon: <FileText size={18} />, comingSoon: true },
  { label: "Сделки", href: "/partner/deals", icon: <Handshake size={18} />, comingSoon: true },
  { label: "Маркетплейс", href: "/marketplace", icon: <Store size={18} /> },
  { label: "Кабинет поставщика", href: "/supplier", icon: <ShoppingBag size={18} /> },
  { label: "Настройки", href: "/partner/settings", icon: <Settings size={18} />, comingSoon: true },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Обзор", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Споры", href: "/admin/disputes", icon: <ShieldCheck size={18} />, comingSoon: true },
  { label: "Пользователи", href: "/admin/users", icon: <Package size={18} />, comingSoon: true },
  { label: "Настройки", href: "/admin/settings", icon: <Settings size={18} />, comingSoon: true },
];

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  customer: CUSTOMER_NAV,
  partner: PARTNER_NAV,
  supplier: PARTNER_NAV,
  admin: ADMIN_NAV,
};

const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Заказчик",
  partner: "Подрядчик",
  supplier: "Поставщик",
  admin: "Администратор",
};

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar({
  navItems,
  onClose,
}: {
  navItems: NavItem[];
  onClose?: () => void;
}) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() ||
      user.phone.slice(-2)
    : "?";

  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : "";

  const handleNav = (item: NavItem) => {
    if (item.comingSoon) {
      toast.info(`${item.label} — в разработке`);
      onClose?.();
      return;
    }
    navigate(item.href);
    onClose?.();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Вы вышли из системы");
  };

  return (
    <div className="flex flex-col h-full border-r border-[oklch(0.20_0.025_255)]" style={{
      background: "linear-gradient(180deg, oklch(0.13 0.04 255) 0%, oklch(0.10 0.025 255) 50%, oklch(0.09 0.015 255) 100%)",
    }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[oklch(0.20_0.025_255)] flex-shrink-0">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[oklch(0.769_0.188_70.08)] flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L16 7V16H2V7L9 2Z" fill="oklch(0.1 0.01 70)" />
              <rect x="6.5" y="10" width="5" height="6" fill="oklch(0.1 0.01 70 / 0.5)" />
            </svg>
          </div>
          <span className="font-bold text-base text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
            Терра<span className="text-[oklch(0.769_0.188_70.08)]">дом</span>
          </span>
        </a>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-[oklch(0.55_0.012_240)] hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-[oklch(0.20_0.025_255)] flex-shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[oklch(0.13_0.018_255)]">
          <div className="w-9 h-9 rounded-full bg-[oklch(0.769_0.188_70.08)] flex items-center justify-center text-sm font-bold text-[oklch(0.1_0.01_70)] flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.companyName ?? (`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.phone)}
            </p>
            <p className="text-xs text-[oklch(0.769_0.188_70.08)]">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? "bg-[oklch(0.769_0.188_70.08/0.15)] text-[oklch(0.769_0.188_70.08)] border border-[oklch(0.769_0.188_70.08/0.25)]"
                  : "text-[oklch(0.65_0.012_240)] hover:bg-[oklch(0.14_0.02_255)] hover:text-white"
              }`}
            >
              <span className={isActive ? "text-[oklch(0.769_0.188_70.08)]" : "text-[oklch(0.5_0.012_240)] group-hover:text-[oklch(0.769_0.188_70.08/0.7)]"}>
                {item.icon}
              </span>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)]">
                  {item.badge}
                </span>
              )}
              {item.comingSoon && (
                <span className="text-[9px] px-1.5 py-0.5 rounded border border-[oklch(0.26_0.03_255)] text-[oklch(0.45_0.012_240)]">
                  скоро
                </span>
              )}
              {isActive && <ChevronRight size={14} className="text-[oklch(0.769_0.188_70.08)]" />}
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-[oklch(0.20_0.025_255)] flex-shrink-0 space-y-1">
        <a
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[oklch(0.65_0.012_240)] hover:bg-[oklch(0.14_0.02_255)] hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium">На главную</span>
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardLayout
// ---------------------------------------------------------------------------

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const role = user?.role ?? "customer";
  const navItems = NAV_BY_ROLE[role] ?? CUSTOMER_NAV;

  return (
    <div className="flex h-screen overflow-hidden" style={{
      background: "oklch(0.09 0.015 255)",
      backgroundImage: `radial-gradient(
        ellipse 55% 80% at 0% 40%,
        oklch(0.28 0.12 255 / 0.45) 0%,
        oklch(0.18 0.07 255 / 0.20) 40%,
        transparent 65%
      )`,
    }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 flex-shrink-0">
        <Sidebar navItems={navItems} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 flex flex-col">
            <Sidebar navItems={navItems} onClose={() => setMobileOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 md:px-6 h-16 border-b border-[oklch(0.20_0.025_255)] backdrop-blur-sm flex-shrink-0" style={{ background: "oklch(0.10 0.025 255 / 0.85)" }}>
          {/* Mobile menu button */}
          <button
            className="md:hidden text-[oklch(0.65_0.012_240)] hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            {title && (
              <h1
                className="text-base font-bold text-white truncate"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-[oklch(0.55_0.012_240)] truncate">{subtitle}</p>
            )}
          </div>

          {/* Notifications (placeholder) */}
          <button
            onClick={() => toast.info("Уведомления — в разработке")}
            className="relative p-2 rounded-lg text-[oklch(0.55_0.012_240)] hover:text-white hover:bg-[oklch(0.14_0.02_255)] transition-colors"
          >
            <Bell size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
