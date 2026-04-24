/**
 * CheckoutPage — /checkout
 * Multi-step order placement: address → payment → confirm.
 * Light theme, clean form UX.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { marketplaceApi } from "@/lib/marketplace.api";
import type { DeliveryAddress } from "@/lib/marketplace.types";
import MarketplaceLayout, { LightCard } from "@/components/MarketplaceLayout";
import {
  MapPin,
  CreditCard,
  Shield,
  CheckCircle2,
  Package,
  Truck,
  ChevronRight,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

const REGIONS = [
  "Московская область", "Краснодарский край", "Ленинградская область",
  "Ростовская область", "Тверская область", "Новгородская область",
  "Свердловская область", "Новосибирская область", "Татарстан", "Башкортостан",
];

type Step = "address" | "payment" | "confirm";
type PaymentMethod = "card" | "escrow" | "invoice";

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { cart, clearCart } = useCart();
  const [step, setStep] = useState<Step>("address");
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState<DeliveryAddress>({
    region: "",
    city: "",
    street: "",
    zip: "",
    comment: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [comment, setComment] = useState("");

  const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "address", label: "Адрес", icon: <MapPin size={16} /> },
    { id: "payment", label: "Оплата", icon: <CreditCard size={16} /> },
    { id: "confirm", label: "Подтверждение", icon: <CheckCircle2 size={16} /> },
  ];
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const canProceedAddress = address.region && address.city && address.street;

  const handlePlaceOrder = async () => {
    if (!cart.items.length) return;
    setPlacing(true);
    try {
      const order = await marketplaceApi.orders.create({
        idempotency_key: crypto.randomUUID(),
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        delivery_address: address,
        comment,
      });
      await clearCart();
      toast.success(`Заказ ${order.orderNumber} оформлен!`);
      navigate("/orders");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка оформления заказа");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.items.length === 0 && step !== "confirm") {
    navigate("/cart");
    return null;
  }

  return (
    <MarketplaceLayout
      title="Оформление заказа"
      breadcrumbs={[
        { label: "Каталог", href: "/marketplace" },
        { label: "Корзина", href: "/cart" },
        { label: "Оформление" },
      ]}
    >
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                style={
                  i < stepIndex
                    ? { background: "#D1FAE5", color: "#059669" }
                    : i === stepIndex
                    ? { background: "#2563EB", color: "#fff" }
                    : { background: "#F3F4F6", color: "#9CA3AF" }
                }
              >
                {i < stepIndex ? <CheckCircle2 size={18} /> : s.icon}
              </div>
              <span
                className="text-xs mt-1 font-medium"
                style={{ color: i === stepIndex ? "#2563EB" : i < stepIndex ? "#059669" : "#9CA3AF" }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-16 sm:w-24 h-0.5 mx-2 mb-5"
                style={{ background: i < stepIndex ? "#D1FAE5" : "#E5E7EB" }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main form ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {step === "address" && (
            <LightCard>
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                <MapPin size={20} className="text-blue-600" /> Адрес доставки
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Регион *</label>
                  <select
                    value={address.region}
                    onChange={(e) => setAddress((a) => ({ ...a, region: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <option value="">Выберите регион</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Город / населённый пункт *</label>
                  <input
                    type="text"
                    placeholder="Москва"
                    value={address.city}
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: "#E5E7EB" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Почтовый индекс</label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={address.zip ?? ""}
                    onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: "#E5E7EB" }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Улица, дом, строение *</label>
                  <input
                    type="text"
                    placeholder="ул. Строителей, д. 12"
                    value={address.street}
                    onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: "#E5E7EB" }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Комментарий к доставке</label>
                  <textarea
                    placeholder="Ориентир, время доставки, контактное лицо..."
                    value={address.comment ?? ""}
                    onChange={(e) => setAddress((a) => ({ ...a, comment: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ borderColor: "#E5E7EB" }}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-5">
                <button
                  onClick={() => setStep("payment")}
                  disabled={!canProceedAddress}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{ background: "#2563EB", color: "#fff", fontFamily: "Montserrat, sans-serif" }}
                >
                  Далее: Оплата <ChevronRight size={16} />
                </button>
              </div>
            </LightCard>
          )}

          {step === "payment" && (
            <LightCard>
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                <CreditCard size={20} className="text-blue-600" /> Способ оплаты
              </h2>
              <div className="space-y-3">
                {([
                  {
                    id: "card" as PaymentMethod,
                    icon: "💳",
                    title: "Банковская карта",
                    desc: "Visa, Mastercard, МИР. Мгновенное зачисление.",
                    recommended: false,
                  },
                  {
                    id: "escrow" as PaymentMethod,
                    icon: "🔒",
                    title: "Эскроу (безопасная сделка)",
                    desc: "Деньги поступят поставщику только после подтверждения доставки.",
                    recommended: true,
                  },
                  {
                    id: "invoice" as PaymentMethod,
                    icon: "📄",
                    title: "Счёт для юридических лиц",
                    desc: "Оплата по счёту с НДС. Полный пакет документов.",
                    recommended: false,
                  },
                ]).map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                    style={
                      payment === opt.id
                        ? { borderColor: "#2563EB", background: "#EFF6FF" }
                        : { borderColor: "#E5E7EB", background: "#fff" }
                    }
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={payment === opt.id}
                      onChange={() => setPayment(opt.id)}
                      className="mt-0.5 accent-blue-600"
                    />
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{opt.title}</span>
                        {opt.recommended && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#D1FAE5", color: "#059669" }}>
                            Рекомендуем
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Комментарий к заказу</label>
                <textarea
                  placeholder="Дополнительные пожелания..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ borderColor: "#E5E7EB" }}
                />
              </div>

              <div className="flex justify-between mt-5">
                <button
                  onClick={() => setStep("address")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                >
                  ← Назад
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                  style={{ background: "#2563EB", color: "#fff", fontFamily: "Montserrat, sans-serif" }}
                >
                  Далее: Подтверждение <ChevronRight size={16} />
                </button>
              </div>
            </LightCard>
          )}

          {step === "confirm" && (
            <LightCard>
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                <CheckCircle2 size={20} className="text-blue-600" /> Подтверждение заказа
              </h2>

              {/* Address summary */}
              <div className="p-4 rounded-xl mb-4" style={{ background: "#F8FAFC" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Адрес доставки</span>
                  <button onClick={() => setStep("address")} className="text-xs text-blue-600 hover:underline">Изменить</button>
                </div>
                <p className="text-sm text-gray-800">{address.region}, {address.city}, {address.street}</p>
                {address.comment && <p className="text-xs text-gray-500 mt-1">{address.comment}</p>}
              </div>

              {/* Payment summary */}
              <div className="p-4 rounded-xl mb-4" style={{ background: "#F8FAFC" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Оплата</span>
                  <button onClick={() => setStep("payment")} className="text-xs text-blue-600 hover:underline">Изменить</button>
                </div>
                <p className="text-sm text-gray-800">
                  {payment === "card" ? "💳 Банковская карта" : payment === "escrow" ? "🔒 Эскроу" : "📄 Счёт для юр. лиц"}
                </p>
              </div>

              {/* Items summary */}
              <div className="p-4 rounded-xl mb-5" style={{ background: "#F8FAFC" }}>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Товары</span>
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate flex-1 mr-2">{item.product.name}</span>
                      <span className="text-gray-500 flex-shrink-0">{item.quantity} {item.product.unit}</span>
                      <span className="font-semibold text-gray-900 flex-shrink-0 ml-4">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-5">
                <button
                  onClick={() => setStep("payment")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                >
                  ← Назад
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-70"
                  style={{ background: "#F59E0B", color: "#1C1917", fontFamily: "Montserrat, sans-serif" }}
                >
                  {placing ? (
                    <><Loader2 size={16} className="animate-spin" /> Оформляем...</>
                  ) : (
                    <><Lock size={16} /> Подтвердить заказ — {formatPrice(cart.total)}</>
                  )}
                </button>
              </div>
            </LightCard>
          )}
        </div>

        {/* ── Order summary sidebar ────────────────────────────────────── */}
        <div>
          <LightCard padding="p-5" className="sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Ваш заказ
            </h3>
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => {
                const img = item.product.images.find((i) => i) ?? item.product.images[0];
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {img ? (
                        <img src={img} alt={"image"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} {item.product.unit}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 flex-shrink-0">{formatPrice(item.subtotal)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-4 space-y-2" style={{ borderColor: "#F3F4F6" }}>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Товары</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1"><Truck size={12} /> Доставка</span>
                <span className="font-medium">
                  {cart.deliveryEstimate === 0 ? <span className="text-green-600">Бесплатно</span> : formatPrice(cart.deliveryEstimate ?? 0)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t" style={{ borderColor: "#F3F4F6" }}>
                <span>Итого</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
              <Shield size={12} className="text-green-500" />
              <span>Защищённая оплата через Террадом</span>
            </div>
          </LightCard>
        </div>
      </div>
    </MarketplaceLayout>
  );
}
