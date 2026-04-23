/* SuppliersSection — Terradom Dark Tech PropTech
   B2B section for suppliers/manufacturers: catalog placement, orders, CTA
   Dark card layout with glassmorphism */

import { useEffect, useRef } from "react";
import { Package, BarChart3, Globe, Zap, ArrowRight } from "lucide-react";
import { usePartnerModal } from "@/contexts/PartnerModalContext";

const benefits = [
  {
    icon: Globe,
    title: "Новый канал сбыта",
    description: "Доступ к тысячам покупателей без затрат на собственный маркетинг. Ваши домокомплекты — в каждом регионе.",
  },
  {
    icon: BarChart3,
    title: "Аналитика спроса",
    description: "Видите сколько заявок в каждом регионе, какие технологии востребованы. Планируйте производство точнее.",
  },
  {
    icon: Package,
    title: "Управление каталогом",
    description: "Обновляйте цены на материалы в личном кабинете. Данные мгновенно влияют на сметы для заказчиков.",
  },
  {
    icon: Zap,
    title: "Быстрая интеграция",
    description: "Онбординг занимает 3 дня. API для синхронизации с вашей ERP-системой. Минимум ручной работы.",
  },
];

const techTypes = [
  "Каркасные дома",
  "СИП-панели",
  "Клееный брус",
  "Газобетон",
  "Модульные дома",
  "Кирпич",
];

export default function SuppliersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { openModal } = usePartnerModal();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="suppliers"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "oklch(0.14 0.01 240)" }}
    >
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.25 0.02 240 / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.25 0.02 240 / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Right glow */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.769 0.188 70.08 / 0.05) 0%, transparent 65%)",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left: Content */}
          <div className="flex flex-col gap-6">
            <div className="reveal">
              <div className="accent-line mb-4" />
              <p className="text-[oklch(0.769_0.188_70.08)] text-sm font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                Для поставщиков
              </p>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Разместите каталог —
                <br />
                получайте <span className="text-amber-glow">заказы</span>
              </h2>
              <p className="text-[oklch(0.60_0.01_240)] text-base leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                Заводы и дилеры стройматериалов размещают каталог на Террадом
                и получают прямые заказы от заказчиков. Ваши цены автоматически
                включаются в сметы — без посредников.
              </p>
            </div>

            {/* Benefits grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="reveal glass-card rounded-xl p-4 partner-card"
                    style={{ transitionDelay: `${i * 0.1}s` }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: "oklch(0.769 0.188 70.08 / 0.12)" }}
                    >
                      <Icon size={16} className="text-[oklch(0.769_0.188_70.08)]" />
                    </div>
                    <h4
                      className="text-sm font-bold text-white mb-1.5"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-[oklch(0.55_0.01_240)] leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="reveal flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openModal("supplier")}
                className="btn-amber flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold"
              >
                Разместить каталог
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => openModal("supplier")}
                className="btn-amber-outline flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base"
              >
                Узнать условия
              </button>
            </div>
          </div>

          {/* Right: Visual card with stats */}
          <div className="flex flex-col gap-5">
            {/* Commission card */}
            <div
              className="reveal glass-card rounded-2xl p-6 partner-card"
              style={{ border: "1px solid oklch(0.769 0.188 70.08 / 0.2)" }}
            >
              <h3
                className="text-lg font-bold text-white mb-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Условия размещения
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { value: "3–7%", label: "Комиссия с продаж" },
                  { value: "0 ₽", label: "Вход на платформу" },
                  { value: "3 дня", label: "Онбординг" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className="text-xl font-black text-[oklch(0.769_0.188_70.08)] mb-1"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-[oklch(0.50_0.01_240)]" style={{ fontFamily: "Inter, sans-serif" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="h-px w-full mb-4"
                style={{ background: "oklch(0.28 0.01 240)" }}
              />
              <p className="text-xs text-[oklch(0.50_0.01_240)]" style={{ fontFamily: "Inter, sans-serif" }}>
                Комиссия взимается только с успешных сделок. Нет продаж — нет платежей.
              </p>
            </div>

            {/* Supported technologies */}
            <div className="reveal glass-card rounded-2xl p-6">
              <h4
                className="text-sm font-bold text-white mb-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Поддерживаемые технологии
              </h4>
              <div className="flex flex-wrap gap-2">
                {techTypes.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: "oklch(0.769 0.188 70.08 / 0.1)",
                      color: "oklch(0.769 0.188 70.08)",
                      border: "1px solid oklch(0.769 0.188 70.08 / 0.2)",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Regional stats */}
            <div className="reveal glass-card rounded-2xl p-6">
              <h4
                className="text-sm font-bold text-white mb-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Спрос по регионам (топ-3)
              </h4>
              {[
                { region: "Московская область", count: 342, pct: 85 },
                { region: "Краснодарский край", count: 218, pct: 55 },
                { region: "Ленинградская область", count: 156, pct: 40 },
              ].map((item) => (
                <div key={item.region} className="mb-3 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[oklch(0.65_0.01_240)]" style={{ fontFamily: "Inter, sans-serif" }}>
                      {item.region}
                    </span>
                    <span className="text-xs font-semibold text-[oklch(0.769_0.188_70.08)]" style={{ fontFamily: "Manrope, sans-serif" }}>
                      {item.count} заявок
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "oklch(0.22 0.01 240)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.pct}%`,
                        background: "linear-gradient(90deg, oklch(0.769 0.188 70.08), oklch(0.65 0.15 70.08))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
