/* Footer — Terradom Dark Tech PropTech
   Contacts, legal links, app store links, social
   Dark footer with amber accents */

import { toast } from "sonner";

const footerLinks = {
  "Платформа": [
    { label: "Как это работает", href: "#how-it-works" },
    { label: "Для заказчиков", href: "#how-it-works" },
    { label: "Для подрядчиков", href: "#contractors" },
    { label: "Для поставщиков", href: "#suppliers" },
    { label: "Безопасность", href: "#security" },
  ],
  "Партнёрам": [
    { label: "Стать подрядчиком", href: "#contractors" },
    { label: "Разместить каталог", href: "#suppliers" },
    { label: "Кабинет партнёра", href: "#" },
    { label: "Условия работы", href: "#" },
    { label: "Верификация", href: "#" },
  ],
  "Документы": [
    { label: "Пользовательское соглашение", href: "#" },
    { label: "Политика конфиденциальности", href: "#" },
    { label: "Договор оферты", href: "#" },
    { label: "Правила платформы", href: "#" },
  ],
};

export default function Footer() {
  const scrollTo = (href: string) => {
    if (href === "#") {
      toast.info("Документ в разработке");
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "oklch(0.10 0.008 240)",
        borderTop: "1px solid oklch(0.17 0.02 255)",
      }}
    >
      {/* Top amber line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, oklch(0.769 0.188 70.08 / 0.4), transparent)",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 mb-4 w-fit">
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

            <p
              className="text-sm text-[oklch(0.50_0.01_240)] leading-relaxed mb-5 max-w-xs"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Маркетплейс строительства домов с 3D/AR-конфигуратором. Безопасные
              сделки через эскроу, верифицированные подрядчики, цифровой
              документооборот.
            </p>

            {/* Contact */}
            <div className="flex flex-col gap-2 mb-5">
              <a
                href="mailto:hello@terradom.ru"
                className="text-sm text-[oklch(0.60_0.01_240)] hover:text-[oklch(0.769_0.188_70.08)] transition-colors"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                hello@terradom.ru
              </a>
              <a
                href="tel:+78001234567"
                className="text-sm text-[oklch(0.60_0.01_240)] hover:text-[oklch(0.769_0.188_70.08)] transition-colors"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                8 800 123-45-67
              </a>
            </div>

            {/* App store buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => toast.info("Google Play — скоро")}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-80"
                style={{
                  background: "oklch(0.14 0.02 255)",
                  border: "1px solid oklch(0.26 0.03 255)",
                  color: "oklch(0.70 0.012 240)",
                  fontFamily: "Manrope, sans-serif",
                }}
              >
                Google Play
              </button>
              <button
                onClick={() => toast.info("App Store — скоро")}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-80"
                style={{
                  background: "oklch(0.14 0.02 255)",
                  border: "1px solid oklch(0.26 0.03 255)",
                  color: "oklch(0.70 0.012 240)",
                  fontFamily: "Manrope, sans-serif",
                }}
              >
                App Store
              </button>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                className="text-xs font-bold text-white uppercase tracking-widest mb-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-sm text-[oklch(0.50_0.01_240)] hover:text-[oklch(0.769_0.188_70.08)] transition-colors text-left"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid oklch(0.20 0.01 240)" }}
        >
          <p
            className="text-xs text-[oklch(0.40_0.01_240)]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            © 2026 ООО «Террадом». Все права защищены.
          </p>
          <p
            className="text-xs text-[oklch(0.35_0.01_240)]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            ИНН 7700000000 · ОГРН 1234567890123 · г. Москва
          </p>
        </div>
      </div>
    </footer>
  );
}
