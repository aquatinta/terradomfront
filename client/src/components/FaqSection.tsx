/* FaqSection — Terradom Dark Tech PropTech
   Frequently asked questions with accordion
   Dark background, amber accents */

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Как работает эскроу-счёт?",
    answer:
      "Вы вносите деньги на специальный транзитный счёт в банке-партнёре. Подрядчик не получает средства до тех пор, пока вы не подтвердите выполнение каждого этапа работ. Если возник спор — независимый арбитраж платформы принимает решение на основе фотоотчётов и актов.",
  },
  {
    question: "Как проверяются подрядчики?",
    answer:
      "Каждый подрядчик проходит многоуровневую верификацию: проверка юридической чистоты (ИНН, ЕГРЮЛ), финансовой устойчивости, портфолио выполненных объектов и отзывов реальных клиентов. Только после одобрения администратором платформы подрядчик получает доступ к тендерам.",
  },
  {
    question: "Что такое 3D/AR-конфигуратор?",
    answer:
      "Это инструмент в мобильном приложении, который позволяет создать проект дома в 3D: настроить планировку, материалы стен, кровлю и фасад. AR-режим позволяет «примерить» дом на ваш реальный участок через камеру смартфона — вы увидите, как будет выглядеть дом ещё до начала строительства.",
  },
  {
    question: "Сколько стоит пользоваться платформой для заказчика?",
    answer:
      "Для заказчика платформа бесплатна. Вы скачиваете приложение, создаёте проект и выбираете подрядчика без каких-либо комиссий. Платформа зарабатывает на комиссии с подрядчиков и поставщиков за успешные сделки.",
  },
  {
    question: "Как стать подрядчиком на платформе?",
    answer:
      "Зарегистрируйтесь в веб-кабинете партнёра, загрузите необходимые документы (ИНН, выписка ЕГРЮЛ, паспорт директора), пройдите верификацию. Обычно процесс занимает 2–3 рабочих дня. После одобрения вы получаете доступ к бирже тендеров в вашем регионе.",
  },
  {
    question: "В каких регионах работает платформа?",
    answer:
      "Сейчас платформа активно работает в 42 регионах России. Приоритетные регионы — Московская область, Краснодарский край, Ленинградская область. Если вашего региона нет в списке — оставьте заявку, и мы сообщим о запуске.",
  },
];

function FaqItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b last:border-b-0"
      style={{ borderColor: "oklch(0.22 0.01 240)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold flex-shrink-0"
            style={{
              color: "oklch(0.769 0.188 70.08 / 0.6)",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="text-sm font-semibold text-white group-hover:text-[oklch(0.769_0.188_70.08)] transition-colors"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {faq.question}
          </span>
        </div>
        <ChevronDown
          size={16}
          className="flex-shrink-0 text-[oklch(0.50_0.01_240)] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div className="pb-5 pl-8">
          <p
            className="text-sm text-[oklch(0.60_0.01_240)] leading-relaxed"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FaqSection() {
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
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "oklch(0.12 0.008 240)" }}
    >
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Left: Header */}
          <div className="flex flex-col gap-4 reveal">
            <div className="accent-line mb-2" />
            <p className="text-[oklch(0.769_0.188_70.08)] text-sm font-semibold uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>
              Частые вопросы
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Ответы на
              <br />
              <span className="text-amber-glow">ваши вопросы</span>
            </h2>
            <p className="text-[oklch(0.55_0.01_240)] text-base leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Не нашли ответ? Напишите нам — ответим в течение рабочего дня.
            </p>
            <div className="mt-4">
              <a
                href="mailto:hello@terradom.ru"
                className="btn-amber-outline inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm"
              >
                Написать в поддержку
              </a>
            </div>
          </div>

          {/* Right: FAQ accordion */}
          <div
            className="reveal glass-card rounded-2xl p-6 lg:p-8"
          >
            {faqs.map((faq, i) => (
              <FaqItem key={faq.question} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
