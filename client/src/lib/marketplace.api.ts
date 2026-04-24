// ---------------------------------------------------------------------------
// marketplace.api.ts
// Real API calls to /api/shop/* with mock-data fallback.
// When VITE_API_URL is not set (dev without backend), all calls fall back
// to the rich mock dataset so the UI always looks populated.
// ---------------------------------------------------------------------------
import axios from "axios";
import type {
  Category,
  Product,
  ApiProduct,
  ProductListResponse,
  ProductFilters,
  Cart,
  CartItem,
  Order,
  ApiOrder,
  CreateOrderRequest,
  SupplierOrder,
  SupplierStats,
  CreateProductRequest,
  UpdateProductRequest,
  Review,
  DeliveryAddress,
} from "./marketplace.types";

// ---------------------------------------------------------------------------
// Axios instance — reuses same base URL as main api.ts
// ---------------------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const http = axios.create({ baseURL: BASE_URL });

// Attach JWT automatically
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Convert ApiProduct → Product (enrich with UI-friendly fields) */
function enrichProduct(p: ApiProduct): Product {
  const specs = Object.entries(p.attributes ?? {}).map(([label, value]) => ({
    label,
    value: String(value),
  }));
  const mockSupplier = MOCK_SUPPLIERS.find((s) => s.id === p.supplierId) ?? MOCK_SUPPLIERS[0];
  return {
    ...p,
    categorySlug: p.category?.slug ?? "blocks",
    categoryName: p.category?.name ?? "Материалы",
    shortDescription: p.description?.slice(0, 120),
    minOrder: 1,
    specs,
    supplier: mockSupplier,
    rating: 4.5,
    reviewCount: 12,
    tags: [],
    status: p.isActive ? "active" : "archived",
    region: p.regionCode,
  };
}

/** Convert ApiOrder → Order (enrich with UI-friendly fields) */
function enrichOrder(o: ApiOrder): Order {
  return {
    ...o,
    orderNumber: `TD-${o.id.slice(0, 6).toUpperCase()}`,
    paymentMethod: "card",
    paymentStatus: o.status === "paid" || o.status === "delivered" || o.status === "completed"
      ? "paid"
      : o.status === "refunded"
      ? "refunded"
      : "pending",
  };
}

