/**
 * useNotifications — хук уведомлений для партнёра.
 *
 * Polling каждые 60 секунд:
 *  - GET /api/tenders?status=open  → считаем тендеры новее lastSeenAt
 *  - GET /api/offers               → считаем офферы со статусом accepted (принятые ставки)
 *
 * Хранит lastSeenAt в localStorage, чтобы badge сбрасывался после посещения /partner.
 *
 * Design: Dark Tech PropTech — янтарный badge, минималистичный.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "terradom_notifications_last_seen";
const POLL_INTERVAL = 60_000; // 60 секунд

export interface NotificationCounts {
  /** Новые открытые тендеры в регионах партнёра, появившиеся после lastSeenAt */
  newTenders: number;
  /** Офферы партнёра, которые заказчик принял (accepted) */
  acceptedOffers: number;
  /** Суммарный badge */
  total: number;
}

export function useNotifications() {
  const { isAuthenticated, user } = useAuth();
  const isPartner = isAuthenticated && (user?.role === "partner" || user?.role === "supplier");

  const [counts, setCounts] = useState<NotificationCounts>({
    newTenders: 0,
    acceptedOffers: 0,
    total: 0,
  });

  const lastSeenAtRef = useRef<string>(
    localStorage.getItem(STORAGE_KEY) ?? new Date(0).toISOString()
  );

  const fetchCounts = useCallback(async () => {
    if (!isPartner) return;

    try {
      const [tenders, offers] = await Promise.allSettled([
        api.tenders.list(),
        api.offers.list(),
      ]);

      const lastSeen = new Date(lastSeenAtRef.current).getTime();

      // Новые тендеры — открытые, появившиеся после lastSeenAt
      let newTenders = 0;
      if (tenders.status === "fulfilled") {
        newTenders = tenders.value.filter(
          (t) =>
            t.status === "open" &&
            new Date(t.insertedAt).getTime() > lastSeen
        ).length;
      }

      // Принятые офферы — статус accepted и обновлены после lastSeenAt
      let acceptedOffers = 0;
      if (offers.status === "fulfilled") {
        acceptedOffers = offers.value.filter(
          (o) =>
            o.status === "accepted" &&
            new Date(o.updatedAt).getTime() > lastSeen
        ).length;
      }

      const total = newTenders + acceptedOffers;
      setCounts({ newTenders, acceptedOffers, total });
    } catch {
      // Тихо игнорируем ошибки polling — не мешаем основному UI
    }
  }, [isPartner]);

  /** Вызывать при переходе на /partner — сбрасывает badge */
  const markAllSeen = useCallback(() => {
    const now = new Date().toISOString();
    lastSeenAtRef.current = now;
    localStorage.setItem(STORAGE_KEY, now);
    setCounts({ newTenders: 0, acceptedOffers: 0, total: 0 });
  }, []);

  useEffect(() => {
    if (!isPartner) return;

    // Первый запрос сразу
    fetchCounts();

    const interval = setInterval(fetchCounts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isPartner, fetchCounts]);

  return { counts, markAllSeen };
}
