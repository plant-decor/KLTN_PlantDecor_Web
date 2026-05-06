"use client";

import { useCallback, useState } from "react";
import { createMyCareReminder } from "@/lib/api/myPlantClientService";
import type {
  MyCareReminderCreateRequest,
  MyCareReminderItem,
} from "@/types/my-plant.types";

type CreateResult = {
  item: MyCareReminderItem | null;
  success: boolean;
  message?: string;
};

type UseCreateMyCareReminderResult = {
  createReminder: (
    request: MyCareReminderCreateRequest,
  ) => Promise<CreateResult>;
  isSaving: boolean;
  error: string | null;
};

export function useCreateMyCareReminder(): UseCreateMyCareReminderResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReminder = useCallback(
    async (request: MyCareReminderCreateRequest) => {
      try {
        setIsSaving(true);
        setError(null);
        const res = await createMyCareReminder(request, false);
        return {
          item: res.data ?? null,
          success: res.success ?? false,
          message: res.message,
        } as CreateResult;
      } catch (err) {
        console.error("Create care reminder failed:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Khong the tao nhac nho cham soc cay";
        setError(message);
        return {
          item: null,
          success: false,
          message,
        } as CreateResult;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    createReminder,
    isSaving,
    error,
  };
}