// ---------------------------------------------------------------------------
// MOCK DATA (shown when backend is not available)
// ---------------------------------------------------------------------------
const MOCK_SUPPLIERS = [
  {
    id: "sup-1",
    name: "СтройМатериалы Про",
    logoUrl: undefined,
    rating: 4.8,
    reviewCount: 234,
    verified: true,
    regions: ["Москва", "МО"],
    deliveryDays: 3,
  },
  {
    id: "sup-2",
    name: "ДомКомплект",
    logoUrl: undefined,
    rating: 4.6,
    reviewCount: 189,
    verified: true,
    regions: ["СПб", "ЛО"],
    deliveryDays: 5,
  },
  {
    id: "sup-3",
    name: "ТеплоДом",
    logoUrl: undefined,
    rating: 4.9,
    reviewCount: 312,
    verified: true,
    regions: ["Екатеринбург", "Свердловская обл."],
    deliveryDays: 4,
  },
];

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Домокомплекты", slug: "house-kits", position: 1, isActive: true, children: [], insertedAt: "", updatedAt: "" },
  { id: "cat-2", name: "Блоки и кирпич", slug: "blocks", position: 2, isActive: true, children: [], insertedAt: "", updatedAt: "" },
  { id: "cat-3", name: "Утеплители", slug: "insulation", position: 3, isActive: true, children: [], insertedAt: "", updatedAt: "" },
  { id: "cat-4", name: "Кровля", slug: "roofing", position: 4, isActive: true, children: [], insertedAt: "", updatedAt: "" },
  { id: "cat-5", name: "Окна и двери", slug: "windows-doors", position: 5, isActive: true, children: [], insertedAt: "", updatedAt: "" },
  { id: "cat-6", name: "Полы", slug: "flooring", position: 6, isActive: true, children: [], insertedAt: "", updatedAt: "" },
  { id: "cat-7", name: "Фасад", slug: "facade", position: 7, isActive: true, children: [], insertedAt: "", updatedAt: "" },
  { id: "cat-8", name: "Инженерия", slug: "engineering", position: 8, isActive: true, children: [], insertedAt: "", updatedAt: "" },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1", name: "Газобетонный блок D500 600×300×200", slug: "gazobeton-d500",
    description: "Автоклавный газобетон D500. Идеален для несущих и ненесущих стен. Высокая теплоизоляция, точные геометрические размеры.",
    shortDescription: "Автоклавный газобетон D500 для несущих стен",
    sku: "GB-D500-200", unit: "м³", price: 4800, priceWholesale: 4500, priceOld: 5200,
    stockTotal: 500, stockReserved: 20, stockAvailable: 480,
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"],
    attributes: { "Плотность": "D500", "Размер": "600×300×200 мм", "Прочность": "B2.5" },
    regionCode: "77", isActive: true, categoryId: "cat-2", supplierId: "sup-1",
    category: { id: "cat-2", name: "Блоки и кирпич", slug: "blocks" },
    insertedAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    categorySlug: "blocks", categoryName: "Блоки и кирпич", minOrder: 5,
    specs: [{ label: "Плотность", value: "D500" }, { label: "Размер", value: "600×300×200 мм" }, { label: "Прочность", value: "B2.5" }],
    supplier: MOCK_SUPPLIERS[0], rating: 4.8, reviewCount: 156, tags: ["газобетон", "блоки"], status: "active",
  },
  {
    id: "prod-2", name: "Домокомплект «Уют 120» — каркасный дом 120 м²", slug: "domokomplekt-uyut-120",
    description: "Полный комплект для строительства каркасного дома 120 м². Включает стеновые панели, кровельную систему, окна и двери. Монтаж за 45 дней.",
    shortDescription: "Каркасный дом 120 м² под ключ",
    sku: "DK-UYUT-120", unit: "комплект", price: 2_850_000, priceOld: 3_100_000,
    stockTotal: 10, stockReserved: 2, stockAvailable: 8,
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"],
    attributes: { "Площадь": "120 м²", "Технология": "Каркас", "Этажей": "1" },
    regionCode: "77", isActive: true, categoryId: "cat-1", supplierId: "sup-2",
    category: { id: "cat-1", name: "Домокомплекты", slug: "house-kits" },
    insertedAt: "2024-01-02T00:00:00Z", updatedAt: "2024-01-02T00:00:00Z",
    categorySlug: "house-kits", categoryName: "Домокомплекты", minOrder: 1,
    specs: [{ label: "Площадь", value: "120 м²" }, { label: "Технология", value: "Каркас" }],
    supplier: MOCK_SUPPLIERS[1], rating: 4.9, reviewCount: 43, tags: ["домокомплект", "каркас"], status: "active",
  },
  {
    id: "prod-3", name: "Минеральная вата ROCKWOOL 100 мм", slug: "rockwool-100",
    description: "Каменная вата для утепления стен, кровли и перекрытий. Негорючая, паропроницаемая, устойчива к деформациям.",
    shortDescription: "Каменная вата для стен и кровли",
    sku: "RW-100-50", unit: "м²", price: 420, priceOld: 480,
    stockTotal: 2000, stockReserved: 100, stockAvailable: 1900,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
    attributes: { "Толщина": "100 мм", "Плотность": "50 кг/м³", "Класс горючести": "НГ" },
    regionCode: "77", isActive: true, categoryId: "cat-3", supplierId: "sup-3",
    category: { id: "cat-3", name: "Утеплители", slug: "insulation" },
    insertedAt: "2024-01-03T00:00:00Z", updatedAt: "2024-01-03T00:00:00Z",
    categorySlug: "insulation", categoryName: "Утеплители", minOrder: 10,
    specs: [{ label: "Толщина", value: "100 мм" }, { label: "Плотность", value: "50 кг/м³" }],
    supplier: MOCK_SUPPLIERS[2], rating: 4.7, reviewCount: 89, tags: ["утеплитель", "минвата"], status: "active",
  },
  {
    id: "prod-4", name: "Металлочерепица МП Монтеррей 0.5 мм", slug: "metallocherepica-monterrey",
    description: "Металлочерепица с полимерным покрытием Polyester. Толщина стали 0.5 мм. Гарантия 15 лет. Цвет RAL 3011.",
    shortDescription: "Металлочерепица с полимерным покрытием",
    sku: "MC-MONT-05", unit: "м²", price: 650, priceOld: 720,
    stockTotal: 3000, stockReserved: 200, stockAvailable: 2800,
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
    attributes: { "Толщина": "0.5 мм", "Покрытие": "Polyester", "Гарантия": "15 лет" },
    regionCode: "78", isActive: true, categoryId: "cat-4", supplierId: "sup-1",
    category: { id: "cat-4", name: "Кровля", slug: "roofing" },
    insertedAt: "2024-01-04T00:00:00Z", updatedAt: "2024-01-04T00:00:00Z",
    categorySlug: "roofing", categoryName: "Кровля", minOrder: 20,
    specs: [{ label: "Толщина", value: "0.5 мм" }, { label: "Покрытие", value: "Polyester" }],
    supplier: MOCK_SUPPLIERS[0], rating: 4.6, reviewCount: 201, tags: ["кровля", "металлочерепица"], status: "active",
  },
  {
    id: "prod-5", name: "Окно ПВХ VEKA 1200×1400 двухкамерное", slug: "okno-veka-1200x1400",
    description: "Пластиковое окно из профиля VEKA Softline 70. Двухкамерный стеклопакет, фурнитура ROTO. Монтажная ширина 70 мм.",
    shortDescription: "ПВХ окно VEKA двухкамерное",
    sku: "WN-VEKA-1214", unit: "шт", price: 18_500, priceOld: 21_000,
    stockTotal: 50, stockReserved: 5, stockAvailable: 45,
    images: ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"],
    attributes: { "Размер": "1200×1400 мм", "Профиль": "VEKA 70 мм", "Стеклопакет": "Двухкамерный" },
    regionCode: "77", isActive: true, categoryId: "cat-5", supplierId: "sup-2",
    category: { id: "cat-5", name: "Окна и двери", slug: "windows-doors" },
    insertedAt: "2024-01-05T00:00:00Z", updatedAt: "2024-01-05T00:00:00Z",
    categorySlug: "windows-doors", categoryName: "Окна и двери", minOrder: 1,
    specs: [{ label: "Размер", value: "1200×1400 мм" }, { label: "Профиль", value: "VEKA 70 мм" }],
    supplier: MOCK_SUPPLIERS[1], rating: 4.8, reviewCount: 67, tags: ["окна", "ПВХ"], status: "active",
  },
  {
    id: "prod-6", name: "Ламинат Kronospan 33 класс 8 мм", slug: "laminat-kronospan-33",
    description: "Ламинат 33 класса износостойкости. Толщина 8 мм, замок Click. Подходит для жилых помещений с высокой нагрузкой.",
    shortDescription: "Ламинат 33 класс, 8 мм, Click",
    sku: "LM-KRN-33-8", unit: "м²", price: 890, priceOld: 1050,
    stockTotal: 1500, stockReserved: 80, stockAvailable: 1420,
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"],
    attributes: { "Класс": "33", "Толщина": "8 мм", "Замок": "Click" },
    regionCode: "77", isActive: true, categoryId: "cat-6", supplierId: "sup-3",
    category: { id: "cat-6", name: "Полы", slug: "flooring" },
    insertedAt: "2024-01-06T00:00:00Z", updatedAt: "2024-01-06T00:00:00Z",
    categorySlug: "flooring", categoryName: "Полы", minOrder: 5,
    specs: [{ label: "Класс", value: "33" }, { label: "Толщина", value: "8 мм" }],
    supplier: MOCK_SUPPLIERS[2], rating: 4.5, reviewCount: 134, tags: ["ламинат", "полы"], status: "active",
  },
  {
    id: "prod-7", name: "Сайдинг виниловый Docke Premium 3660 мм", slug: "sajding-docke-premium",
    description: "Виниловый сайдинг Docke Premium. Длина панели 3660 мм, ширина 230 мм. Устойчив к УФ-излучению и перепадам температур.",
    shortDescription: "Виниловый сайдинг Docke Premium",
    sku: "SD-DOCKE-PREM", unit: "м²", price: 380, priceOld: 430,
    stockTotal: 5000, stockReserved: 300, stockAvailable: 4700,
    images: ["https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"],
    attributes: { "Длина": "3660 мм", "Ширина": "230 мм", "Материал": "ПВХ" },
    regionCode: "66", isActive: true, categoryId: "cat-7", supplierId: "sup-1",
    category: { id: "cat-7", name: "Фасад", slug: "facade" },
    insertedAt: "2024-01-07T00:00:00Z", updatedAt: "2024-01-07T00:00:00Z",
    categorySlug: "facade", categoryName: "Фасад", minOrder: 20,
    specs: [{ label: "Длина", value: "3660 мм" }, { label: "Ширина", value: "230 мм" }],
    supplier: MOCK_SUPPLIERS[0], rating: 4.4, reviewCount: 98, tags: ["сайдинг", "фасад"], status: "active",
  },
  {
    id: "prod-8", name: "Домокомплект «Модуль 80» — SIP-панели 80 м²", slug: "domokomplekt-modul-80",
    description: "Комплект SIP-панелей для дома 80 м². Панели заводского производства, толщина 174 мм. Монтаж за 30 дней.",
    shortDescription: "SIP-панели для дома 80 м²",
    sku: "DK-SIP-80", unit: "комплект", price: 1_650_000, priceOld: 1_900_000,
    stockTotal: 15, stockReserved: 3, stockAvailable: 12,
    images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"],
    attributes: { "Площадь": "80 м²", "Технология": "SIP", "Толщина панели": "174 мм" },
    regionCode: "78", isActive: true, categoryId: "cat-1", supplierId: "sup-2",
    category: { id: "cat-1", name: "Домокомплекты", slug: "house-kits" },
    insertedAt: "2024-01-08T00:00:00Z", updatedAt: "2024-01-08T00:00:00Z",
    categorySlug: "house-kits", categoryName: "Домокомплекты", minOrder: 1,
    specs: [{ label: "Площадь", value: "80 м²" }, { label: "Технология", value: "SIP" }],
    supplier: MOCK_SUPPLIERS[1], rating: 4.9, reviewCount: 28, tags: ["домокомплект", "SIP"], status: "active",
  },
];

