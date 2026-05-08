"use client";

import { useCallback, useState } from "react";
import { updateMyPlant } from "@/lib/api/myPlantClientService";
import type { MyPlantItem, MyPlantUpdateRequest } from "@/types/my-plant.types";

type UpdateResult = {
  item: MyPlantItem | null;
  success: boolean;
  message?: string;
};

type UseUpdateMyPlantResult = {
  updatePlant: (
    id: number,
    request: MyPlantUpdateRequest,
  ) => Promise<UpdateResult>;
  isSaving: boolean;
  error: string | null;
};

export function useUpdateMyPlant(): UseUpdateMyPlantResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePlant = useCallback(
    async (id: number, request: MyPlantUpdateRequest) => {
      try {
        setIsSaving(true);
        setError(null);
        const res = await updateMyPlant(id, request, false);
        return {
          item: res.data ?? null,
          success: res.success ?? false,
          message: res.message,
        } as UpdateResult;
      } catch (err) {
        console.error("Update my plant failed:", err);
        const message =
          err instanceof Error ? err.message : "Khong the cap nhat cay cua ban";
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
    updatePlant,
    isSaving,
    error,
  };
}
