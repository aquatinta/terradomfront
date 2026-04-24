/**
 * CartPage — /cart
 * Cart management + order summary. Light theme.
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import MarketplaceLayout, { LightCard, BlueButton, AmberButton, OutlineButton } from "@/components/MarketplaceLayout";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Package,
  ArrowRight,
  Truck,
  Shield,
  Tag,
  ChevronRight,
} from "lucide-react";

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

export default function CartPage() {
  const [, navigate] = useLocation();
  const { cart, updateItem, removeItem, loading } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  if (cart.items.length === 0) {
    return (
      <MarketplaceLayout
        title="Корзина"
        breadcrumbs={[{ label: "Каталог", href: "/marketplace" }, { label: "Корзина" }]}
      >
        <LightCard className="text-center py-20 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "#EFF6FF" }}>
            <ShoppingCart size={36} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Корзина пуста
          </h2>
          <p className="text-gray-500 mb-6">Добавьте товары из каталога, чтобы оформить заказ</p>
          <Link href="/marketplace">
            <AmberButton size="lg">
              Перейти в каталог <ArrowRight size={16} />
            </AmberButton>
          </Link>
        </LightCard>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout
      title={`Корзина (${cart.itemCount})`}
      breadcrumbs={[{ label: "Каталог", href: "/marketplace" }, { label: "Корзина" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Cart items ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => {
            const primaryImage = item.product.images.find((i) => i) ?? item.product.images[0];
            return (
              <LightCard key={item.id} padding="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <Link href={`/marketplace/${item.productId}`} className="flex-shrink-0">
                    <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100">
                      {primaryImage ? (
                        <img src={primaryImage} alt={"image"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={28} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs text-blue-600 font-medium">{item.product.categoryName}</span>
                        <Link href={`/marketplace/${item.productId}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm leading-snug line-clamp-2 mt-0.5" style={{ fontFamily: "Manrope, sans-serif" }}>
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">{item.product.supplier?.name ?? ""}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
                        <button
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          disabled={loading || item.quantity <= (item.product.minOrder ?? 1)}
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          <Minus size={13} className="text-gray-600" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={loading}
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          <Plus size={13} className="text-gray-600" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-400">{item.product.unit}</span>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatPrice(item.subtotal)}</div>
                        <div className="text-xs text-gray-400">{formatPrice(item.price)} / {item.product.unit}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </LightCard>
            );
          })}

          {/* Continue shopping */}
          <Link href="/marketplace" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-2">
            <ChevronRight size={16} className="rotate-180" />
            Продолжить покупки
          </Link>
        </div>

        {/* ── Order summary ────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Promo code */}
          <LightCard padding="p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
              <Tag size={16} className="text-blue-600" /> Промокод
            </h3>
            {promoApplied ? (
              <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "#D1FAE5" }}>
                <span className="text-sm font-semibold text-green-700">✓ TERRADOM10 применён</span>
                <button onClick={() => setPromoApplied(false)} className="ml-auto text-xs text-green-600 hover:underline">Убрать</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Введите промокод"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: "#E5E7EB" }}
                />
                <button
                  onClick={() => { if (promoCode === "TERRADOM10") setPromoApplied(true); }}
                  className="px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "#EFF6FF", color: "#2563EB" }}
                >
                  OK
                </button>
              </div>
            )}
          </LightCard>

          {/* Summary */}
          <LightCard padding="p-5">
            <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Итого</h3>
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Товары ({cart.itemCount} поз.)</span>
                <span className="font-medium text-gray-900">{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.deliveryEstimate !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Truck size={13} /> Доставка
                  </span>
                  <span className="font-medium text-gray-900">
                    {cart.deliveryEstimate === 0 ? (
                      <span className="text-green-600">Бесплатно</span>
                    ) : formatPrice(cart.deliveryEstimate)}
                  </span>
                </div>
              )}
              {promoApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Скидка 10%</span>
                  <span className="text-green-600 font-medium">-{formatPrice(cart.subtotal * 0.1)}</span>
                </div>
              )}
              <div className="border-t pt-2.5" style={{ borderColor: "#F3F4F6" }}>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">К оплате</span>
                  <span className="font-black text-xl text-gray-900">
                    {formatPrice(cart.total - (promoApplied ? cart.subtotal * 0.1 : 0))}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90"
              style={{ background: "#F59E0B", color: "#1C1917", fontFamily: "Montserrat, sans-serif" }}
            >
              Оформить заказ →
            </button>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Shield size={11} /> Безопасная оплата</span>
              <span className="flex items-center gap-1"><Truck size={11} /> Доставка по РФ</span>
            </div>
          </LightCard>
        </div>
      </div>
    </MarketplaceLayout>
  );
}
