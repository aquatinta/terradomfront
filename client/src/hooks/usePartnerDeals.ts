/**
 * usePartnerDeals — хук для кабинета партнёра
 *
 * Дизайн-философия: Dark Tech PropTech
 * Загружает офферы партнёра (GET /api/offers) и его сделки (GET /api/deals).
 * Polling каждые 30s — партнёру важно знать об изменении статуса этапов.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { Offer, Deal } from "@/lib/api.types";

interface UsePartnerDealsReturn {
  offers: Offer[];
  deals: Deal[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  completeMilestone: (milestoneId: string) => Promise<void>;
  completingId: string | null;
}

export function usePartnerDeals(): UsePartnerDealsReturn {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [offersData, dealsData] = await Promise.all([
        api.offers.list(),
        api.deals.list(),
      ]);
      setOffers(offersData);
      setDeals(dealsData);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки данных";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchAll();
  }, [fetchAll]);

  // Initial load + polling every 30s
  useEffect(() => {
    setLoading(true);
    fetchAll();
    intervalRef.current = setInterval(fetchAll, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  /**
   * Партнёр завершает этап работ — переводит milestone в "completed".
   * Это уведомляет заказчика о необходимости подтвердить приёмку.
   */
  const completeMilestone = useCallback(async (milestoneId: string) => {
    setCompletingId(milestoneId);
    try {
      await api.milestones.accept(milestoneId, { status: "completed" });
      // Refresh deals to get updated milestone status
      const dealsData = await api.deals.list();
      setDeals(dealsData);
    } finally {
      setCompletingId(null);
    }
  }, []);

  return {
    offers,
    deals,
    loading,
    error,
    refresh,
    completeMilestone,
    completingId,
  };
}