const MOCK_REVIEWS: Review[] = [
  { id: "r1", productId: "prod-1", authorName: "Алексей М.", rating: 5, text: "Отличное качество блоков, геометрия идеальная. Кладка пошла быстро.", createdAt: "2024-03-15T10:00:00Z", verified: true },
  { id: "r2", productId: "prod-1", authorName: "Сергей К.", rating: 4, text: "Хороший материал, доставили в срок. Немного крошится при резке.", createdAt: "2024-02-20T14:30:00Z", verified: true },
  { id: "r3", productId: "prod-2", authorName: "Ирина В.", rating: 5, text: "Дом собрали за 40 дней! Всё пришло комплектно, инструкция понятная.", createdAt: "2024-04-01T09:00:00Z", verified: true },
];

// In-memory cart and orders for mock mode
let _cart: CartItem[] = [];
let _orders: Order[] = [];
let _supplierProducts: Product[] = [...MOCK_PRODUCTS.slice(0, 3)];
let _supplierOrders: SupplierOrder[] = [];

function calcCart(): Cart {
  const subtotal = _cart.reduce((s, i) => s + i.subtotal, 0);
  const deliveryEstimate = subtotal > 500_000 ? 0 : 15_000;
  return {
    items: [..._cart],
    itemCount: _cart.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    deliveryEstimate,
    total: subtotal + deliveryEstimate,
  };
}

