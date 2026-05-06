"use client";

import { useCallback, useState } from "react";
import { updateMyCareReminder } from "@/lib/api/myPlantClientService";
import type {
  MyCareReminderCreateRequest,
  MyCareReminderItem,
} from "@/types/my-plant.types";

type UpdateResult = {
  item: MyCareReminderItem | null;
  success: boolean;
  message?: string;
};

type UseUpdateMyCareReminderResult = {
  updateReminder: (
    id: number,
    request: MyCareReminderCreateRequest,
  ) => Promise<UpdateResult>;
  isSaving: boolean;
  error: string | null;
};

export function useUpdateMyCareReminder(): UseUpdateMyCareReminderResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateReminder = useCallback(
    async (id: number, request: MyCareReminderCreateRequest) => {
      try {
        setIsSaving(true);
        setError(null);
        const res = await updateMyCareReminder(id, request, false);
        return {
          item: res.data ?? null,
          success: res.success ?? false,
          message: res.message,
        } as UpdateResult;
      } catch (err) {
        console.error("Update care reminder failed:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Khong the cap nhat nhac nho cham soc cay";
        setError(message);
        return {
          item: null,
          success: false,
          message,
        } as UpdateResult;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    updateReminder,
    isSaving,
    error,
  };
}
