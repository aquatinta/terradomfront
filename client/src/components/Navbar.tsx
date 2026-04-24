/* Navbar — Terradom Dark Tech PropTech
   Sticky top navigation with logo, links, CTA button
   Auth-aware: shows user avatar + role badge when authenticated,
   "Войти в кабинет" button when not.
   Mobile-responsive with hamburger menu.
   Partner badge: Bell icon with unread count via useNotifications polling. */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Menu, X, LogOut, User, ChevronDown, LayoutDashboard, Bell, ShoppingCart, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  customer: "Заказчик",
  partner: "Подрядчик",
  supplier: "Поставщик",
  admin: "Администратор",
};

const ROLE_DASHBOARD: Record<string, string> = {
  customer: "/dashboard",
  partner: "/partner",
  supplier: "/partner",
  admin: "/admin",
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { isAuthenticated, isInitializing, user, logout } = useAuth();
  const isPartner = isAuthenticated && (user?.role === "partner" || user?.role === "supplier");
  const { counts, markAllSeen } = useNotifications();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { cart } = useCart();

  const navLinks = [
    { label: "Как это работает", href: "#how-it-works" },
    { label: "Подрядчикам", href: "#contractors" },
    { label: "Поставщикам", href: "#suppliers" },
    { label: "Безопасность", href: "#security" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(href);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await logout();
    toast.success("Вы вышли из системы");
    navigate("/");
  };

  const handleDashboard = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    // Сбрасываем badge при переходе в кабинет партнёра
    if (isPartner) markAllSeen();
    const role = user?.role ?? "customer";
    const path = ROLE_DASHBOARD[role] ?? "/dashboard";
    navigate(path);
  };

  // User initials for avatar
  const initials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() ||
      user.phone.slice(-2)
    : "";

  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : "";

  // ---------------------------------------------------------------------------
  // Notification badge (только для партнёра)
  // ---------------------------------------------------------------------------
  const NotificationBadge = () => {
    if (!isPartner || counts.total === 0) return null;
    return (
      <button
        onClick={() => {
          markAllSeen();
          const role = user?.role ?? "partner";
          navigate(ROLE_DASHBOARD[role] ?? "/partner");
        }}
        title={`${counts.newTenders > 0 ? `${counts.newTenders} новых тендеров` : ""}${counts.acceptedOffers > 0 ? `, ${counts.acceptedOffers} принятых офферов` : ""}`}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-[oklch(0.3_0.01_240)] hover:border-[oklch(0.769_0.188_70.08/0.6)] transition-colors"
      >
        <Bell size={16} className="text-[oklch(0.769_0.188_70.08)]" />
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-[10px] font-bold flex items-center justify-center leading-none">
          {counts.total > 99 ? "99+" : counts.total}
        </span>
      </button>
    );
  };

  // ---------------------------------------------------------------------------
  // Auth CTA block (desktop)
  // ---------------------------------------------------------------------------
  const AuthBlock = () => {
    if (isInitializing) {
      return (
        <div className="w-8 h-8 rounded-full bg-[oklch(0.22_0.01_240)] animate-pulse" />
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-2">
          {/* Notification bell (partner only) */}
          <NotificationBadge />

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[oklch(0.3_0.01_240)] hover:border-[oklch(0.769_0.188_70.08/0.6)] transition-colors group"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-[oklch(0.769_0.188_70.08)] flex items-center justify-center text-xs font-bold text-[oklch(0.1_0.01_70)]">
                {initials}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-medium text-white leading-tight">
                  {user.firstName ?? user.phone}
                </p>
                <p className="text-[10px] text-[oklch(0.769_0.188_70.08)] leading-tight">
                  {roleLabel}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-[oklch(0.6_0.01_240)] transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[oklch(0.28_0.01_240)] bg-[oklch(0.14_0.01_240/0.98)] backdrop-blur-xl shadow-2xl overflow-hidden z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[oklch(0.22_0.01_240)]">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.companyName ?? (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.phone)}
                  </p>
                  <p className="text-xs text-[oklch(0.769_0.188_70.08)] mt-0.5">{roleLabel}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={handleDashboard}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[oklch(0.85_0.005_240)] hover:bg-[oklch(0.22_0.01_240)] hover:text-white transition-colors"
                  >
                    <LayoutDashboard size={15} className="text-[oklch(0.769_0.188_70.08)]" />
                    Личный кабинет
                    {/* Badge в дропдауне */}
                    {isPartner && counts.total > 0 && (
                      <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-[10px] font-bold flex items-center justify-center">
                        {counts.total}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); setMobileOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[oklch(0.85_0.005_240)] hover:bg-[oklch(0.22_0.01_240)] hover:text-white transition-colors"
                  >
                    <User size={15} className="text-[oklch(0.50_0.18_255)]" />
                    Профиль
                  </button>
                </div>

                <div className="border-t border-[oklch(0.22_0.01_240)] py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-[oklch(0.22_0.01_240)] hover:text-red-300 transition-colors"
                  >
                    <LogOut size={15} />
                    Выйти
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Not authenticated
    return (
      <button
        onClick={() => navigate("/login")}
        className="btn-amber-outline px-4 py-2 rounded-md text-sm"
      >
        Войти в кабинет
      </button>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.09_0.015_255/0.95)] backdrop-blur-xl border-b border-[oklch(0.24_0.03_255)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8 max-w-7xl">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-sm bg-[oklch(0.769_0.188_70.08)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L16 7V16H2V7L9 2Z" fill="oklch(0.1 0.01 70)" strokeWidth="0"/>
              <rect x="6.5" y="10" width="5" height="6" fill="oklch(0.1 0.01 70 / 0.5)"/>
            </svg>
          </div>
          <span
            className="font-bold text-lg text-white"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Терра<span className="text-[oklch(0.769_0.188_70.08)]">дом</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="nav-link text-sm"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-1.5 nav-link text-sm text-[oklch(0.769_0.188_70.08)] hover:text-[oklch(0.85_0.18_70.08)] transition-colors font-semibold"
          >
            <Store size={15} />
            Маркет
          </button>
        </div>

        {/* CTA — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cart icon */}
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-[oklch(0.3_0.01_240)] hover:border-[oklch(0.769_0.188_70.08/0.6)] transition-colors"
            title="Корзина"
          >
            <ShoppingCart size={16} className="text-[oklch(0.75_0.01_240)]" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-[10px] font-bold flex items-center justify-center leading-none">
                {cart.itemCount > 9 ? "9+" : cart.itemCount}
              </span>
            )}
          </button>
          <AuthBlock />
          <a
            href="#download"
            onClick={(e) => { e.preventDefault(); scrollTo("#download"); }}
            className="btn-amber px-4 py-2 rounded-md text-sm"
          >
            Скачать приложение
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[oklch(0.11_0.018_255/0.98)] backdrop-blur-xl border-b border-[oklch(0.24_0.03_255)] px-4 pb-6 pt-2">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="nav-link text-left text-base py-1"
              >
                {link.label}
              </button>
            ))}

            {/* Auth block mobile */}
            <div className="flex flex-col gap-3 mt-2">
              {isAuthenticated && user ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-1 py-2 border-b border-[oklch(0.22_0.01_240)]">
                    <div className="w-9 h-9 rounded-full bg-[oklch(0.769_0.188_70.08)] flex items-center justify-center text-sm font-bold text-[oklch(0.1_0.01_70)]">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {user.firstName ?? user.phone}
                      </p>
                      <p className="text-xs text-[oklch(0.769_0.188_70.08)]">{roleLabel}</p>
                    </div>
                    {/* Mobile notification badge */}
                    {isPartner && counts.total > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.1_0.01_70)] text-[10px] font-bold flex items-center justify-center">
                        {counts.total}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleDashboard}
                    className="btn-amber-outline px-4 py-2.5 rounded-md text-sm text-center flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={15} />
                    Личный кабинет
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Выйти
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); navigate("/login"); }}
                  className="btn-amber-outline px-4 py-2.5 rounded-md text-sm text-center"
                >
                  Войти в кабинет
                </button>
              )}

              <a
                href="#download"
                onClick={(e) => { e.preventDefault(); scrollTo("#download"); setMobileOpen(false); }}
                className="btn-amber px-4 py-2.5 rounded-md text-sm text-center"
              >
                Скачать приложение
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
