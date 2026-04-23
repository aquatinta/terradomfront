/**
 * useTenders — хук для ленты тендеров (кабинет партнёра)
 *
 * Дизайн-философия: Dark Tech PropTech
 * Polling каждые 60s для получения новых тендеров (менее критично чем сделки).
 * Партнёр видит только открытые тендеры (status=open).
 * Кэш ставок хранится в памяти для мгновенного UI-фидбека.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { Tender, TenderBid, CreateBidRequest } from "@/lib/api.types";

export interface TenderFilters {
  region?: string;
  technology?: string;
  status?: string;
}

interface UseTendersReturn {
  tenders: Tender[];
  loading: boolean;
  error: string | null;
  filters: TenderFilters;
  setFilters: (f: TenderFilters) => void;
  refresh: () => Promise<void>;
  submitBid: (tenderId: string, data: CreateBidRequest) => Promise<TenderBid>;
  submittingBidId: string | null;
  // Map of tenderId → own bid (from detail fetch)
  ownBids: Record<string, TenderBid>;
  fetchTenderDetail: (id: string) => Promise<Tender>;
}

export function useTenders(): UseTendersReturn {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TenderFilters>({ status: "open" });
  const [submittingBidId, setSubmittingBidId] = useState<string | null>(null);
  const [ownBids, setOwnBids] = useState<Record<string, TenderBid>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTenders = useCallback(async () => {
    try {
      const allTenders = await api.tenders.list({
        region: filters.region,
        technology: filters.technology,
      });
      // Filter by status client-side (backend returns all accessible tenders)
      const statusFilter = filters.status ?? "open";
      const data = statusFilter === "all"
        ? allTenders
        : allTenders.filter((t) => t.status === statusFilter);
      setTenders(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки тендеров";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchTenders();
  }, [fetchTenders]);

  // Initial load + polling every 60s
  useEffect(() => {
    setLoading(true);
    fetchTenders();
    intervalRef.current = setInterval(fetchTenders, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchTenders]);

  const fetchTenderDetail = useCallback(async (id: string): Promise<Tender> => {
    const tender = await api.tenders.get(id);
    // Extract own bid if present
    if (tender.bids && tender.bids.length > 0) {
      const bid = tender.bids[0];
      setOwnBids((prev) => ({ ...prev, [id]: bid }));
    }
    return tender;
  }, []);

  const submitBid = useCallback(
    async (tenderId: string, data: CreateBidRequest): Promise<TenderBid> => {
      setSubmittingBidId(tenderId);
      try {
        const bid = await api.tenders.submitBid(tenderId, data);
        // Cache the submitted bid
        setOwnBids((prev) => ({ ...prev, [tenderId]: bid }));
        // Update bidsCount in list
        setTenders((prev) =>
          prev.map((t) =>
            t.id === tenderId ? { ...t, bidsCount: (t.bidsCount ?? 0) + 1 } : t,
          ),
        );
        return bid;
      } finally {
        setSubmittingBidId(null);
      }
    },
    [],
  );

  return {
    tenders,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    submitBid,
    submittingBidId,
    ownBids,
    fetchTenderDetail,
  };
}
