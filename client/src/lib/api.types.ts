/**
 * Terradom API — TypeScript types
 * All shapes mirror the camelCase JSON returned by the Elixir/Phoenix backend.
 * Source: aquatinta/terradom router.ex + JSON serializers
 */

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterCustomerRequest {
  phone: string;
  password: string;
  role?: "customer";
  firstName?: string;
  lastName?: string;
}

export interface RegisterPartnerRequest {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  inn: string;
  regions: string[];
  specializations: string[];
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export type UserRole = "customer" | "partner" | "supplier" | "admin";

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  inn: string | null;
  regions: string[];
  specializations: string[];
  activeDealCount?: number;
  insertedAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  inn?: string;
  regions?: string[];
  specializations?: string[];
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export type ProjectStatus =
  | "draft"
  | "assembled"
  | "calculated"
  | "request_sent"
  | "offers_received"
  | "executor_selected"
  | "deal_started";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  geometry: Record<string, unknown> | null;
  estimate: Record<string, unknown> | null;
  syncVersion: number;
  docsUnlocked: boolean;
  userId: string;
  insertedAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name?: string;
  geometry?: Record<string, unknown>;
  estimate?: Record<string, unknown>;
}

export interface UpdateProjectRequest {
  name?: string;
  syncVersion: number;
}

export interface UpdateGeometryRequest {
  geometry: Record<string, unknown>;
  syncVersion: number;
}

export interface UpdateEstimateRequest {
  estimate: Record<string, unknown>;
  syncVersion: number;
}

export interface SubmitProjectRequest {
  syncVersion: number;
}

// ---------------------------------------------------------------------------
// Offers
// ---------------------------------------------------------------------------

export type OfferStatus = "pending" | "accepted" | "rejected";

export interface OfferPartner {
  id: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  inn: string | null;
}

export interface Offer {
  id: string;
  projectId: string;
  partnerId: string;
  totalPrice: number;
  status: OfferStatus;
  safeDealSupported: boolean;
  comment: string | null;
  partner?: OfferPartner;
  insertedAt: string;
  updatedAt: string;
}

export interface CreateOfferRequest {
  projectId: string;
  totalPrice: number;
  safeDealSupported?: boolean;
  comment?: string;
}

export interface AcceptOfferResponse {
  offer: Offer;
  deal: Deal;
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------

export type DealStatus =
  | "draft"
  | "pending_payment"
  | "in_progress"
  | "completed"
  | "dispute";

export type FinancingType = "cash" | "mortgage" | "bnpl";

export type MilestoneStatus =
  | "pending"
  | "payment_pending"
  | "paid_held"
  | "completed"
  | "refunded";

export interface Milestone {
  id: string;
  dealId: string;
  title: string;
  description: string | null;
  amount: string; // Decimal as string from backend
  status: MilestoneStatus;
  orderIndex: number;
  yookassaPaymentId?: string | null;
  paymentUrl?: string | null;
  heldAt?: string | null;
  completedAt?: string | null;
  refundedAt?: string | null;
  insertedAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  offerId: string | null;
  customerId: string;
  partnerId: string;
  status: DealStatus;
  financingType: FinancingType;
  escrowAccount: string | null;
  milestones: Milestone[];
  insertedAt: string;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  amount: number;
  orderIndex?: number;
}

export interface AcceptMilestoneRequest {
  status: "paid" | "completed";
}

// ---------------------------------------------------------------------------
// Tenders
// ---------------------------------------------------------------------------

export type TenderStatus = "draft" | "open" | "closed" | "awarded";
export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface TenderBid {
  id: string;
  tenderId: string;
  partnerId: string;
  status: BidStatus;
  totalPrice: string;
  comment: string | null;
  timelineDays: number | null;
  suspiciousLow: boolean;
  insertedAt: string;
  updatedAt: string;
}

export interface Tender {
  id: string;
  projectId: string;
  customerId: string;
  title: string;
  description: string | null;
  status: TenderStatus;
  budgetMin: string | null;
  budgetMax: string | null;
  region: string;
  technology: string | null;
  deadline: string | null;
  winningBidId: string | null;
  bidsCount: number;
  bids?: TenderBid[];
  insertedAt: string;
  updatedAt: string;
}

export interface CreateTenderRequest {
  title: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  region: string;
  technology?: string;
  deadline?: string;
}

export interface CreateBidRequest {
  totalPrice: number;
  comment?: string;
  timelineDays?: number;
}

// ---------------------------------------------------------------------------
// Payments & Disputes
// ---------------------------------------------------------------------------

export interface InitiatePaymentResponse {
  data: {
    paymentUrl: string;
    milestoneId: string;
    status: string;
  };
}

export type DisputeStatus = "open" | "under_review" | "resolved";
export type DisputeResolution = "full_refund" | "partial_refund" | "release";

export interface Dispute {
  id: string;
  dealId: string;
  milestoneId: string | null;
  openedById: string;
  status: DisputeStatus;
  reason: string;
  adminNote: string | null;
  resolution: DisputeResolution | null;
  refundAmount: string | null;
  resolvedById: string | null;
  resolvedAt: string | null;
  insertedAt: string;
  updatedAt: string;
}

export interface OpenDisputeRequest {
  milestoneId: string;
  reason: string;
}

export interface ResolveDisputeRequest {
  resolution: DisputeResolution;
  refundAmount?: string;
  adminNote?: string;
}

// ---------------------------------------------------------------------------
// Price Catalog
// ---------------------------------------------------------------------------

export interface PriceEntry {
  id: string;
  technologyCode: string;
  regionCode: string;
  blockPerM3: string;
  description: string | null;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

export interface SyncResponse {
  projects: Project[];
  offers: Offer[];
  deals: Deal[];
  milestones: Milestone[];
  serverTime: string;
}

// ---------------------------------------------------------------------------
// Generic API wrappers
// ---------------------------------------------------------------------------

/** Standard list response with `content` wrapper (mobile-compatible) */
export interface ContentList<T> {
  content: T[];
}

/** Standard list response with `data` wrapper (tenders) */
export interface DataList<T> {
  data: T[];
}

/** Single item wrapped in `data` (tenders) */
export interface DataItem<T> {
  data: T;
}

/** API error shape */
export interface ApiError {
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}
