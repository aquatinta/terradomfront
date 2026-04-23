/* ContractorsSection — Terradom Dark Tech PropTech
   B2B section for contractors: benefits, commission, CTA
   Asymmetric layout with image on left */

import { useEffect, useRef } from "react";
import { CheckCircle, TrendingUp, Shield, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const CONTRACTOR_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663083092813/A58kibhm9oWDaNRQR3mFUx/terradom-contractor-work-H7akg4Qq9JcPoGfCPUS8ut.webp";

const benefits = [
  {
    icon: TrendingUp,
    title: "Гарантированные заказы",
    description: "Получайте «тёплых» клиентов с уже выбранным проектом и одобренным финансированием — не покупайте холодные лиды.",
  },
  {
    icon: Shield,
    title: "Защита от кассовых разрывов",
    description: "Оплата этапов работ гарантирована через эскроу. Деньги поступают сразу после подтверждения выполнения.",
  },
  {
    icon: FileText,
    title: "Стандартизированные проекты",
    description: "Работайте с понятными домокомплектами по чётким инструкциям от производителей. Меньше споров, больше прибыли.",
  },
  {
    icon: CheckCircle,
    title: "Цифровой документооборот",
    description: "Акты выполненных работ, договоры и отчёты — всё онлайн. ЭДО интегрирован в платформу.",
  },
];

export default function ContractorsSection() {
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
      id="contractors"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "oklch(0.12 0.008 240)" }}
    >
      {/* Amber glow left */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.769 0.188 70.08 / 0.06) 0%, transparent 65%)",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Image */}
          <div className="reveal order-2 lg:order-1">
            <div className="relative">
              <img
                src={CONTRACTOR_IMG}
                alt="Строительная команда Террадом"
                className="w-full rounded-2xl object-cover"
                style={{
                  aspectRatio: "4/3",
                  border: "1px solid oklch(0.769 0.188 70.08 / 0.15)",
                  boxShadow: "0 30px 60px oklch(0 0 0 / 0.5)",
                }}
              />
              {/* Floating commission badge */}
              <div
                className="absolute -bottom-5 -right-5 glass-card rounded-xl p-4 z-10"
                style={{
                  border: "1px solid oklch(0.769 0.188 70.08 / 0.3)",
                  boxShadow: "0 10px 30px oklch(0 0 0 / 0.4)",
                }}
              >
                <div className="text-xs text-[oklch(0.55_0.01_240)] mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                  Комиссия платформы
                </div>
                <div className="text-2xl font-black text-[oklch(0.769_0.188_70.08)]" style={{ fontFamily: "Manrope, sans-serif" }}>
                  5–10%
                </div>
                <div className="text-xs text-[oklch(0.55_0.01_240)]" style={{ fontFamily: "Inter, sans-serif" }}>
                  от суммы контракта
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <div className="reveal">
              <div className="accent-line mb-4" />
              <p className="text-[oklch(0.769_0.188_70.08)] text-sm font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                Для подрядчиков
              </p>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Стабильный поток
                <br />
                <span className="text-amber-glow">заказов</span> без рисков
              </h2>
              <p className="text-[oklch(0.60_0.01_240)] text-base leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                Присоединяйтесь к бирже верифицированных подрядчиков Террадом.
                Получайте заказы от заказчиков с уже одобренным финансированием
                и работайте по прозрачным правилам.
              </p>
            </div>

            {/* Benefits */}
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
                onClick={() => toast.info("Регистрация подрядчиков откроется в ближайшее время")}
                className="btn-amber flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold"
              >
                Стать подрядчиком
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => toast.info("Подробные условия партнёрства — в разработке")}
                className="btn-amber-outline flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base"
              >
                Условия партнёрства
              </button>
            </div>

            {/* Onboarding steps */}
            <div className="reveal">
              <p className="text-xs text-[oklch(0.45_0.01_240)] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                Онбординг за 3 шага:
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {["Регистрация", "Верификация документов", "Первый тендер"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: "oklch(0.769 0.188 70.08 / 0.15)",
                        color: "oklch(0.769 0.188 70.08)",
                        fontFamily: "Manrope, sans-serif",
                      }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs text-[oklch(0.60_0.01_240)]" style={{ fontFamily: "Inter, sans-serif" }}>
                      {step}
                    </span>
                    {i < 2 && <div className="w-4 h-px bg-[oklch(0.30_0.01_240)]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
