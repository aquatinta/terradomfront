/**
 * Terradom Marketplace — TypeScript types
 * These types define the shape of the marketplace API (stub → real backend).
 * All shapes follow REST conventions: snake_case from backend → camelCase on frontend.
 *
 * Future backend endpoints:
 *   GET    /api/marketplace/products          → ProductListResponse
 *   GET    /api/marketplace/products/:id      → Product
 *   GET    /api/marketplace/categories        → Category[]
 *   POST   /api/marketplace/cart/items        → CartItem
 *   GET    /api/marketplace/cart              → Cart
 *   DELETE /api/marketplace/cart/items/:id    → void
 *   POST   /api/marketplace/orders            → Order
 *   GET    /api/marketplace/orders            → Order[]
 *   GET    /api/marketplace/orders/:id        → Order
 *   GET    /api/marketplace/supplier/products → Product[]
 *   POST   /api/marketplace/supplier/products → Product
 *   PATCH  /api/marketplace/supplier/products/:id → Product
 *   DELETE /api/marketplace/supplier/products/:id → void
 *   GET    /api/marketplace/supplier/orders   → SupplierOrder[]
 *   PATCH  /api/marketplace/supplier/orders/:id → SupplierOrder
 */

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export type CategorySlug =
  | "house-kits"
  | "blocks"
  | "roofing"
  | "windows-doors"
  | "insulation"
  | "facades"
  | "engineering"
  | "tools";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  icon: string;
  productCount: number;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export type ProductUnit = "м²" | "м³" | "шт" | "пог.м" | "кг" | "т" | "комплект";
export type ProductStatus = "active" | "draft" | "out_of_stock" | "archived";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
  unit?: string;
}

export interface SupplierInfo {
  id: string;
  name: string;
  logoUrl?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  regions: string[];
  deliveryDays: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categorySlug: CategorySlug;
  categoryName: string;
  images: ProductImage[];
  price: number;
  priceOld?: number;
  unit: ProductUnit;
  minOrder: number;
  inStock: boolean;
  stockQty?: number;
  technology?: string;
  region?: string;
  specs: ProductSpec[];
  supplier: SupplierInfo;
  rating: number;
  reviewCount: number;
  tags: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  categorySlug?: CategorySlug | "";
  region?: string;
  technology?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  page?: number;
  perPage?: number;
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number; // price at time of adding
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryEstimate?: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unit: ProductUnit;
  price: number;
  subtotal: number;
  supplierId: string;
  supplierName: string;
}

export interface DeliveryAddress {
  region: string;
  city: string;
  street: string;
  zip?: string;
  comment?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  subtotal: number;
  deliveryCost: number;
  total: number;
  paymentMethod: "card" | "escrow" | "invoice";
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  comment?: string;
}

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: "card" | "escrow" | "invoice";
  comment?: string;
}

// ---------------------------------------------------------------------------
// Supplier (B2B cabinet)
// ---------------------------------------------------------------------------
export interface SupplierOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  total: number;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  shortDescription: string;
  categorySlug: CategorySlug;
  price: number;
  priceOld?: number;
  unit: ProductUnit;
  minOrder: number;
  technology?: string;
  regions: string[];
  specs: ProductSpec[];
  tags: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: ProductStatus;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
  verified: boolean;
}

// ---------------------------------------------------------------------------
// Supplier Stats
// ---------------------------------------------------------------------------
export interface SupplierStats {
  revenueMonth: number;
  revenueGrowth: number;
  ordersMonth: number;
  ordersGrowth: number;
  avgRating: number;
  totalProducts: number;
}
