/**
 * useDeals — хук для загрузки сделок заказчика.
 * useOffers — хук для загрузки офферов по конкретному проекту.
 */
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Deal, Offer } from "@/lib/api.types";

export type DealStatus =
  | "pending"
  | "active"
  | "completed"
  | "disputed"
  | "cancelled";

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  pending: "Ожидает",
  active: "В работе",
  completed: "Завершена",
  disputed: "Спор",
  cancelled: "Отменена",
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  pending: "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.18_0.05_70)]",
  active: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.05_160)]",
  completed: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.08_160)]",
  disputed: "text-red-400 bg-red-950/40",
  cancelled: "text-[oklch(0.55_0.01_240)] bg-[oklch(0.18_0.01_240)]",
};

export type MilestoneStatus = "pending" | "paid" | "completed";

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  completed: "Завершён",
};

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.deals.list();
      const list = (res as { content?: Deal[] }).content ?? (res as Deal[]);
      setDeals(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки сделок");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { deals, loading, error, refetch: fetch };
}

export function useOffers(projectId: string | null) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.offers.listByProject(projectId);
      const list = (res as { content?: Offer[] }).content ?? (res as Offer[]);
      setOffers(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки предложений");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { offers, loading, error, refetch: fetch };
}