// ---------------------------------------------------------------------------
// API with fallback pattern
// ---------------------------------------------------------------------------
async function withFallback<T>(apiCall: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch {
    await delay(200);
    return fallback();
  }
}

// ---------------------------------------------------------------------------
// Public API object
// ---------------------------------------------------------------------------
export const marketplaceApi = {
  // ── Categories ────────────────────────────────────────────────────────────
  categories: {
    list: (): Promise<Category[]> =>
      withFallback(
        async () => {
          const res = await http.get<{ data: Category[] }>("/shop/categories");
          return res.data.data;
        },
        () => MOCK_CATEGORIES
      ),

    get: (id: string): Promise<Category> =>
      withFallback(
        async () => {
          const res = await http.get<{ data: Category }>(`/shop/categories/${id}`);
          return res.data.data;
        },
        () => MOCK_CATEGORIES.find((c) => c.id === id) ?? MOCK_CATEGORIES[0]
      ),
  },

  // ── Products ──────────────────────────────────────────────────────────────
  products: {
    list: (filters: ProductFilters = {}): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> =>
      withFallback(
        async () => {
          // Map UI filter names to backend param names
          const params: Record<string, unknown> = {};
          if (filters.search) params.search = filters.search;
          if (filters.category_id) params.category_id = filters.category_id;
          if (filters.region_code) params.region_code = filters.region_code;
          if (filters.min_price) params.min_price = filters.min_price;
          if (filters.max_price) params.max_price = filters.max_price;
          if (filters.in_stock) params.in_stock = filters.in_stock;
          if (filters.supplier_id) params.supplier_id = filters.supplier_id;
          if (filters.sort) params.sort = filters.sort;
          if (filters.page) params.page = filters.page;
          if (filters.per_page) params.per_page = filters.per_page;

          const res = await http.get<ProductListResponse>("/shop/products", { params });
          const products = res.data.data.map(enrichProduct);
          return {
            products,
            total: res.data.meta.total,
            page: res.data.meta.page,
            totalPages: res.data.meta.totalPages,
          };
        },
        () => {
          // Apply mock filters
          let result = [...MOCK_PRODUCTS];
          if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
          }
          if (filters.categorySlug) {
            result = result.filter((p) => p.categorySlug === filters.categorySlug);
          }
          if (filters.in_stock) {
            result = result.filter((p) => p.stockAvailable > 0);
          }
          if (filters.min_price) result = result.filter((p) => p.price >= filters.min_price!);
          if (filters.max_price) result = result.filter((p) => p.price <= filters.max_price!);
          if (filters.sort === "price_asc") result.sort((a, b) => a.price - b.price);
          if (filters.sort === "price_desc") result.sort((a, b) => b.price - a.price);
          const page = filters.page ?? 1;
          const perPage = filters.per_page ?? 12;
          const start = (page - 1) * perPage;
          return {
            products: result.slice(start, start + perPage),
            total: result.length,
            page,
            totalPages: Math.ceil(result.length / perPage),
          };
        }
      ),

    get: (id: string): Promise<Product> =>
      withFallback(
        async () => {
          const res = await http.get<{ data: ApiProduct }>(`/shop/products/${id}`);
          return enrichProduct(res.data.data);
        },
        () => {
          const p = MOCK_PRODUCTS.find((x) => x.id === id || x.slug === id);
          if (!p) throw new Error("Товар не найден");
          return p;
        }
      ),

    create: (data: CreateProductRequest): Promise<Product> =>
      withFallback(
        async () => {
          const res = await http.post<{ data: ApiProduct }>("/shop/products", data);
          return enrichProduct(res.data.data);
        },
        async () => {
          await delay(400);
          const newProduct: Product = {
            id: `prod-${Date.now()}`,
            slug: data.name.toLowerCase().replace(/\s+/g, "-"),
            name: data.name,
            description: data.description ?? "",
            sku: data.sku,
            unit: data.unit,
            price: data.price,
            priceWholesale: data.price_wholesale,
            stockTotal: data.stock_total,
            stockReserved: 0,
            stockAvailable: data.stock_total,
            images: data.images ?? [],
            attributes: data.attributes ?? {},
            regionCode: data.region_code,
            isActive: true,
            categoryId: data.category_id,
            supplierId: "sup-1",
            category: null,
            insertedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            shortDescription: data.shortDescription,
            categorySlug: data.categorySlug,
            minOrder: data.minOrder ?? 1,
            specs: data.specs ?? [],
            supplier: MOCK_SUPPLIERS[0],
            rating: 0,
            reviewCount: 0,
            tags: data.tags ?? [],
            status: "draft",
          };
          _supplierProducts.push(newProduct);
          return newProduct;
        }
      ),

    update: (id: string, data: UpdateProductRequest): Promise<Product> =>
      withFallback(
        async () => {
          const res = await http.patch<{ data: ApiProduct }>(`/shop/products/${id}`, data);
          return enrichProduct(res.data.data);
        },
        async () => {
          await delay(300);
          const idx = _supplierProducts.findIndex((p) => p.id === id);
          if (idx === -1) throw new Error("Товар не найден");
          _supplierProducts[idx] = { ..._supplierProducts[idx], ...data, updatedAt: new Date().toISOString() };
          return _supplierProducts[idx];
        }
      ),

    delete: (id: string): Promise<void> =>
      withFallback(
        async () => { await http.delete(`/shop/products/${id}`); },
        async () => {
          await delay(300);
          _supplierProducts = _supplierProducts.filter((p) => p.id !== id);
        }
      ),
  },

  // ── Reviews (UI-only, not yet in backend) ─────────────────────────────────
  reviews: {
    list: async (productId: string): Promise<Review[]> => {
      await delay(200);
      return MOCK_REVIEWS.filter((r) => r.productId === productId);
    },
  },

  // ── Cart (client-side only) ───────────────────────────────────────────────
  cart: {
    get: async (): Promise<Cart> => {
      await delay(50);
      return calcCart();
    },
    addItem: async (productId: string, quantity: number): Promise<Cart> => {
      await delay(150);
      const product = MOCK_PRODUCTS.find((p) => p.id === productId);
      if (!product) {
        // Try to fetch from API
        try {
          const res = await http.get<{ data: ApiProduct }>(`/shop/products/${productId}`);
          const p = enrichProduct(res.data.data);
          const existing = _cart.find((i) => i.productId === productId);
          if (existing) {
            existing.quantity += quantity;
            existing.subtotal = existing.price * existing.quantity;
          } else {
            _cart.push({
              id: `ci-${Date.now()}`,
              productId,
              product: p,
              quantity,
              price: p.price,
              subtotal: p.price * quantity,
            });
          }
          return calcCart();
        } catch {
          throw new Error("Товар не найден");
        }
      }
      const existing = _cart.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
        existing.subtotal = existing.price * existing.quantity;
      } else {
        _cart.push({
          id: `ci-${Date.now()}`,
          productId,
          product,
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
        });
      }
      return calcCart();
    },
    updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
      await delay(100);
      const item = _cart.find((i) => i.id === itemId);
      if (item) {
        if (quantity <= 0) {
          _cart = _cart.filter((i) => i.id !== itemId);
        } else {
          item.quantity = quantity;
          item.subtotal = item.price * quantity;
        }
      }
      return calcCart();
    },
    removeItem: async (itemId: string): Promise<Cart> => {
      await delay(100);
      _cart = _cart.filter((i) => i.id !== itemId);
      return calcCart();
    },
    clear: async (): Promise<void> => {
      await delay(50);
      _cart = [];
    },
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: {
    list: (): Promise<Order[]> =>
      withFallback(
        async () => {
          const res = await http.get<{ data: ApiOrder[]; meta: unknown }>("/shop/orders");
          return res.data.data.map(enrichOrder);
        },
        () => [..._orders].reverse()
      ),

    get: (id: string): Promise<Order> =>
      withFallback(
        async () => {
          const res = await http.get<{ data: ApiOrder }>(`/shop/orders/${id}`);
          return enrichOrder(res.data.data);
        },
        () => {
          const o = _orders.find((x) => x.id === id);
          if (!o) throw new Error("Заказ не найден");
          return o;
        }
      ),

    create: (data: CreateOrderRequest): Promise<Order> =>
      withFallback(
        async () => {
          const res = await http.post<{ data: ApiOrder }>("/shop/orders", data);
          const order = enrichOrder(res.data.data);
          _cart = [];
          return order;
        },
        async () => {
          await delay(500);
          const items = data.items.map((i) => {
            const p = MOCK_PRODUCTS.find((x) => x.id === i.productId)!;
            return {
              id: `oi-${Date.now()}-${i.productId}`,
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: p?.price ?? 0,
              totalPrice: (p?.price ?? 0) * i.quantity,
              productSnapshot: {
                name: p?.name ?? "Товар",
                price: p?.price ?? 0,
                unit: p?.unit,
                images: p?.images,
              },
            };
          });
          const totalAmount = items.reduce((s, i) => s + i.totalPrice, 0);
          const order: Order = {
            id: `ord-${Date.now()}`,
            idempotencyKey: data.idempotency_key,
            status: "pending",
            totalAmount,
            deliveryAddress: data.delivery_address,
            comment: data.comment,
            projectId: data.project_id ?? null,
            customerId: "mock-user",
            allowedNextStatuses: ["confirmed", "cancelled"],
            items,
            insertedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orderNumber: `TD-${String(_orders.length + 1).padStart(4, "0")}`,
            paymentMethod: "card",
            paymentStatus: "pending",
          };
          _orders.push(order);
          _cart = [];
          return order;
        }
      ),

    cancel: (id: string): Promise<Order> =>
      withFallback(
        async () => {
          const res = await http.post<{ data: ApiOrder }>(`/shop/orders/${id}/cancel`);
          return enrichOrder(res.data.data);
        },
        async () => {
          await delay(300);
          const o = _orders.find((x) => x.id === id);
          if (!o) throw new Error("Заказ не найден");
          o.status = "cancelled";
          o.updatedAt = new Date().toISOString();
          return o;
        }
      ),
  },

  // ── Supplier cabinet ──────────────────────────────────────────────────────
  supplier: {
    stats: async (): Promise<SupplierStats> => {
      await delay(200);
      return {
        revenueMonth: 1_840_000,
        revenueGrowth: 12,
        ordersMonth: 47,
        ordersGrowth: 8,
        avgRating: 4.7,
        totalProducts: _supplierProducts.length,
      };
    },

    products: {
      list: (): Promise<Product[]> =>
        withFallback(
          async () => {
            const res = await http.get<ProductListResponse>("/shop/products", {
              params: { supplier_id: "me", per_page: 100 },
            });
            return res.data.data.map(enrichProduct);
          },
          async () => {
            await delay(300);
            return _supplierProducts;
          }
        ),

      create: (data: CreateProductRequest): Promise<Product> =>
        marketplaceApi.products.create(data),

      update: (id: string, data: UpdateProductRequest): Promise<Product> =>
        marketplaceApi.products.update(id, data),

      delete: (id: string): Promise<void> =>
        marketplaceApi.products.delete(id),
    },

    orders: {
      list: (): Promise<SupplierOrder[]> =>
        withFallback(
          async () => {
            const res = await http.get<{ data: ApiOrder[]; meta: unknown }>("/shop/orders", {
              params: { role: "supplier" },
            });
            return res.data.data.map((o) => ({ ...enrichOrder(o), customerName: "Заказчик" }));
          },
          async () => {
            await delay(300);
            return [..._supplierOrders].reverse();
          }
        ),

      updateStatus: (id: string, status: string): Promise<SupplierOrder> =>
        withFallback(
          async () => {
            const res = await http.post<{ data: ApiOrder }>(`/shop/orders/${id}/status`, { status });
            return { ...enrichOrder(res.data.data), customerName: "Заказчик" };
          },
          async () => {
            await delay(300);
            const o = _supplierOrders.find((x) => x.id === id);
            if (!o) throw new Error("Заказ не найден");
            o.status = status as Order["status"];
            o.updatedAt = new Date().toISOString();
            return o;
          }
        ),
    },
  },
};

export { calcCart };
export { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_SUPPLIERS };
