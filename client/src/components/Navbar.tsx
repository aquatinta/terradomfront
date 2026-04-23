/* Navbar — Terradom Dark Tech PropTech
   Sticky top navigation with logo, links, CTA button
   Mobile-responsive with hamburger menu */

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Как это работает", href: "#how-it-works" },
    { label: "Подрядчикам", href: "#contractors" },
    { label: "Поставщикам", href: "#suppliers" },
    { label: "Безопасность", href: "#security" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.12_0.008_240/0.95)] backdrop-blur-xl border-b border-[oklch(0.28_0.01_240)]"
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
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#partners"
            onClick={(e) => { e.preventDefault(); scrollTo("#contractors"); }}
            className="btn-amber-outline px-4 py-2 rounded-md text-sm"
          >
            Войти в кабинет
          </a>
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
        <div className="md:hidden bg-[oklch(0.14_0.01_240/0.98)] backdrop-blur-xl border-b border-[oklch(0.28_0.01_240)] px-4 pb-6 pt-2">
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
            <div className="flex flex-col gap-3 mt-2">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); scrollTo("#contractors"); setMobileOpen(false); }}
                className="btn-amber-outline px-4 py-2.5 rounded-md text-sm text-center"
              >
                Войти в кабинет
              </a>
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
