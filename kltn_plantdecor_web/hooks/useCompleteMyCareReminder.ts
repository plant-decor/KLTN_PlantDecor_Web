"use client";

import { useCallback, useState } from "react";
import { completeMyCareReminder } from "@/lib/api/myPlantClientService";
import type { MyCareReminderItem } from "@/types/my-plant.types";

type CompleteResult = {
  item: MyCareReminderItem | null;
  success: boolean;
  message?: string;
};

type UseCompleteMyCareReminderResult = {
  completeReminder: (id: number) => Promise<CompleteResult>;
  isCompleting: boolean;
  error: string | null;
};

export function useCompleteMyCareReminder(): UseCompleteMyCareReminderResult {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeReminder = useCallback(async (id: number) => {
    try {
      setIsCompleting(true);
      setError(null);
      const res = await completeMyCareReminder(id, false);
      return {
        item: res.data ?? null,
        success: res.success ?? false,
        message: res.message,
      } as CompleteResult;
    } catch (err) {
      console.error("Complete care reminder failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Khong the danh dau nhac nho cham soc cay da hoan thanh";
      setError(message);
      return {
        item: null,
        success: false,
        message,
      } as CompleteResult;
    } finally {
      setIsCompleting(false);
    }
  }, []);

  return {
    completeReminder,
    isCompleting,
    error,
  };
}
