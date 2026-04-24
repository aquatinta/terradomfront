// ---------------------------------------------------------------------------
// marketplace.types.ts
// Types aligned with aquatinta/terradom backend (commit 32f948e)
// API: GET /api/shop/categories, /api/shop/products, /api/shop/orders
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  position: number;
  isActive: boolean;
  parentId?: string | null;
  children: CategoryChild[];
  insertedAt: string;
  updatedAt: string;
}

export interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  position: number;
}

export type CategorySlug =
  | "house-kits"
  | "blocks"
  | "insulation"
  | "roofing"
  | "windows-doors"
  | "flooring"
  | "facade"
  | "engineering"
  | string;

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export type ProductUnit = "м²" | "м³" | "шт" | "пог.м" | "кг" | "т" | "комплект";

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  unit: ProductUnit;
  price: number;
  priceWholesale?: number;
  stockTotal: number;
  stockReserved: number;
  stockAvailable: number;
  images: string[];
  attributes: Record<string, string>;
  regionCode?: string;
  isActive: boolean;
  categoryId: string;
  supplierId: string;
  category?: { id: string; name: string; slug: string } | null;
  insertedAt: string;
  updatedAt: string;
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

export type ProductStatus = "active" | "draft" | "out_of_stock" | "archived";

export interface Product extends ApiProduct {
  shortDescription?: string;
  categorySlug?: CategorySlug;
  categoryName?: string;
  priceOld?: number;
  minOrder?: number;
  technology?: string;
  region?: string;
  specs?: ProductSpec[];
  supplier?: SupplierInfo;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  status?: ProductStatus;
}

export interface ProductListResponse {
  data: ApiProduct[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  region_code?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  supplier_id?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  per_page?: number;
  categorySlug?: CategorySlug | "";
  technology?: string;
}

// ---------------------------------------------------------------------------
// Cart (client-side only)
// ---------------------------------------------------------------------------
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
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
  | "paid"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export interface ApiOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: {
    name: string;
    price: number;
    unit?: string;
    sku?: string;
    images?: string[];
  };
}

export interface DeliveryAddress {
  region: string;
  city: string;
  street: string;
  zip?: string;
  comment?: string;
}

export interface ApiOrder {
  id: string;
  idempotencyKey: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  comment?: string;
  projectId?: string | null;
  customerId: string;
  allowedNextStatuses: OrderStatus[];
  items: ApiOrderItem[];
  insertedAt: string;
  updatedAt: string;
}

export interface Order extends ApiOrder {
  orderNumber?: string;
  paymentMethod?: "card" | "escrow" | "invoice";
  paymentStatus?: "pending" | "paid" | "refunded";
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface CreateOrderRequest {
  idempotency_key: string;
  items: { productId: string; quantity: number }[];
  delivery_address: DeliveryAddress;
  comment?: string;
  project_id?: string;
}

// ---------------------------------------------------------------------------
// Supplier
// ---------------------------------------------------------------------------
export interface SupplierOrder extends ApiOrder {
  customerName?: string;
  orderNumber?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku?: string;
  unit: ProductUnit;
  price: number;
  price_wholesale?: number;
  stock_total: number;
  images?: string[];
  attributes?: Record<string, string>;
  region_code?: string;
  category_id: string;
  categorySlug?: CategorySlug;
  shortDescription?: string;
  priceOld?: number;
  minOrder?: number;
  technology?: string;
  regions?: string[];
  specs?: ProductSpec[];
  tags?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  is_active?: boolean;
  status?: ProductStatus;
}

// ---------------------------------------------------------------------------
// Reviews (UI only — not yet in backend)
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
// Supplier Stats (UI only — not yet in backend)
// ---------------------------------------------------------------------------
export interface SupplierStats {
  revenueMonth: number;
  revenueGrowth: number;
  ordersMonth: number;
  ordersGrowth: number;
  avgRating: number;
  totalProducts: number;
}
