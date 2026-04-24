/**
 * ProductPage — /marketplace/:id
 * Detailed product view: image gallery, specs table, reviews, add to cart.
 * Light theme, e-commerce grade UX.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { marketplaceApi } from "@/lib/marketplace.api";
import type { Product, Review } from "@/lib/marketplace.types";
import { useCart } from "@/contexts/CartContext";
import MarketplaceLayout, { LightCard, StatusBadge, BlueButton, AmberButton, OutlineButton } from "@/components/MarketplaceLayout";
import {
  Star,
  ShoppingCart,
  Shield,
  Truck,
  CheckCircle2,
  Package,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  MapPin,
  Clock,
  Award,
  MessageSquare,
  Share2,
  Heart,
  AlertCircle,
} from "lucide-react";

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews" | "delivery">("specs");
  const { addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      marketplaceApi.products.get(id),
      marketplaceApi.reviews.list(id),
    ])
      .then(([p, r]) => {
        setProduct(p);
        setReviews(r);
        setQuantity(p.minOrder ?? 1);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MarketplaceLayout breadcrumbs={[{ label: "Каталог", href: "/marketplace" }, { label: "Загрузка..." }]}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="aspect-[4/3] rounded-2xl bg-gray-200 animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => <div key={i} className="w-20 h-16 rounded-xl bg-gray-200 animate-pulse" />)}
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 rounded-xl bg-gray-200 animate-pulse" />)}
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (error || !product) {
    return (
      <MarketplaceLayout breadcrumbs={[{ label: "Каталог", href: "/marketplace" }]}>
        <LightCard className="text-center py-16">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 mb-2">Товар не найден</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Link href="/marketplace">
            <BlueButton>← Вернуться в каталог</BlueButton>
          </Link>
        </LightCard>
      </MarketplaceLayout>
    );
  }

  const primaryImage: string | null = product.images?.[0] ?? null;
  const displayImage: string | null = (product.images[activeImage] as string | undefined) ?? primaryImage ?? null;
  const discount = product.priceOld ? Math.round((1 - product.price / product.priceOld) * 100) : 0;

  return (
    <MarketplaceLayout
      breadcrumbs={[
        { label: "Каталог", href: "/marketplace" },
        { label: product.categoryName ?? "Каталог", href: `/marketplace?category=${product.categorySlug ?? ""}` },
        { label: product.name },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* ── Image Gallery ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 group">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={64} className="text-gray-300" />
              </div>
            )}
            {/* Nav arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => (i - 1 + product.images.length) % product.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={18} className="text-gray-700" />
                </button>
                <button
                  onClick={() => setActiveImage((i) => (i + 1) % product.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={18} className="text-gray-700" />
                </button>
              </>
            )}
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {discount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "#EF4444", color: "#fff" }}>
                  -{discount}%
                </span>
              )}
              {!(product.stockAvailable > 0) && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-800 text-white">
                  Нет в наличии
                </span>
              )}
            </div>
            {/* Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors">
                <Heart size={16} className="text-gray-500" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors">
                <Share2 size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors"
                  style={{ borderColor: activeImage === i ? "#2563EB" : "#E5E7EB" }}
                >
                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ──────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Category + name */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-blue-600">{product.categoryName}</span>
              {product.technology && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{product.technology}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.rating ?? 0} size={16} />
            <span className="text-sm font-semibold text-gray-700">{((product.rating ?? 0)).toFixed(1)}</span>
            <span className="text-sm text-gray-400">{product.reviewCount ?? 0} отзывов</span>
            {product.supplier?.verified && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <Shield size={12} /> Верифицирован
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <div>
              <div className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</div>
              <div className="text-sm text-gray-500">за {product.unit}</div>
            </div>
            {product.priceOld && (
              <div className="pb-1">
                <div className="text-lg text-gray-400 line-through">{formatPrice(product.priceOld)}</div>
                <div className="text-xs font-bold text-red-500">Экономия {formatPrice(product.priceOld - product.price)}</div>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.stockAvailable > 0 ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 size={16} /> В наличии
                {product.stockAvailable && <span className="text-gray-400 font-normal">({product.stockAvailable} {product.unit})</span>}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                <AlertCircle size={16} /> Нет в наличии
              </span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
              <button
                onClick={() => setQuantity((q) => Math.max(product.minOrder ?? 1, q - 1))}
                className="px-3 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <Minus size={16} className="text-gray-600" />
              </button>
              <span className="px-4 py-2.5 text-sm font-semibold text-gray-900 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} className="text-gray-600" />
              </button>
            </div>
            <span className="text-xs text-gray-400">мин. {product.minOrder} {product.unit}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => addItem(product.id, quantity, product.name)}
              disabled={cartLoading || !(product.stockAvailable > 0)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              style={{ background: "#2563EB", color: "#fff", fontFamily: "Montserrat, sans-serif" }}
            >
              <ShoppingCart size={18} />
              В корзину — {formatPrice(product.price * quantity)}
            </button>
          </div>

          {/* Supplier card */}
          <LightCard padding="p-4">
            <div className="flex items-center gap-3">
              {product.supplier?.logoUrl ? (
                <img src={product.supplier?.logoUrl} alt={product.supplier?.name ?? "Поставщик"} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                  <Award size={20} className="text-blue-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">{product.supplier?.name ?? "Поставщик"}</span>
                  {product.supplier?.verified && (
                    <Shield size={12} className="text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs text-gray-600">{product.supplier?.rating ?? 0} ({product.supplier?.reviewCount ?? 0} отзывов)</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t" style={{ borderColor: "#F3F4F6" }}>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck size={14} className="text-blue-500" />
                <span>Доставка {product.supplier?.deliveryDays ?? 5} дн.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={14} className="text-blue-500" />
                <span className="truncate">{product.supplier?.regions?.[0] ?? ""}</span>
              </div>
            </div>
          </LightCard>

          {/* Trust */}
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Shield size={12} className="text-green-500" /> Безопасная оплата</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-blue-500" /> Возврат 14 дней</span>
          </div>
        </div>
      </div>

      {/* ── Tabs: Specs / Reviews / Delivery ─────────────────────────── */}
      <div className="mb-8">
        <div className="flex gap-1 border-b mb-6" style={{ borderColor: "#E5E7EB" }}>
          {(["specs", "reviews", "delivery"] as const).map((tab) => {
            const labels = { specs: "Характеристики", reviews: `Отзывы (${reviews.length})`, delivery: "Доставка и оплата" };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px"
                style={
                  activeTab === tab
                    ? { borderColor: "#2563EB", color: "#2563EB" }
                    : { borderColor: "transparent", color: "#6B7280" }
                }
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {activeTab === "specs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Description */}
            <LightCard>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>Описание</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              {(product.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {(product.tags ?? []).map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs" style={{ background: "#F3F4F6", color: "#6B7280" }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </LightCard>

            {/* Specs table */}
            <LightCard>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>Характеристики</h3>
              <div className="space-y-2">
                {(product.specs ?? []).map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    style={{ borderColor: "#F3F4F6" }}
                  >
                    <span className="text-sm text-gray-500">{spec.label}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {spec.value}{spec.unit ? ` ${spec.unit}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </LightCard>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <LightCard className="text-center py-10">
                <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Отзывов пока нет</p>
              </LightCard>
            ) : (
              reviews.map((r) => (
                <LightCard key={r.id} padding="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{r.authorName}</span>
                        {r.verified && (
                          <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> Подтверждённая покупка
                          </span>
                        )}
                      </div>
                      <StarRating rating={r.rating} size={12} />
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{r.text}</p>
                </LightCard>
              ))
            )}
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LightCard>
              <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Доставка</h3>
              <div className="space-y-3">
                {[
                  { icon: <Truck size={18} className="text-blue-600" />, title: "Доставка до объекта", text: `Срок: ${product.supplier?.deliveryDays ?? 5} рабочих дней` },
                  { icon: <MapPin size={18} className="text-blue-600" />, title: "Регионы поставки", text: (product.supplier?.regions ?? []).join(", ") },
                  { icon: <Package size={18} className="text-blue-600" />, title: "Минимальный заказ", text: `${product.minOrder} ${product.unit}` },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </LightCard>
            <LightCard>
              <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Оплата</h3>
              <div className="space-y-3">
                {[
                  { icon: "💳", title: "Банковская карта", text: "Visa, Mastercard, МИР — онлайн" },
                  { icon: "🔒", title: "Эскроу (безопасная сделка)", text: "Деньги поступят поставщику после подтверждения доставки" },
                  { icon: "📄", title: "Счёт для юридических лиц", text: "НДС, акт, накладная — полный пакет документов" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </LightCard>
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
}
