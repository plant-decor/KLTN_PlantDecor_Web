"use client";

import { useCallback, useEffect, useState } from "react";
import { getMyCareReminders } from "@/lib/api/myPlantClientService";
import type { MyCareRemindersQuery } from "@/lib/api/myPlantClientService";
import type { MyCareReminderListPayload } from "@/types/my-plant.types";

type UseMyCareRemindersOptions = {
  enabled?: boolean;
  query?: MyCareRemindersQuery;
};

export function useMyCareReminders(options: UseMyCareRemindersOptions = {}) {
  const { enabled = true, query } = options;

  const [payload, setPayload] = useState<MyCareReminderListPayload>({
    items: [],
    totalCount: 0,
    pageNumber: query?.pageNumber ?? 1,
    pageSize: query?.pageSize ?? 10,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReminders = useCallback(async () => {
    if (!enabled) {
      const emptyPayload: MyCareReminderListPayload = {
        items: [],
        totalCount: 0,
        pageNumber: query?.pageNumber ?? 1,
        pageSize: query?.pageSize ?? 10,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      };
      setPayload(emptyPayload);
      return emptyPayload;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getMyCareReminders(query, false);
      setPayload(response);
      return response;
    } catch (err) {
      console.error("Load care reminders failed:", err);
      setError("Khong the tai nhac nho cham soc cay");
      const fallback: MyCareReminderListPayload = {
        items: [],
        totalCount: 0,
        pageNumber: query?.pageNumber ?? 1,
        pageSize: query?.pageSize ?? 10,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      };
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, [enabled, query]);

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  return {
    reminders: payload.items,
    pagination: {
      totalCount: payload.totalCount,
      pageNumber: payload.pageNumber,
      pageSize: payload.pageSize,
      totalPages: payload.totalPages,
      hasPrevious: payload.hasPrevious,
      hasNext: payload.hasNext,
    },
    isLoading,
    error,
    reloadReminders: loadReminders,
    setReminders: (items: MyCareReminderListPayload["items"]) => {
      setPayload((prev) => ({ ...prev, items }));
    },
  };
}
