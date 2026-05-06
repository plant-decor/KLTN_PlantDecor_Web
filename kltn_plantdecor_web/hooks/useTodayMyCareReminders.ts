"use client";

import { useCallback, useEffect, useState } from "react";
import { getTodayMyCareReminders } from "@/lib/api/myPlantClientService";
import type { MyCareReminderItem } from "@/types/my-plant.types";

type UseTodayMyCareRemindersResult = {
  reminders: MyCareReminderItem[];
  isLoading: boolean;
  error: string | null;
  reloadTodayReminders: () => Promise<MyCareReminderItem[]>;
};

export function useTodayMyCareReminders(): UseTodayMyCareRemindersResult {
  const [reminders, setReminders] = useState<MyCareReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodayReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getTodayMyCareReminders(false);
      setReminders(response);
      return response;
    } catch (err) {
      console.error("Load today's care reminders failed:", err);
      setError("Khong the tai nhac nho hom nay");
      setReminders([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTodayReminders();
  }, [loadTodayReminders]);

  return {
    reminders,
    isLoading,
    error,
    reloadTodayReminders: loadTodayReminders,
  };
}
