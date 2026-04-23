/* StatsSection — Terradom Dark Tech PropTech
   Platform metrics with animated counters
   Full-width dark section with amber numbers */

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 1200, suffix: "+", label: "Проектов создано", description: "3D-моделей домов в базе платформы" },
  { value: 340, suffix: "+", label: "Верифицированных подрядчиков", description: "Строительных компаний прошли проверку" },
  { value: 42, suffix: "", label: "Региона", description: "Покрытие по всей России" },
  { value: 98, suffix: "%", label: "Успешных сделок", description: "Проектов завершены без споров" },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);

  return count;
}

function StatItem({ stat, active }: { stat: typeof stats[0]; active: boolean }) {
  const count = useCountUp(stat.value, 1800, active);

  return (
    <div className="flex flex-col items-center text-center px-4 py-8">
      <div className="stat-number mb-1">
        {count.toLocaleString("ru-RU")}{stat.suffix}
      </div>
      <div
        className="text-base font-bold text-white mb-1"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {stat.label}
      </div>
      <div
        className="text-xs text-[oklch(0.50_0.01_240)] max-w-[180px]"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {stat.description}
      </div>
    </div>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(true);
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 lg:py-20 relative overflow-hidden reveal"
      style={{
        background: "linear-gradient(105deg, oklch(0.16 0.06 255) 0%, oklch(0.11 0.025 255) 40%, oklch(0.09 0.015 255) 100%)",
        borderTop: "1px solid oklch(0.769 0.188 70.08 / 0.15)",
        borderBottom: "1px solid oklch(0.769 0.188 70.08 / 0.15)",
      }}
    >
      {/* Horizontal amber line accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, oklch(0.769 0.188 70.08 / 0.5), transparent)",
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.769 0.188 70.08 / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.769 0.188 70.08 / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[oklch(0.25_0.01_240)]">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} active={active} />
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, oklch(0.769 0.188 70.08 / 0.5), transparent)",
        }}
      />
    </section>
  );
}
