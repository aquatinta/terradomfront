/**
 * Terradom Marketplace API — stub implementation
 * Replace `stub.*` calls with real axios calls when backend is ready.
 * All stubs simulate realistic network latency (200–600ms).
 *
 * Design: Light marketplace cabinet — clean, professional, e-commerce grade.
 */

import type {
  Category,
  Product,
  ProductListResponse,
  ProductFilters,
  Cart,
  CartItem,
  Order,
  CreateOrderRequest,
  SupplierOrder,
  SupplierStats,
  CreateProductRequest,
  UpdateProductRequest,
  Review,
} from "./marketplace.types";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", slug: "house-kits", name: "Домокомплекты", icon: "🏠", productCount: 24 },
  { id: "cat-2", slug: "blocks", name: "Блоки и кирпич", icon: "🧱", productCount: 87 },
  { id: "cat-3", slug: "roofing", name: "Кровля", icon: "🏗️", productCount: 43 },
  { id: "cat-4", slug: "windows-doors", name: "Окна и двери", icon: "🪟", productCount: 61 },
  { id: "cat-5", slug: "insulation", name: "Утеплители", icon: "🌡️", productCount: 35 },
  { id: "cat-6", slug: "facades", name: "Фасады", icon: "🎨", productCount: 29 },
  { id: "cat-7", slug: "engineering", name: "Инженерия", icon: "⚙️", productCount: 52 },
  { id: "cat-8", slug: "tools", name: "Инструменты", icon: "🔧", productCount: 118 },
];

