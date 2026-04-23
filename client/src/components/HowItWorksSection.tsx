/* HowItWorksSection — Terradom Dark Tech PropTech
   3 steps for customer: Configure → Choose → Build
   Numbered steps with amber accents, reveal on scroll */

import { useEffect, useRef } from "react";
import { Cpu, Users, HardHat } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Cpu,
    title: "Конфигурируй",
    subtitle: "3D/AR-редактор",
    description:
      "Скачайте приложение и создайте проект дома в 3D-редакторе. Настройте планировку, материалы стен, кровлю и фасад. Примерьте дом на свой участок через AR-камеру — увидьте результат до начала строительства.",
    features: ["3D-редактор планировки", "AR-проекция на участок", "Автоматический расчёт сметы"],
  },
  {
    number: "02",
    icon: Users,
    title: "Выбирай",
    subtitle: "Верифицированные подрядчики",
    description:
      "Платформа автоматически подберёт 3–5 верифицированных подрядчиков в вашем регионе. Сравните предложения, изучите портфолио и отзывы. Выберите лучшее предложение и подпишите договор онлайн.",
    features: ["ИИ-матчинг подрядчиков", "Проверка документов и рейтинга", "Онлайн-подписание договора"],
  },
  {
    number: "03",
    icon: HardHat,
    title: "Строй",
    subtitle: "Безопасная сделка",
    description:
      "Деньги хранятся на эскроу-счёте и переводятся подрядчику только после подтверждения каждого этапа. Следите за прогрессом строительства в реальном времени через приложение.",
    features: ["Эскроу-счёт для защиты денег", "Трекинг этапов строительства", "Фото- и видеоотчёты"],
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
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
      id="how-it-works"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "oklch(0.14 0.01 240)" }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.25 0.02 240 / 0.4) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.25 0.02 240 / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20 reveal">
          <div className="accent-line mx-auto mb-4" />
          <p className="text-[oklch(0.769_0.188_70.08)] text-sm font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
            Для заказчика
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Как это работает
          </h2>
          <p className="text-[oklch(0.60_0.01_240)] text-base lg:text-lg max-w-2xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            Три шага от идеи до готового дома. Весь процесс — в одном приложении.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="reveal glass-card rounded-2xl p-6 lg:p-8 partner-card"
                style={{ transitionDelay: `${index * 0.12}s` }}
              >
                {/* Step number + icon */}
                <div className="flex items-start justify-between mb-6">
                  <div className="step-circle">{step.number}</div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.769 0.188 70.08 / 0.12)" }}
                  >
                    <Icon size={20} className="text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                </div>

                {/* Content */}
                <div className="mb-2">
                  <span className="text-xs text-[oklch(0.769_0.188_70.08)] font-semibold uppercase tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>
                    {step.subtitle}
                  </span>
                </div>
                <h3
                  className="text-xl lg:text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-[oklch(0.60_0.01_240)] text-sm leading-relaxed mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
                  {step.description}
                </p>

                {/* Features list */}
                <ul className="flex flex-col gap-2">
                  {step.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "oklch(0.769 0.188 70.08 / 0.15)" }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.769_0.188_70.08)]" />
                      </div>
                      <span className="text-xs text-[oklch(0.70_0.01_240)]" style={{ fontFamily: "Inter, sans-serif" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Connector line (not last) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 w-8 h-px bg-[oklch(0.769_0.188_70.08/0.3)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
