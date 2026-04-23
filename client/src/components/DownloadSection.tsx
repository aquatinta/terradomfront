/* DownloadSection — Terradom Dark Tech PropTech
   App download CTA with App Store / Google Play buttons
   Dark background with amber glow, phone mockup */

import { useEffect, useRef } from "react";
import { Smartphone, Apple } from "lucide-react";
import { toast } from "sonner";

const AR_DEMO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663083092813/A58kibhm9oWDaNRQR3mFUx/terradom-ar-demo-Q2btL5tACaTykrZkNwtixW.webp";

export default function DownloadSection() {
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
      id="download"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "oklch(0.11 0.018 255)" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, oklch(0.769 0.188 70.08 / 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.25 0.02 240 / 0.4) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.25 0.02 240 / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Content */}
          <div className="flex flex-col gap-6">
            <div className="reveal">
              <div className="accent-line mb-4" />
              <p className="text-[oklch(0.769_0.188_70.08)] text-sm font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
                Мобильное приложение
              </p>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Скачайте приложение
                <br />
                <span className="text-amber-glow">Террадом</span>
              </h2>
              <p className="text-[oklch(0.60_0.01_240)] text-base leading-relaxed" style={{ fontFamily: "Manrope, sans-serif" }}>
                3D-конфигуратор, AR-режим, выбор подрядчика и трекинг строительства —
                всё в одном приложении. Доступно для Android и iOS.
              </p>
            </div>

            {/* App features */}
            <div className="reveal grid grid-cols-2 gap-3">
              {[
                "3D-редактор планировки",
                "AR-проекция на участок",
                "Автосмета в реальном времени",
                "Выбор подрядчика",
                "Трекинг строительства",
                "Эскроу-платежи",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.769 0.188 70.08 / 0.15)" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <span className="text-xs text-[oklch(0.65_0.01_240)]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Download buttons */}
            <div className="reveal flex flex-col sm:flex-row gap-3">
              {/* Google Play */}
              <button
                onClick={() => toast.info("Приложение скоро появится в Google Play")}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: "oklch(0.14 0.02 255)",
                  border: "1.5px solid oklch(0.35 0.01 240)",
                  color: "white",
                }}
              >
                <Smartphone size={22} className="text-[oklch(0.769_0.188_70.08)] flex-shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] text-[oklch(0.55_0.01_240)]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Скачать в
                  </div>
                  <div className="text-sm font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Google Play
                  </div>
                </div>
              </button>

              {/* App Store */}
              <button
                onClick={() => toast.info("Приложение скоро появится в App Store")}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: "oklch(0.14 0.02 255)",
                  border: "1.5px solid oklch(0.35 0.01 240)",
                  color: "white",
                }}
              >
                <Apple size={22} className="text-[oklch(0.769_0.188_70.08)] flex-shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] text-[oklch(0.55_0.01_240)]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Скачать в
                  </div>
                  <div className="text-sm font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
                    App Store
                  </div>
                </div>
              </button>
            </div>

            {/* APK direct */}
            <div className="reveal">
              <p className="text-xs text-[oklch(0.45_0.01_240)]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Или{" "}
                <button
                  onClick={() => toast.info("Прямая загрузка APK скоро будет доступна")}
                  className="text-[oklch(0.769_0.188_70.08)] underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  скачайте APK напрямую
                </button>{" "}
                для Android
              </p>
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div className="reveal flex justify-center lg:justify-end">
            <div className="relative w-64 sm:w-72 lg:w-80">
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: "radial-gradient(ellipse at center, oklch(0.769 0.188 70.08 / 0.15) 0%, transparent 70%)",
                  filter: "blur(30px)",
                  transform: "scale(1.2)",
                }}
              />
              {/* Phone frame */}
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  border: "2px solid oklch(0.769 0.188 70.08 / 0.4)",
                  boxShadow: "0 40px 80px oklch(0 0 0 / 0.6), 0 0 40px oklch(0.769 0.188 70.08 / 0.15)",
                  animation: "float 5s ease-in-out infinite",
                }}
              >
                <img
                  src={AR_DEMO_IMG}
                  alt="Приложение Террадом — AR-режим"
                  className="w-full h-auto"
                />
              </div>

              {/* Rating badge */}
              <div
                className="absolute -bottom-4 -left-4 glass-card rounded-xl px-4 py-3 z-10"
                style={{
                  border: "1px solid oklch(0.769 0.188 70.08 / 0.3)",
                  boxShadow: "0 10px 30px oklch(0 0 0 / 0.4)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="oklch(0.769 0.188 70.08)">
                      <path d="M5 0.5L6.18 3.5H9.5L6.9 5.5L7.9 8.5L5 6.8L2.1 8.5L3.1 5.5L0.5 3.5H3.82L5 0.5Z"/>
                    </svg>
                  ))}
                </div>
                <div className="text-xs font-bold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
                  4.9 / 5.0
                </div>
                <div className="text-[10px] text-[oklch(0.50_0.01_240)]" style={{ fontFamily: "Manrope, sans-serif" }}>
                  1 200+ отзывов
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}