const MOCK_SUPPLIERS = [
  {
    id: "sup-1",
    name: "СтройМатериалы Про",
    logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop",
    rating: 4.8,
    reviewCount: 312,
    verified: true,
    regions: ["Московская область", "Тверская область"],
    deliveryDays: 3,
  },
  {
    id: "sup-2",
    name: "ЭкоДом Комплект",
    logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop",
    rating: 4.9,
    reviewCount: 187,
    verified: true,
    regions: ["Краснодарский край", "Ростовская область"],
    deliveryDays: 5,
  },
  {
    id: "sup-3",
    name: "Северный Блок",
    logoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop",
    rating: 4.6,
    reviewCount: 94,
    verified: true,
    regions: ["Ленинградская область", "Новгородская область"],
    deliveryDays: 7,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  // House Kits
  {
    id: "prod-1",
    slug: "ecodom-100",
    name: "Домокомплект ЭкоДом 100м²",
    description: "Полный комплект для строительства дома площадью 100 м² из газобетонных блоков D500. Включает все необходимые материалы: блоки, клей, арматуру, перемычки, плиты перекрытия. Проект разработан с учётом климатических условий средней полосы России.",
    shortDescription: "Полный комплект для дома 100 м² из газобетона D500",
    categoryId: "cat-1",
    categorySlug: "house-kits",
    categoryName: "Домокомплекты",
    images: [
      { id: "img-1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop", alt: "Дом из газобетона", isPrimary: true },
      { id: "img-2", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop", alt: "Интерьер", isPrimary: false },
      { id: "img-3", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Строительство", isPrimary: false },
    ],
    price: 1_850_000,
    priceOld: 2_100_000,
    unit: "комплект",
    minOrder: 1,
    inStock: true,
    stockQty: 8,
    technology: "Газобетон",
    region: "Московская область",
    specs: [
      { label: "Площадь", value: "100", unit: "м²" },
      { label: "Этажность", value: "1–2" },
      { label: "Марка блока", value: "D500 B3.5" },
      { label: "Толщина стен", value: "375", unit: "мм" },
      { label: "Срок монтажа", value: "45–60", unit: "дней" },
      { label: "Гарантия", value: "5", unit: "лет" },
    ],
    supplier: MOCK_SUPPLIERS[1],
    rating: 4.9,
    reviewCount: 47,
    tags: ["газобетон", "энергоэффективный", "под ключ"],
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-03-20T14:30:00Z",
  },
  {
    id: "prod-2",
    slug: "timber-frame-150",
    name: "Каркасный дом 150м² «Скандинавия»",
    description: "Домокомплект каркасного дома в скандинавском стиле. Утеплитель — базальтовая вата 200мм. Фасад — имитация бруса. Окна — двухкамерный стеклопакет. Полная заводская готовность панелей.",
    shortDescription: "Каркасный дом 150 м² в скандинавском стиле",
    categoryId: "cat-1",
    categorySlug: "house-kits",
    categoryName: "Домокомплекты",
    images: [
      { id: "img-4", url: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop", alt: "Каркасный дом", isPrimary: true },
      { id: "img-5", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop", alt: "Фасад", isPrimary: false },
    ],
    price: 2_450_000,
    unit: "комплект",
    minOrder: 1,
    inStock: true,
    stockQty: 3,
    technology: "Каркас",
    region: "Краснодарский край",
    specs: [
      { label: "Площадь", value: "150", unit: "м²" },
      { label: "Утеплитель", value: "Базальтовая вата 200мм" },
      { label: "Фасад", value: "Имитация бруса" },
      { label: "Срок монтажа", value: "30–45", unit: "дней" },
    ],
    supplier: MOCK_SUPPLIERS[1],
    rating: 4.7,
    reviewCount: 28,
    tags: ["каркас", "скандинавский", "быстрый монтаж"],
    status: "active",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-03-15T12:00:00Z",
  },
  // Blocks
  {
    id: "prod-3",
    slug: "gazobeton-d500-375",
    name: "Газобетонный блок D500 375мм",
    description: "Автоклавный газобетонный блок марки D500 класса прочности B3.5. Производство YTONG. Точные размеры, минимальные швы. Идеален для несущих стен.",
    shortDescription: "Газобетон D500 B3.5 YTONG, 375×250×625 мм",
    categoryId: "cat-2",
    categorySlug: "blocks",
    categoryName: "Блоки и кирпич",
    images: [
      { id: "img-6", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop", alt: "Газобетонные блоки", isPrimary: true },
    ],
    price: 5_800,
    unit: "м³",
    minOrder: 5,
    inStock: true,
    stockQty: 450,
    technology: "Газобетон",
    region: "Московская область",
    specs: [
      { label: "Марка", value: "D500 B3.5" },
      { label: "Размер", value: "375×250×625", unit: "мм" },
      { label: "Теплопроводность", value: "0.12", unit: "Вт/м·К" },
      { label: "Морозостойкость", value: "F100" },
      { label: "Вес блока", value: "18.5", unit: "кг" },
    ],
    supplier: MOCK_SUPPLIERS[0],
    rating: 4.8,
    reviewCount: 156,
    tags: ["газобетон", "YTONG", "несущие стены"],
    status: "active",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-03-18T09:00:00Z",
  },
  {
    id: "prod-4",
    slug: "keramzitobeton-block",
    name: "Керамзитобетонный блок 390×190×188",
    description: "Стеновой керамзитобетонный блок для строительства малоэтажных зданий. Хорошие теплоизоляционные свойства, высокая прочность.",
    shortDescription: "Керамзитобетонный блок 390×190×188 мм",
    categoryId: "cat-2",
    categorySlug: "blocks",
    categoryName: "Блоки и кирпич",
    images: [
      { id: "img-7", url: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=600&fit=crop", alt: "Блоки", isPrimary: true },
    ],
    price: 3_200,
    unit: "м³",
    minOrder: 3,
    inStock: true,
    stockQty: 280,
    specs: [
      { label: "Размер", value: "390×190×188", unit: "мм" },
      { label: "Плотность", value: "900–1100", unit: "кг/м³" },
      { label: "Прочность", value: "M50–M100" },
    ],
    supplier: MOCK_SUPPLIERS[2],
    rating: 4.5,
    reviewCount: 73,
    tags: ["керамзитобетон", "теплый", "экономичный"],
    status: "active",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-03-10T11:00:00Z",
  },
  // Roofing
  {
    id: "prod-5",
    slug: "metallocherepitsa-monterrey",
    name: "Металлочерепица Monterrey 0.5мм",
    description: "Металлочерепица с полимерным покрытием Polyester 25 мкм. Оцинкованная сталь 0.5 мм. Цвет RAL 3005 (вишнёвый). Гарантия на покрытие 15 лет.",
    shortDescription: "Металлочерепица Monterrey 0.5мм, RAL 3005",
    categoryId: "cat-3",
    categorySlug: "roofing",
    categoryName: "Кровля",
    images: [
      { id: "img-8", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Кровля", isPrimary: true },
    ],
    price: 420,
    unit: "м²",
    minOrder: 20,
    inStock: true,
    stockQty: 3500,
    specs: [
      { label: "Толщина стали", value: "0.5", unit: "мм" },
      { label: "Покрытие", value: "Polyester 25 мкм" },
      { label: "Ширина листа", value: "1180", unit: "мм" },
      { label: "Гарантия", value: "15", unit: "лет" },
    ],
    supplier: MOCK_SUPPLIERS[0],
    rating: 4.7,
    reviewCount: 89,
    tags: ["металлочерепица", "кровля", "Monterrey"],
    status: "active",
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-03-12T10:00:00Z",
  },
  // Windows & Doors
  {
    id: "prod-6",
    slug: "okno-pvh-1200x1400",
    name: "Окно ПВХ 1200×1400 двухкамерное",
    description: "Пластиковое окно из профиля REHAU Blitz 60мм. Двухкамерный стеклопакет 4-16-4-16-4. Фурнитура MACO. Монтажная ширина 60 мм. Белый цвет.",
    shortDescription: "Окно ПВХ REHAU 1200×1400, двухкамерный стеклопакет",
    categoryId: "cat-4",
    categorySlug: "windows-doors",
    categoryName: "Окна и двери",
    images: [
      { id: "img-9", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Окна", isPrimary: true },
    ],
    price: 18_500,
    unit: "шт",
    minOrder: 1,
    inStock: true,
    stockQty: 45,
    specs: [
      { label: "Размер", value: "1200×1400", unit: "мм" },
      { label: "Профиль", value: "REHAU Blitz 60мм" },
      { label: "Стеклопакет", value: "4-16-4-16-4" },
      { label: "Сопротивление теплопередаче", value: "0.55", unit: "м²·К/Вт" },
    ],
    supplier: MOCK_SUPPLIERS[0],
    rating: 4.6,
    reviewCount: 42,
    tags: ["окна", "ПВХ", "REHAU"],
    status: "active",
    createdAt: "2024-02-05T10:00:00Z",
    updatedAt: "2024-03-14T10:00:00Z",
  },
  // Insulation
  {
    id: "prod-7",
    slug: "rockwool-facade-100",
    name: "Утеплитель ROCKWOOL Фасад Баттс 100мм",
    description: "Жёсткая плита из каменной ваты для утепления вентилируемых фасадов. Не горит, не впитывает влагу. Плотность 80 кг/м³.",
    shortDescription: "Каменная вата ROCKWOOL Фасад Баттс 100мм, 80 кг/м³",
    categoryId: "cat-5",
    categorySlug: "insulation",
    categoryName: "Утеплители",
    images: [
      { id: "img-10", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop", alt: "Утеплитель", isPrimary: true },
    ],
    price: 1_850,
    unit: "м²",
    minOrder: 10,
    inStock: true,
    stockQty: 1200,
    specs: [
      { label: "Толщина", value: "100", unit: "мм" },
      { label: "Плотность", value: "80", unit: "кг/м³" },
      { label: "Теплопроводность", value: "0.036", unit: "Вт/м·К" },
      { label: "Горючесть", value: "НГ (не горит)" },
    ],
    supplier: MOCK_SUPPLIERS[0],
    rating: 4.9,
    reviewCount: 201,
    tags: ["утеплитель", "ROCKWOOL", "фасад", "негорючий"],
    status: "active",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-03-16T10:00:00Z",
  },
  {
    id: "prod-8",
    slug: "penoplex-100",
    name: "Пеноплэкс Комфорт 100мм",
    description: "Экструдированный пенополистирол для утепления фундаментов, полов, стен. Водостойкий, прочный на сжатие.",
    shortDescription: "Пеноплэкс Комфорт 100мм, λ=0.030 Вт/м·К",
    categoryId: "cat-5",
    categorySlug: "insulation",
    categoryName: "Утеплители",
    images: [
      { id: "img-11", url: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=600&fit=crop", alt: "Пеноплэкс", isPrimary: true },
    ],
    price: 2_100,
    unit: "м²",
    minOrder: 5,
    inStock: true,
    stockQty: 800,
    specs: [
      { label: "Толщина", value: "100", unit: "мм" },
      { label: "Теплопроводность", value: "0.030", unit: "Вт/м·К" },
      { label: "Прочность на сжатие", value: "≥0.2", unit: "МПа" },
    ],
    supplier: MOCK_SUPPLIERS[2],
    rating: 4.7,
    reviewCount: 134,
    tags: ["пеноплэкс", "ЭППС", "фундамент"],
    status: "active",
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-03-11T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Cart state (in-memory, replace with localStorage/backend)
// ---------------------------------------------------------------------------
let _cart: CartItem[] = [];

function calcCart(): Cart {
  const subtotal = _cart.reduce((s, i) => s + i.subtotal, 0);
  const deliveryEstimate = subtotal > 0 ? (subtotal > 500_000 ? 0 : 15_000) : 0;
  return {
    items: _cart,
    itemCount: _cart.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    deliveryEstimate,
    total: subtotal + deliveryEstimate,
  };
}

// ---------------------------------------------------------------------------
// Mock orders
// ---------------------------------------------------------------------------
let _orders: Order[] = [
  {
    id: "ord-1",
    orderNumber: "TD-2024-001",
    status: "delivered",
    items: [
      {
        id: "oi-1",
        productId: "prod-3",
        productName: "Газобетонный блок D500 375мм",
        productImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop",
        quantity: 25,
        unit: "м³",
        price: 5_800,
        subtotal: 145_000,
        supplierId: "sup-1",
        supplierName: "СтройМатериалы Про",
      },
    ],
    deliveryAddress: { region: "Московская область", city: "Дмитров", street: "ул. Строителей 12" },
    subtotal: 145_000,
    deliveryCost: 15_000,
    total: 160_000,
    paymentMethod: "card",
    paymentStatus: "paid",
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-02-20T14:00:00Z",
    estimatedDelivery: "2024-02-18",
    trackingNumber: "RU123456789",
  },
  {
    id: "ord-2",
    orderNumber: "TD-2024-002",
    status: "processing",
    items: [
      {
        id: "oi-2",
        productId: "prod-5",
        productName: "Металлочерепица Monterrey 0.5мм",
        productImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop",
        quantity: 120,
        unit: "м²",
        price: 420,
        subtotal: 50_400,
        supplierId: "sup-1",
        supplierName: "СтройМатериалы Про",
      },
    ],
    deliveryAddress: { region: "Московская область", city: "Клин", street: "пр. Ленина 5" },
    subtotal: 50_400,
    deliveryCost: 8_000,
    total: 58_400,
    paymentMethod: "escrow",
    paymentStatus: "paid",
    createdAt: "2024-03-15T10:00:00Z",
    updatedAt: "2024-03-18T09:00:00Z",
    estimatedDelivery: "2024-03-25",
  },
];

// Supplier orders mock
let _supplierOrders: SupplierOrder[] = [
  {
    id: "sord-1",
    orderNumber: "TD-2024-001",
    status: "delivered",
    customerName: "Иван Петров",
    items: _orders[0].items,
    deliveryAddress: _orders[0].deliveryAddress,
    total: _orders[0].total,
    createdAt: _orders[0].createdAt,
    updatedAt: _orders[0].updatedAt,
    estimatedDelivery: _orders[0].estimatedDelivery,
  },
  {
    id: "sord-2",
    orderNumber: "TD-2024-002",
    status: "processing",
    customerName: "Алексей Сидоров",
    items: _orders[1].items,
    deliveryAddress: _orders[1].deliveryAddress,
    total: _orders[1].total,
    createdAt: _orders[1].createdAt,
    updatedAt: _orders[1].updatedAt,
    estimatedDelivery: _orders[1].estimatedDelivery,
  },
];

// Supplier's own products
let _supplierProducts: Product[] = [MOCK_PRODUCTS[2], MOCK_PRODUCTS[4], MOCK_PRODUCTS[6]];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function filterProducts(products: Product[], filters: ProductFilters): ProductListResponse {
  let result = [...products];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (filters.categorySlug) {
    result = result.filter((p) => p.categorySlug === filters.categorySlug);
  }
  if (filters.region) {
    result = result.filter((p) => !p.region || p.region === filters.region);
  }
  if (filters.technology) {
    result = result.filter((p) => !p.technology || p.technology === filters.technology);
  }
  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.inStock) {
    result = result.filter((p) => p.inStock);
  }
  // Sort
  if (filters.sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
  else if (filters.sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
  else if (filters.sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
  else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 12;
  const total = result.length;
  const paginated = result.slice((page - 1) * perPage, page * perPage);
  return { products: paginated, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

// ---------------------------------------------------------------------------
// Marketplace API
// ---------------------------------------------------------------------------
export const marketplaceApi = {
  // ── Categories ────────────────────────────────────────────────────────────
  categories: {
    list: async (): Promise<Category[]> => {
      await delay(200);
      return MOCK_CATEGORIES;
    },
  },

  // ── Products ──────────────────────────────────────────────────────────────
  products: {
    list: async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
      await delay(350);
      return filterProducts(MOCK_PRODUCTS, filters);
    },
    get: async (id: string): Promise<Product> => {
      await delay(200);
      const p = MOCK_PRODUCTS.find((x) => x.id === id || x.slug === id);
      if (!p) throw new Error("Товар не найден");
      return p;
    },
    reviews: async (_id: string): Promise<Review[]> => {
      await delay(200);
      return [
        { id: "r1", productId: _id, authorName: "Дмитрий К.", rating: 5, text: "Отличное качество, доставили вовремя. Блоки ровные, геометрия точная.", createdAt: "2024-03-01T10:00:00Z", verified: true },
        { id: "r2", productId: _id, authorName: "Анна М.", rating: 4, text: "Хороший материал, но упаковка немного повреждена при доставке.", createdAt: "2024-02-20T10:00:00Z", verified: true },
        { id: "r3", productId: _id, authorName: "Сергей П.", rating: 5, text: "Брал уже второй раз. Качество стабильное, рекомендую.", createdAt: "2024-02-10T10:00:00Z", verified: false },
      ];
    },
  },

  // ── Cart ──────────────────────────────────────────────────────────────────
  cart: {
    get: async (): Promise<Cart> => {
      await delay(100);
      return calcCart();
    },
    addItem: async (productId: string, quantity: number): Promise<Cart> => {
      await delay(200);
      const product = MOCK_PRODUCTS.find((p) => p.id === productId);
      if (!product) throw new Error("Товар не найден");
      const existing = _cart.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
        existing.subtotal = existing.quantity * existing.price;
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
      await delay(150);
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
      await delay(150);
      _cart = _cart.filter((i) => i.id !== itemId);
      return calcCart();
    },
    clear: async (): Promise<void> => {
      await delay(100);
      _cart = [];
    },
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: {
    list: async (): Promise<Order[]> => {
      await delay(300);
      return [..._orders].reverse();
    },
    get: async (id: string): Promise<Order> => {
      await delay(200);
      const o = _orders.find((x) => x.id === id);
      if (!o) throw new Error("Заказ не найден");
      return o;
    },
    create: async (data: CreateOrderRequest): Promise<Order> => {
      await delay(500);
      const items = data.items.map((i) => {
        const p = MOCK_PRODUCTS.find((x) => x.id === i.productId)!;
        return {
          id: `oi-${Date.now()}-${i.productId}`,
          productId: i.productId,
          productName: p.name,
          productImage: p.images[0]?.url,
          quantity: i.quantity,
          unit: p.unit,
          price: p.price,
          subtotal: p.price * i.quantity,
          supplierId: p.supplier.id,
          supplierName: p.supplier.name,
        };
      });
      const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
      const deliveryCost = subtotal > 500_000 ? 0 : 15_000;
      const order: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `TD-2024-${String(_orders.length + 1).padStart(3, "0")}`,
        status: "pending",
        items,
        deliveryAddress: data.deliveryAddress,
        subtotal,
        deliveryCost,
        total: subtotal + deliveryCost,
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comment: data.comment,
      };
      _orders.push(order);
      _cart = [];
      return order;
    },
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
      list: async (): Promise<Product[]> => {
        await delay(300);
        return _supplierProducts;
      },
      create: async (data: CreateProductRequest): Promise<Product> => {
        await delay(400);
        const newProduct: Product = {
          id: `prod-${Date.now()}`,
          slug: data.name.toLowerCase().replace(/\s+/g, "-"),
          ...data,
          images: [],
          inStock: true,
          supplier: MOCK_SUPPLIERS[0],
          rating: 0,
          reviewCount: 0,
          status: "draft",
          categoryId: `cat-${data.categorySlug}`,
          categoryName: MOCK_CATEGORIES.find((c) => c.slug === data.categorySlug)?.name ?? "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        _supplierProducts.push(newProduct);
        return newProduct;
      },
      update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
        await delay(300);
        const idx = _supplierProducts.findIndex((p) => p.id === id);
        if (idx === -1) throw new Error("Товар не найден");
        _supplierProducts[idx] = { ..._supplierProducts[idx], ...data, updatedAt: new Date().toISOString() };
        return _supplierProducts[idx];
      },
      delete: async (id: string): Promise<void> => {
        await delay(300);
        _supplierProducts = _supplierProducts.filter((p) => p.id !== id);
      },
    },
    orders: {
      list: async (): Promise<SupplierOrder[]> => {
        await delay(300);
        return [..._supplierOrders].reverse();
      },
      updateStatus: async (id: string, status: SupplierOrder["status"]): Promise<SupplierOrder> => {
        await delay(300);
        const o = _supplierOrders.find((x) => x.id === id);
        if (!o) throw new Error("Заказ не найден");
        o.status = status;
        o.updatedAt = new Date().toISOString();
        return o;
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Cart store (React context-friendly)
// ---------------------------------------------------------------------------
export { calcCart };
