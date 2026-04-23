/**
 * Terradom API client
 *
 * Design philosophy:
 * - Single axios instance shared across the entire app
 * - Request interceptor: attaches Bearer token to every request
 * - Response interceptor: on 401, silently refreshes tokens and retries once
 * - On refresh failure: clears tokens and redirects to /login
 * - All methods are typed against api.types.ts
 *
 * Usage:
 *   import { api } from "@/lib/api";
 *   const { data } = await api.auth.login({ phone: "+79001234567", password: "..." });
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearAllTokens,
  setCachedUser,
} from "./token";
import type {
  AuthResponse,
  LoginRequest,
  RegisterCustomerRequest,
  RegisterPartnerRequest,
  RefreshRequest,
  LogoutRequest,
  User,
  UpdateProfileRequest,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateGeometryRequest,
  UpdateEstimateRequest,
  SubmitProjectRequest,
  Offer,
  CreateOfferRequest,
  AcceptOfferResponse,
  Deal,
  CreateMilestoneRequest,
  Milestone,
  AcceptMilestoneRequest,
  Tender,
  TenderBid,
  CreateTenderRequest,
  CreateBidRequest,
  InitiatePaymentResponse,
  Dispute,
  OpenDisputeRequest,
  ResolveDisputeRequest,
  PriceEntry,
  SyncResponse,
  ContentList,
  DataList,
  DataItem,
} from "./api.types";

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach access token
// ---------------------------------------------------------------------------

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Token refresh queue — prevents multiple simultaneous refresh calls
// ---------------------------------------------------------------------------

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 with token refresh
// ---------------------------------------------------------------------------

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints to avoid infinite loops
    const url = originalRequest.url ?? "";
    if (url.includes("/auth/login") || url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      handleLogout();
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${newToken}` };
          }
          originalRequest._retry = true;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    // Start refresh
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const { data } = await axiosInstance.post<AuthResponse>(
        "/auth/refresh",
        { refreshToken } satisfies RefreshRequest,
      );

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      if (data.user) setCachedUser(data.user);

      // Notify all queued requests
      onRefreshed(newAccessToken);

      // Retry original request with new token
      if (originalRequest.headers) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      } else {
        originalRequest.headers = {
          Authorization: `Bearer ${newAccessToken}`,
        };
      }

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear session and redirect to login
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ---------------------------------------------------------------------------
// Logout helper (clears tokens + redirects)
// ---------------------------------------------------------------------------

function handleLogout() {
  clearAllTokens();
  // Use window.location to avoid circular dependency with router
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// ---------------------------------------------------------------------------
// API modules
// ---------------------------------------------------------------------------

export const api = {
  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------
  auth: {
    /** Login with phone + password. Stores tokens automatically. */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
      const res = await axiosInstance.post<AuthResponse>("/auth/login", data);
      setAccessToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setCachedUser(res.data.user);
      return res.data;
    },

    /** Register a new customer account. */
    registerCustomer: async (
      data: RegisterCustomerRequest,
    ): Promise<AuthResponse> => {
      const res = await axiosInstance.post<AuthResponse>(
        "/auth/register",
        data,
      );
      setAccessToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setCachedUser(res.data.user);
      return res.data;
    },

    /**
     * Register a new partner/supplier account.
     * Phone must be in E.164 format: +79001234567
     */
    registerPartner: async (
      data: RegisterPartnerRequest,
    ): Promise<AuthResponse> => {
      // Normalize phone to E.164 before sending
      const normalized = {
        ...data,
        phone: normalizePhone(data.phone),
      };
      const res = await axiosInstance.post<AuthResponse>(
        "/auth/register/partner",
        normalized,
      );
      setAccessToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setCachedUser(res.data.user);
      return res.data;
    },

    /** Refresh access token using stored refresh token. */
    refresh: async (): Promise<AuthResponse> => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");
      const res = await axiosInstance.post<AuthResponse>("/auth/refresh", {
        refreshToken,
      } satisfies RefreshRequest);
      setAccessToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setCachedUser(res.data.user);
      return res.data;
    },

    /** Logout — invalidates refresh token on the server. */
    logout: async (): Promise<void> => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          await axiosInstance.delete("/auth/logout", {
            data: { refreshToken } satisfies LogoutRequest,
          });
        } catch {
          // Best-effort — clear locally even if server call fails
        }
      }
      clearAllTokens();
    },
  },

  // -------------------------------------------------------------------------
  // User profile
  // -------------------------------------------------------------------------
  user: {
    /** Get current user profile. */
    me: async (): Promise<User> => {
      const res = await axiosInstance.get<{ user: User }>("/user/me");
      setCachedUser(res.data.user);
      return res.data.user;
    },

    /** Update current user profile. */
    update: async (data: UpdateProfileRequest): Promise<User> => {
      const res = await axiosInstance.patch<{ user: User }>("/user/me", data);
      setCachedUser(res.data.user);
      return res.data.user;
    },
  },

  // -------------------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------------------
  projects: {
    /** List projects (customer: own; partner: published). */
    list: async (): Promise<Project[]> => {
      const res = await axiosInstance.get<ContentList<Project>>("/projects");
      return res.data.content;
    },

    /** Get a single project by ID. */
    get: async (id: string): Promise<Project> => {
      const res = await axiosInstance.get<{ project: Project }>(
        `/projects/${id}`,
      );
      return res.data.project;
    },

    /** Create a new project (customer only). */
    create: async (data: CreateProjectRequest = {}): Promise<Project> => {
      const res = await axiosInstance.post<{ project: Project }>(
        "/projects",
        data,
      );
      return res.data.project;
    },

    /** Update project metadata (name). Requires syncVersion for optimistic lock. */
    update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
      const res = await axiosInstance.patch<{ project: Project }>(
        `/projects/${id}`,
        data,
      );
      return res.data.project;
    },

    /** Replace project geometry. Requires syncVersion. */
    updateGeometry: async (
      id: string,
      data: UpdateGeometryRequest,
    ): Promise<Project> => {
      const res = await axiosInstance.put<{ project: Project }>(
        `/projects/${id}/geometry`,
        data,
      );
      return res.data.project;
    },

    /** Replace project estimate. Requires syncVersion. */
    updateEstimate: async (
      id: string,
      data: UpdateEstimateRequest,
    ): Promise<Project> => {
      const res = await axiosInstance.put<{ project: Project }>(
        `/projects/${id}/estimate`,
        data,
      );
      return res.data.project;
    },

    /**
     * Publish a project (submit for offers).
     * Requires geometry to be present. Uses syncVersion for optimistic lock.
     * Returns 409 Conflict if syncVersion is stale.
     */
    submit: async (
      id: string,
      data: SubmitProjectRequest,
    ): Promise<Project> => {
      const res = await axiosInstance.post<{ project: Project }>(
        `/projects/${id}/submit`,
        data,
      );
      return res.data.project;
    },
  },

  // -------------------------------------------------------------------------
  // Offers
  // -------------------------------------------------------------------------
  offers: {
    /** List offers for a specific project (GET /projects/:id/offers). */
    listByProject: async (projectId: string): Promise<Offer[]> => {
      const res = await axiosInstance.get<ContentList<Offer>>(`/projects/${projectId}/offers`);
      return res.data.content ?? [];
    },

    /** List offers (customer: on own projects; partner: own offers). */
    list: async (): Promise<Offer[]> => {
      const res = await axiosInstance.get<ContentList<Offer>>("/offers");
      return res.data.content;
    },

    /** Get a single offer. */
    get: async (id: string): Promise<Offer> => {
      const res = await axiosInstance.get<{ offer: Offer }>(`/offers/${id}`);
      return res.data.offer;
    },

    /** Create an offer for a project (partner only). */
    create: async (data: CreateOfferRequest): Promise<Offer> => {
      const res = await axiosInstance.post<{ offer: Offer }>("/offers", data);
      return res.data.offer;
    },

    /**
     * Accept an offer (customer only).
     * Atomically: accepts offer, rejects others, creates Deal, updates project status.
     */
    accept: async (id: string): Promise<AcceptOfferResponse> => {
      const res = await axiosInstance.post<AcceptOfferResponse>(
        `/offers/${id}/accept`,
      );
      return res.data;
    },

    /** Reject an offer (customer only). */
    reject: async (id: string): Promise<Offer> => {
      const res = await axiosInstance.post<{ offer: Offer }>(
        `/offers/${id}/reject`,
      );
      return res.data.offer;
    },
  },

  // -------------------------------------------------------------------------
  // Deals
  // -------------------------------------------------------------------------
  deals: {
    /** List deals for current user (as customer or partner). */
    list: async (): Promise<Deal[]> => {
      const res = await axiosInstance.get<ContentList<Deal>>("/deals");
      return res.data.content;
    },

    /** Get a single deal with milestones. */
    get: async (id: string): Promise<Deal> => {
      const res = await axiosInstance.get<{ deal: Deal }>(`/deals/${id}`);
      return res.data.deal;
    },

    /** Create a milestone for a deal (partner/executor only). */
    createMilestone: async (
      dealId: string,
      data: CreateMilestoneRequest,
    ): Promise<Deal> => {
      const res = await axiosInstance.post<{ deal: Deal }>(
        `/deals/${dealId}/milestones`,
        data,
      );
      return res.data.deal;
    },

    /** Open a dispute for a milestone in a deal. */
    openDispute: async (
      dealId: string,
      data: OpenDisputeRequest,
    ): Promise<Dispute> => {
      const res = await axiosInstance.post<{ dispute: Dispute }>(
        `/deals/${dealId}/disputes`,
        data,
      );
      return res.data.dispute;
    },
  },

  // -------------------------------------------------------------------------
  // Milestones
  // -------------------------------------------------------------------------
  milestones: {
    /**
     * Accept / advance a milestone (customer only).
     * pending → paid | paid_held → completed
     */
    accept: async (
      id: string,
      data: AcceptMilestoneRequest,
    ): Promise<Milestone> => {
      const res = await axiosInstance.post<{ milestone: Milestone }>(
        `/milestones/${id}/accept`,
        data,
      );
      return res.data.milestone;
    },

    /**
     * Initiate escrow payment for a milestone (customer only).
     * Returns a YooKassa payment URL. Open in new tab.
     */
    initiatePayment: async (id: string): Promise<InitiatePaymentResponse> => {
      const res =
        await axiosInstance.post<InitiatePaymentResponse>(
          `/milestones/${id}/pay`,
        );
      return res.data;
    },

    /**
     * Capture held payment — releases funds to partner (customer only).
     * Milestone must be in paid_held status.
     */
    capturePayment: async (id: string): Promise<Milestone> => {
      const res = await axiosInstance.post<{ milestone: Milestone }>(
        `/milestones/${id}/capture`,
      );
      return res.data.milestone;
    },
  },

  // -------------------------------------------------------------------------
  // Tenders
  // -------------------------------------------------------------------------
  tenders: {
    /** List open tenders with optional filters. */
    list: async (filters?: {
      region?: string;
      technology?: string;
    }): Promise<Tender[]> => {
      const res = await axiosInstance.get<DataList<Tender>>("/tenders", {
        params: filters,
      });
      return res.data.data;
    },

    /** Get a single tender (with bids for customer; own bid for partner). */
    get: async (id: string): Promise<Tender> => {
      const res = await axiosInstance.get<DataItem<Tender>>(`/tenders/${id}`);
      return res.data.data;
    },

    /** Create a tender for a project (customer only). */
    create: async (data: CreateTenderRequest): Promise<Tender> => {
      const res = await axiosInstance.post<DataItem<Tender>>("/tenders", data);
      return res.data.data;
    },

    /** Submit a bid for a tender (partner only). */
    submitBid: async (
      tenderId: string,
      data: CreateBidRequest,
    ): Promise<TenderBid> => {
      const res = await axiosInstance.post<DataItem<TenderBid>>(
        `/tenders/${tenderId}/bids`,
        data,
      );
      return res.data.data;
    },

    /**
     * Award a tender to a winning bid (customer only).
     * Atomically creates a Deal from the winning bid.
     */
    award: async (
      tenderId: string,
      bidId: string,
    ): Promise<{ tender: Tender; deal: Deal; winningBid: TenderBid }> => {
      const res = await axiosInstance.post<
        DataItem<{ tender: Tender; deal: Deal; winningBid: TenderBid }>
      >(`/tenders/${tenderId}/award/${bidId}`);
      return res.data.data;
    },
  },

  // -------------------------------------------------------------------------
  // Price Catalog (public — no auth required)
  // -------------------------------------------------------------------------
  prices: {
    /** List prices with optional filters. */
    list: async (filters?: {
      tech?: string;
      region?: string;
    }): Promise<PriceEntry[]> => {
      const res = await axiosInstance.get<ContentList<PriceEntry>>("/prices", {
        params: filters,
      });
      return res.data.content;
    },

    /** List all available region codes. */
    regions: async (): Promise<string[]> => {
      const res = await axiosInstance.get<{ regions: string[] }>(
        "/prices/regions",
      );
      return res.data.regions;
    },

    /** List all available technology codes. */
    technologies: async (): Promise<string[]> => {
      const res = await axiosInstance.get<{ technologies: string[] }>(
        "/prices/technologies",
      );
      return res.data.technologies;
    },
  },

  // -------------------------------------------------------------------------
  // Sync (Offline-First delta synchronization)
  // -------------------------------------------------------------------------
  sync: {
    /**
     * Fetch all entities changed after `since`.
     * Pass null / undefined for a full snapshot (first run).
     * Store `serverTime` from the response as the next `since` value.
     */
    delta: async (since?: string | null): Promise<SyncResponse> => {
      const params = since ? { since } : {};
      const res = await axiosInstance.get<SyncResponse>("/sync", { params });
      return res.data;
    },
  },

  // -------------------------------------------------------------------------
  // Admin
  // -------------------------------------------------------------------------
  admin: {
    /** List disputes (admin only). */
    listDisputes: async (filters?: {
      status?: string;
    }): Promise<Dispute[]> => {
      const res = await axiosInstance.get<{ disputes: Dispute[] }>(
        "/admin/disputes",
        { params: filters },
      );
      return res.data.disputes;
    },

    /** Resolve a dispute (admin only). */
    resolveDispute: async (
      id: string,
      data: ResolveDisputeRequest,
    ): Promise<{ dispute: Dispute }> => {
      const res = await axiosInstance.post<{ dispute: Dispute }>(
        `/admin/disputes/${id}/resolve`,
        data,
      );
      return res.data;
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a Russian phone number to E.164 format.
 * Accepts: +7 (900) 000-00-00, 8-900-000-00-00, 79001234567, etc.
 * Returns: +79001234567
 */
export function normalizePhone(raw: string): string {
  // Strip all non-digit characters
  const digits = raw.replace(/\D/g, "");

  // Handle Russian numbers starting with 8 or 7
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }

  // Already in international format without +
  if (digits.length === 10) {
    return `+7${digits}`;
  }

  // Return with + prefix if not already present
  return raw.startsWith("+") ? raw : `+${digits}`;
}

/**
 * Extract a human-readable error message from an API error response.
 * Handles both field-level validation errors and top-level error strings.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; errors?: Record<string, string[]>; message?: string }
      | undefined;

    if (data?.error) return data.error;
    if (data?.message) return data.message;

    if (data?.errors) {
      const firstField = Object.keys(data.errors)[0];
      const firstMsg = data.errors[firstField]?.[0];
      if (firstField && firstMsg) {
        return `${firstField}: ${firstMsg}`;
      }
    }

    if (error.response?.status === 401) return "Необходима авторизация";
    if (error.response?.status === 403) return "Недостаточно прав доступа";
    if (error.response?.status === 404) return "Ресурс не найден";
    if (error.response?.status === 409) return "Конфликт версий — обновите страницу";
    if (error.response?.status === 422) return "Ошибка валидации данных";
    if (error.response?.status === 500) return "Ошибка сервера — попробуйте позже";
    if (error.code === "ECONNABORTED") return "Превышено время ожидания запроса";
    if (error.code === "ERR_NETWORK") return "Нет соединения с сервером";
  }

  if (error instanceof Error) return error.message;
  return "Произошла неизвестная ошибка";
}

// Export the raw axios instance for advanced use cases
export { axiosInstance };
