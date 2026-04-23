/* HeroSection — Terradom Dark Tech PropTech v2
   Design: тёмный фон + синий градиент слева (как на образце)
   Fonts: Montserrat (заголовки, extrabold) + Manrope (тело)
   Blueprint grid, amber CTA, blue left glow */

import { useEffect, useRef } from "react";
import { ArrowRight, Star } from "lucide-react";

const HERO_HOUSE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663083092813/A58kibhm9oWDaNRQR3mFUx/terradom-hero-house-AiSA6f8qp73kajEH4wRw9t.webp";
const AR_DEMO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663083092813/A58kibhm9oWDaNRQR3mFUx/terradom-ar-demo-Q2btL5tACaTykrZkNwtixW.webp";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const img = heroRef.current.querySelector(".hero-img") as HTMLElement;
      if (img) img.style.transform = `translateY(${scrollY * 0.12}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={heroRef}
      className="relative flex items-center overflow-hidden"
      style={{
        paddingTop: "4rem",
        minHeight: "100svh",
        background: "oklch(0.09 0.015 255)",
      }}
    >
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.25 0.04 255 / 0.15) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.25 0.04 255 / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* BLUE GRADIENT LEFT — главный элемент образца */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              ellipse 65% 90% at 0% 50%,
              oklch(0.32 0.14 255 / 0.60) 0%,
              oklch(0.22 0.10 255 / 0.35) 30%,
              oklch(0.14 0.06 255 / 0.12) 55%,
              transparent 75%
            )
          `,
        }}
      />

      {/* Amber glow top-right */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(circle at 70% 20%, oklch(0.769 0.188 70.08 / 0.07) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-4rem)] py-16">

          {/* Left: Text content */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-start">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={12} fill="oklch(0.769 0.188 70.08)" className="text-[oklch(0.769_0.188_70.08)]" />
                ))}
              </div>
              <span className="text-xs text-[oklch(0.65_0.01_240)] font-medium tracking-wide uppercase">
                Платформа №1 для строительства домов
              </span>
            </div>

            {/* Headline — Montserrat extrabold как на образце */}
            <div>
              <p
                className="text-sm font-semibold text-[oklch(0.72_0.01_240)] uppercase tracking-widest mb-3"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Маркетплейс строительства
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <span className="text-white">Постройте</span>
                <br />
                <span className="text-[oklch(0.769_0.188_70.08)]" style={{
                  textShadow: "0 0 40px oklch(0.769 0.188 70.08 / 0.4)"
                }}>дом мечты</span>
                <br />
                <span className="text-white">с 3D-конфигуратором</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p
              className="text-base lg:text-lg text-[oklch(0.65_0.01_240)] leading-relaxed max-w-lg"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Спроектируйте дом в 3D, примерьте его на участок через AR-камеру,
              выберите верифицированного подрядчика и стройте безопасно — деньги
              защищены эскроу до подписания акта.
            </p>

            {/* CTA buttons — как на образце: жёлтый + outline */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => scrollTo("#download")}
                className="btn-amber flex items-center justify-center gap-2 px-7 py-4 rounded-lg text-sm"
              >
                Скачать приложение
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollTo("#how-it-works")}
                className="btn-amber-outline flex items-center justify-center gap-2 px-7 py-4 rounded-lg text-sm"
              >
                Как это работает
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { value: "1 200+", label: "проектов" },
                { value: "340+", label: "подрядчиков" },
                { value: "42", label: "региона" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className="text-2xl font-black text-[oklch(0.769_0.188_70.08)]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="text-xs text-[oklch(0.55_0.01_240)] mt-0.5"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px]">
              {/* Blue glow behind image */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "radial-gradient(ellipse at center, oklch(0.40 0.14 255 / 0.20) 0%, transparent 70%)",
                  filter: "blur(20px)",
                  transform: "scale(1.1)",
                }}
              />
              <img
                src={HERO_HOUSE_IMG}
                alt="3D-визуализация современного дома"
                className="hero-img relative z-10 w-full rounded-2xl object-cover"
                style={{
                  aspectRatio: "16/10",
                  border: "1px solid oklch(0.40 0.14 255 / 0.25)",
                  boxShadow: "0 40px 80px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.769 0.188 70.08 / 0.1)",
                }}
              />

              {/* AR phone mockup floating */}
              <div
                className="absolute -bottom-8 -left-8 lg:-left-12 z-20 w-32 sm:w-40 rounded-2xl overflow-hidden"
                style={{
                  border: "2px solid oklch(0.769 0.188 70.08 / 0.4)",
                  boxShadow: "0 20px 40px oklch(0 0 0 / 0.5), 0 0 20px oklch(0.769 0.188 70.08 / 0.2)",
                  animation: "float 4s ease-in-out infinite",
                }}
              >
                <img
                  src={AR_DEMO_IMG}
                  alt="AR-режим приложения Террадом"
                  className="w-full h-auto"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                  style={{
                    background: "linear-gradient(to top, oklch(0.09 0.015 255 / 0.95), transparent)",
                  }}
                >
                  <span className="text-[10px] font-bold text-[oklch(0.769_0.188_70.08)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    AR-режим
                  </span>
                </div>
              </div>

              {/* Feature badge floating top-right */}
              <div
                className="absolute -top-4 -right-4 glass-card rounded-xl px-3 py-2 z-20"
                style={{ animation: "float 4s ease-in-out infinite 1s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[oklch(0.769_0.188_70.08/0.2)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[oklch(0.55_0.01_240)]" style={{ fontFamily: "Manrope, sans-serif" }}>Смета</div>
                    <div className="text-xs font-bold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>₽ 4 200 000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, oklch(0.09 0.015 255))",
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}
