/* PartnerCtaSection — Terradom Dark Tech PropTech
   Final B2B CTA section before footer
   Two cards: Contractor + Supplier registration */

import { useEffect, useRef } from "react";
import { HardHat, Package, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function PartnerCtaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.15 }
    );
    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "oklch(0.14 0.01 240)" }}
    >
      {/* Amber glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, oklch(0.769 0.188 70.08 / 0.05) 0%, transparent 65%)",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 reveal">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Готовы начать работу
            <span className="text-amber-glow"> на платформе?</span>
          </h2>
          <p className="text-[oklch(0.55_0.01_240)] text-base" style={{ fontFamily: "Inter, sans-serif" }}>
            Выберите вашу роль и зарегистрируйтесь в личном кабинете
          </p>
        </div>

        {/* Two CTA cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Contractor */}
          <div
            className="reveal glass-card rounded-2xl p-6 lg:p-8 partner-card"
            style={{
              border: "1px solid oklch(0.769 0.188 70.08 / 0.2)",
              background: "linear-gradient(135deg, oklch(0.18 0.012 240 / 0.8), oklch(0.14 0.01 240 / 0.8))",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "oklch(0.769 0.188 70.08 / 0.15)" }}
            >
              <HardHat size={22} className="text-[oklch(0.769_0.188_70.08)]" />
            </div>
            <h3
              className="text-xl font-black text-white mb-2"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Я подрядчик
            </h3>
            <p className="text-sm text-[oklch(0.55_0.01_240)] mb-5 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Строительная компания или бригада. Хочу получать заказы от заказчиков
              с готовыми проектами и защищёнными платежами.
            </p>
            <ul className="flex flex-col gap-2 mb-6">
              {["Участие в тендерах", "Гарантированная оплата", "Цифровые акты"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-[oklch(0.65_0.01_240)]" style={{ fontFamily: "Inter, sans-serif" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.769_0.188_70.08)]" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => toast.info("Регистрация подрядчиков откроется в ближайшее время")}
              className="btn-amber w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold"
            >
              Стать подрядчиком
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Supplier */}
          <div
            className="reveal glass-card rounded-2xl p-6 lg:p-8 partner-card"
            style={{
              border: "1px solid oklch(0.35 0.01 240 / 0.5)",
              background: "linear-gradient(135deg, oklch(0.16 0.01 240 / 0.8), oklch(0.12 0.008 240 / 0.8))",
              transitionDelay: "0.1s",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "oklch(0.769 0.188 70.08 / 0.1)" }}
            >
              <Package size={22} className="text-[oklch(0.769_0.188_70.08)]" />
            </div>
            <h3
              className="text-xl font-black text-white mb-2"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Я поставщик
            </h3>
            <p className="text-sm text-[oklch(0.55_0.01_240)] mb-5 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Завод или дилер стройматериалов. Хочу разместить каталог и получать
              прямые заказы от заказчиков по всей России.
            </p>
            <ul className="flex flex-col gap-2 mb-6">
              {["Размещение каталога", "Прямые заказы", "Аналитика спроса"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-[oklch(0.65_0.01_240)]" style={{ fontFamily: "Inter, sans-serif" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.769_0.188_70.08)]" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => toast.info("Регистрация поставщиков откроется в ближайшее время")}
              className="btn-amber-outline w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold"
            >
              Разместить каталог
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
