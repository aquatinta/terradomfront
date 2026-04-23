/**
 * useProjects — хук для загрузки проектов заказчика.
 * Синхронизирован с мобильным приложением:
 * - Использует те же поля: serverId, updatedAt, status
 * - Статусы совпадают с _STATUS_ORDER из state.js мобильного клиента
 */
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Project } from "@/lib/api.types";

export type ProjectStatus =
  | "draft"
  | "assembled"
  | "calculated"
  | "request_sent"
  | "offers_received"
  | "executor_selected"
  | "deal_started";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Черновик",
  assembled: "Собран",
  calculated: "Смета готова",
  request_sent: "Запрос отправлен",
  offers_received: "Есть предложения",
  executor_selected: "Исполнитель выбран",
  deal_started: "Сделка открыта",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: "text-[oklch(0.55_0.01_240)] bg-[oklch(0.18_0.01_240)]",
  assembled: "text-[oklch(0.7_0.15_240)] bg-[oklch(0.18_0.05_240)]",
  calculated: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.05_160)]",
  request_sent: "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.18_0.05_70)]",
  offers_received: "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.22_0.08_70)]",
  executor_selected: "text-[oklch(0.75_0.18_160)] bg-[oklch(0.18_0.08_160)]",
  deal_started: "text-[oklch(0.769_0.188_70.08)] bg-[oklch(0.22_0.1_70)]",
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.projects.list();
      // Backend returns { content: Project[] } paginated
      const list = (res as { content?: Project[] }).content ?? (res as Project[]);
      setProjects(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки проектов");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { projects, loading, error, refetch: fetch };
}
