"use client";

import { useCallback, useState } from "react";
import { deleteMyCareReminder } from "@/lib/api/myPlantClientService";

type UseDeleteMyCareReminderResult = {
  deleteReminder: (
    id: number,
  ) => Promise<{ success: boolean; message?: string }>;
  isDeleting: boolean;
  error: string | null;
};

export function useDeleteMyCareReminder(): UseDeleteMyCareReminderResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteReminder = useCallback(async (id: number) => {
    try {
      setIsDeleting(true);
      setError(null);
      const res = await deleteMyCareReminder(id, false);
      return { success: res.success ?? false, message: res.message };
    } catch (err) {
      console.error("Delete care reminder failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Khong the xoa nhac nho cham soc cay";
      setError(message);
      return { success: false, message };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteReminder, isDeleting, error };
}
