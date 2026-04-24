/**
 * MarketplacePage — /marketplace
 * Public catalog: categories, search, filters, product grid.
 * Light theme. Best-in-class e-commerce UX.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { marketplaceApi } from "@/lib/marketplace.api";
import type { Category, Product, ProductFilters } from "@/lib/marketplace.types";
import { useCart } from "@/contexts/CartContext";
import MarketplaceLayout, { LightCard, StatusBadge, BlueButton, AmberButton } from "@/components/MarketplaceLayout";
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingCart,
  ChevronDown,
  X,
  CheckCircle2,
  Package,
  Truck,
  Shield,
  ArrowRight,
  Grid3X3,
  List,
  Filter,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={12} className="fill-amber-400 text-amber-400" />
      <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product Card
// ---------------------------------------------------------------------------
function ProductCard({ product, view = "grid" }: { product: Product; view?: "grid" | "list" }) {
  const { addItem, loading } = useCart();
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];

  if (view === "list") {
    return (
      <LightCard padding="p-4" className="hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          <Link href={`/marketplace/${product.id}`} className="flex-shrink-0">
            <div className="w-32 h-24 rounded-xl overflow-hidden bg-gray-100">
              {primaryImage ? (
                <img src={primaryImage.url} alt={primaryImage.alt} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={32} className="text-gray-300" />
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs text-blue-600 font-medium">{product.categoryName}</span>
                <Link href={`/marketplace/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mt-0.5 line-clamp-1" style={{ fontFamily: "Manrope, sans-serif" }}>
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.shortDescription}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</div>
                <div className="text-xs text-gray-400">/ {product.unit}</div>
                {product.priceOld && (
                  <div className="text-xs text-gray-400 line-through">{formatPrice(product.priceOld)}</div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} count={product.reviewCount} />
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{product.supplier.name}</span>
                {product.inStock ? (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 size={10} /> В наличии
                  </span>
                ) : (
                  <span className="text-xs text-red-500">Нет в наличии</span>
                )}
              </div>
              <button
                onClick={() => addItem(product.id, product.minOrder, product.name)}
                disabled={loading || !product.inStock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                style={{ background: "#2563EB", color: "#fff" }}
              >
                <ShoppingCart size={12} />
                В корзину
              </button>
            </div>
          </div>
        </div>
      </LightCard>
    );
  }

  return (
    <LightCard padding="p-0" className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Image */}
      <Link href={`/marketplace/${product.id}`} className="block relative">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={48} className="text-gray-300" />
            </div>
          )}
        </div>
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {product.priceOld && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#EF4444", color: "#fff" }}>
              -{Math.round((1 - product.price / product.priceOld) * 100)}%
            </span>
          )}
          {product.tags.slice(0, 1).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(255,255,255,0.9)", color: "#374151" }}>
              {tag}
            </span>
          ))}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white">Нет в наличии</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-blue-600 font-medium mb-1">{product.categoryName}</div>
        <Link href={`/marketplace/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm leading-snug line-clamp-2 mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} count={product.reviewCount} />
          {product.supplier.verified && (
            <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
              <Shield size={9} /> Верифицирован
            </span>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</div>
            <div className="text-xs text-gray-400">/ {product.unit}</div>
            {product.priceOld && (
              <div className="text-xs text-gray-400 line-through">{formatPrice(product.priceOld)}</div>
            )}
          </div>
          <button
            onClick={() => addItem(product.id, product.minOrder, product.name)}
            disabled={loading || !product.inStock}
            className="p-2 rounded-xl transition-all disabled:opacity-50 hover:scale-105"
            style={{ background: "#2563EB", color: "#fff" }}
            title="Добавить в корзину"
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Supplier + delivery */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: "#F3F4F6" }}>
          <span className="text-xs text-gray-500 truncate">{product.supplier.name}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
            <Truck size={10} />
            {product.supplier.deliveryDays} дн.
          </span>
        </div>
      </div>
    </LightCard>
  );
}

// ---------------------------------------------------------------------------
// Filter Panel
// ---------------------------------------------------------------------------
const REGIONS = [
  "Московская область", "Краснодарский край", "Ленинградская область",
  "Ростовская область", "Тверская область", "Новгородская область",
];
const TECHNOLOGIES = ["Газобетон", "Каркас", "Кирпич", "Монолит", "Брус", "СИП-панели"];
const SORT_OPTIONS = [
  { value: "newest", label: "Новинки" },
  { value: "rating", label: "По рейтингу" },
  { value: "price_asc", label: "Дешевле" },
  { value: "price_desc", label: "Дороже" },
];

function FilterPanel({
  filters,
  onChange,
  categories,
  onClose,
}: {
  filters: ProductFilters;
  onChange: (f: Partial<ProductFilters>) => void;
  categories: Category[];
  onClose?: () => void;
}) {
  return (
    <div className="space-y-6">
      {onClose && (
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Фильтры</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Category */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Категория</h4>
        <div className="space-y-1">
          <button
            onClick={() => onChange({ categorySlug: "" })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!filters.categorySlug ? "font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
            style={!filters.categorySlug ? { background: "#EFF6FF", color: "#2563EB" } : {}}
          >
            Все категории
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onChange({ categorySlug: cat.slug })}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between ${filters.categorySlug === cat.slug ? "font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
              style={filters.categorySlug === cat.slug ? { background: "#EFF6FF", color: "#2563EB" } : {}}
            >
              <span>{cat.icon} {cat.name}</span>
              <span className="text-xs text-gray-400">{cat.productCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Цена (₽)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="От"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: "#E5E7EB" }}
          />
          <input
            type="number"
            placeholder="До"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: "#E5E7EB" }}
          />
        </div>
      </div>

      {/* Region */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Регион поставки</h4>
        <select
          value={filters.region ?? ""}
          onChange={(e) => onChange({ region: e.target.value || undefined })}
          className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          style={{ borderColor: "#E5E7EB" }}
        >
          <option value="">Все регионы</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Technology */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Технология</h4>
        <div className="flex flex-wrap gap-2">
          {TECHNOLOGIES.map((t) => (
            <button
              key={t}
              onClick={() => onChange({ technology: filters.technology === t ? undefined : t })}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={
                filters.technology === t
                  ? { background: "#2563EB", color: "#fff", borderColor: "#2563EB" }
                  : { borderColor: "#E5E7EB", color: "#6B7280" }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* In stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => onChange({ inStock: !filters.inStock })}
            className={`w-10 h-5 rounded-full transition-colors relative ${filters.inStock ? "" : "bg-gray-200"}`}
            style={filters.inStock ? { background: "#2563EB" } : {}}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.inStock ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </div>
          <span className="text-sm text-gray-700">Только в наличии</span>
        </label>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange({ categorySlug: "", region: undefined, technology: undefined, minPrice: undefined, maxPrice: undefined, inStock: undefined })}
        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function MarketplacePage() {
  const [, navigate] = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: "newest",
    page: 1,
    perPage: 12,
  });

  const heroUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663083092813/A58kibhm9oWDaNRQR3mFUx/marketplace-hero-VomdefwVMbHvvkL6azvR5B.webp";

  // Load categories once
  useEffect(() => {
    marketplaceApi.categories.list().then(setCategories);
  }, []);

  // Load products on filter change
  const loadProducts = useCallback(async (f: ProductFilters) => {
    setLoadingProducts(true);
    try {
      const res = await marketplaceApi.products.list(f);
      setProducts(res.products);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(filters);
  }, [filters, loadProducts]);

  const updateFilters = useCallback((partial: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  }, []);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.categorySlug) n++;
    if (filters.region) n++;
    if (filters.technology) n++;
    if (filters.minPrice !== undefined) n++;
    if (filters.maxPrice !== undefined) n++;
    if (filters.inStock) n++;
    return n;
  }, [filters]);

  return (
    <MarketplaceLayout>
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 280 }}>
        <img src={heroUrl} alt="Маркетплейс строительных материалов" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(15,30,80,0.75) 0%, rgba(15,30,80,0.4) 50%, transparent 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-12">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">Маркетплейс</div>
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-3 max-w-lg leading-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Стройматериалы<br />и домокомплекты
          </h1>
          <p className="text-white/80 text-sm max-w-sm mb-5">
            Тысячи позиций от верифицированных поставщиков. Доставка по всей России.
          </p>
          {/* Search bar in hero */}
          <div className="flex gap-2 max-w-md">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={filters.search ?? ""}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
              {filters.search && (
                <button onClick={() => updateFilters({ search: "" })}>
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>
            <button
              className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ background: "#F59E0B", color: "#1C1917", fontFamily: "Montserrat, sans-serif" }}
              onClick={() => loadProducts(filters)}
            >
              Найти
            </button>
          </div>
        </div>
      </div>

      {/* ── Category chips ───────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={() => updateFilters({ categorySlug: "" })}
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          style={
            !filters.categorySlug
              ? { background: "#2563EB", color: "#fff", borderColor: "#2563EB" }
              : { borderColor: "#E5E7EB", color: "#6B7280", background: "#fff" }
          }
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => updateFilters({ categorySlug: cat.slug })}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap"
            style={
              filters.categorySlug === cat.slug
                ? { background: "#2563EB", color: "#fff", borderColor: "#2563EB" }
                : { borderColor: "#E5E7EB", color: "#6B7280", background: "#fff" }
            }
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* ── Main layout: sidebar + grid ──────────────────────────────────── */}
      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <LightCard>
            <FilterPanel filters={filters} onChange={updateFilters} categories={categories} />
          </LightCard>
        </aside>

        {/* Product area */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors"
                style={{ borderColor: "#E5E7EB", background: "#fff", color: "#374151" }}
              >
                <Filter size={14} />
                Фильтры
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#2563EB", color: "#fff" }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <span className="text-sm text-gray-500">
                {loadingProducts ? "Загрузка..." : `${total} товаров`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sortBy ?? "newest"}
                  onChange={(e) => updateFilters({ sortBy: e.target.value as ProductFilters["sortBy"] })}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  style={{ borderColor: "#E5E7EB", color: "#374151" }}
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {/* View toggle */}
              <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
                <button
                  onClick={() => setView("grid")}
                  className="p-2 transition-colors"
                  style={view === "grid" ? { background: "#2563EB", color: "#fff" } : { background: "#fff", color: "#9CA3AF" }}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className="p-2 transition-colors"
                  style={view === "list" ? { background: "#2563EB", color: "#fff" } : { background: "#fff", color: "#9CA3AF" }}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          {loadingProducts ? (
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border animate-pulse" style={{ borderColor: "#E5E7EB", height: view === "grid" ? 320 : 112 }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <LightCard className="text-center py-16">
              <Package size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-gray-700 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Товары не найдены</h3>
              <p className="text-sm text-gray-500 mb-4">Попробуйте изменить фильтры или поисковый запрос</p>
              <OutlineButton onClick={() => updateFilters({ categorySlug: "", search: "", region: undefined, technology: undefined })}>
                Сбросить фильтры
              </OutlineButton>
            </LightCard>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
              {products.map((p) => <ProductCard key={p.id} product={p} view={view} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setFilters((prev) => ({ ...prev, page }))}
                  className="w-9 h-9 rounded-xl text-sm font-medium transition-colors"
                  style={
                    filters.page === page
                      ? { background: "#2563EB", color: "#fff" }
                      : { background: "#fff", color: "#6B7280", border: "1px solid #E5E7EB" }
                  }
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
            style={{ background: "#fff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <FilterPanel
              filters={filters}
              onChange={(f) => { updateFilters(f); }}
              categories={categories}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Trust badges */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Shield size={24} className="text-blue-600" />, title: "Верифицированные поставщики", text: "Все продавцы проходят проверку документов и лицензий" },
          { icon: <Truck size={24} className="text-blue-600" />, title: "Доставка по России", text: "Логистика до объекта, отслеживание в реальном времени" },
          { icon: <CheckCircle2 size={24} className="text-blue-600" />, title: "Гарантия качества", text: "Возврат и замена в течение 14 дней при несоответствии" },
        ].map((b) => (
          <LightCard key={b.title} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
              {b.icon}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>{b.title}</h4>
              <p className="text-xs text-gray-500">{b.text}</p>
            </div>
          </LightCard>
        ))}
      </div>
    </MarketplaceLayout>
  );
}

// local helper (not exported from MarketplaceLayout to avoid circular)
function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
      style={{ borderColor: "#D1D5DB", color: "#374151" }}
    >
      {children}
    </button>
  );
}
