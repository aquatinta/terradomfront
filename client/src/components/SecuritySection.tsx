/* SecuritySection — Terradom Dark Tech PropTech
   Escrow, EDO, insurance explanation
   Dark with amber accents, security visual */

import { useEffect, useRef } from "react";
import { Lock, FileCheck, Shield, CreditCard } from "lucide-react";

const SECURITY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663083092813/A58kibhm9oWDaNRQR3mFUx/terradom-escrow-security-765CaffLzVmwcqS73TsSyv.webp";

const securityFeatures = [
  {
    icon: Lock,
    title: "Эскроу-счёт",
    description:
      "Деньги заказчика хранятся на специальном транзитном счёте. Подрядчик получает оплату только после подтверждения каждого этапа работ — фундамент, коробка, кровля.",
    highlight: "100% защита средств",
  },
  {
    icon: FileCheck,
    title: "Электронный документооборот",
    description:
      "Все договоры, акты выполненных работ и спецификации подписываются электронной подписью. Юридически значимые документы без бумажной волокиты.",
    highlight: "ЭДО по 63-ФЗ",
  },
  {
    icon: Shield,
    title: "Страхование СМР",
    description:
      "Платформа предлагает полисы страхования строительно-монтажных рисков. Защита от непредвиденных ситуаций на стройке для обеих сторон.",
    highlight: "Страхование рисков",
  },
  {
    icon: CreditCard,
    title: "Арбитраж споров",
    description:
      "Если возник спор — независимый арбитраж платформы рассматривает доказательства и принимает решение о распределении средств. Честно для всех.",
    highlight: "Независимый арбитраж",
  },
];

const milestones = [
  { label: "Фундамент", pct: 25 },
  { label: "Коробка", pct: 40 },
  { label: "Кровля", pct: 20 },
  { label: "Отделка", pct: 15 },
];

export default function SecuritySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

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
      id="security"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "oklch(0.12 0.008 240)" }}
    >
      {/* Blueprint bg */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `url("https://d2xsxph8kpxj0f.cloudfront.net/310519663083092813/A58kibhm9oWDaNRQR3mFUx/terradom-blueprint-bg-8F8nJYBCSp7GBjtUDW35rm.webp")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, oklch(0.769 0.188 70.08 / 0.04) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <div className="accent-line mx-auto mb-4" />
          <p className="text-[oklch(0.769_0.188_70.08)] text-sm font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
            Безопасность сделки
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Ваши деньги защищены
            <br />
            <span className="text-amber-glow">на каждом этапе</span>
          </h2>
          <p className="text-[oklch(0.60_0.01_240)] text-base lg:text-lg max-w-2xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            Эскроу, ЭДО и страхование — три уровня защиты, которые делают
            строительство предсказуемым и безопасным.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Features */}
          <div className="flex flex-col gap-5">
            {securityFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="reveal glass-card rounded-xl p-5 flex gap-4 partner-card"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "oklch(0.769 0.188 70.08 / 0.12)" }}
                  >
                    <Icon size={18} className="text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4
                        className="text-sm font-bold text-white"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        {feature.title}
                      </h4>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: "oklch(0.769 0.188 70.08 / 0.15)",
                          color: "oklch(0.769 0.188 70.08)",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {feature.highlight}
                      </span>
                    </div>
                    <p className="text-xs text-[oklch(0.55_0.01_240)] leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Visual + Milestone breakdown */}
          <div className="flex flex-col gap-6">
            {/* Security image */}
            <div className="reveal">
              <img
                src={SECURITY_IMG}
                alt="Безопасность сделки Террадом"
                className="w-full rounded-2xl object-cover"
                style={{
                  aspectRatio: "16/9",
                  border: "1px solid oklch(0.769 0.188 70.08 / 0.15)",
                  boxShadow: "0 20px 40px oklch(0 0 0 / 0.4)",
                }}
              />
            </div>

            {/* Milestone payment breakdown */}
            <div
              className="reveal glass-card rounded-2xl p-6"
              style={{ border: "1px solid oklch(0.769 0.188 70.08 / 0.2)" }}
            >
              <h4
                className="text-sm font-bold text-white mb-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Разбивка оплаты по этапам
              </h4>
              {/* Progress bar */}
              <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
                {milestones.map((m, i) => (
                  <div
                    key={m.label}
                    style={{
                      width: `${m.pct}%`,
                      background: `oklch(${0.769 - i * 0.08} ${0.188 - i * 0.03} 70.08)`,
                    }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {milestones.map((m, i) => (
                  <div key={m.label} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{
                        background: `oklch(${0.769 - i * 0.08} ${0.188 - i * 0.03} 70.08)`,
                      }}
                    />
                    <span className="text-xs text-[oklch(0.60_0.01_240)]" style={{ fontFamily: "Inter, sans-serif" }}>
                      {m.label} — <strong className="text-white">{m.pct}%</strong>
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[oklch(0.45_0.01_240)] mt-4" style={{ fontFamily: "Inter, sans-serif" }}>
                Средства разморожены и переведены подрядчику только после подтверждения этапа заказчиком или независимым технадзором.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
