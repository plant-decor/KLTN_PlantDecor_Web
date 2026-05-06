"use client";

import { useCallback, useEffect, useState } from "react";
import { getCareReminderTypeEnums } from "@/lib/api/careServiceService";
import type { EnumOption } from "@/types/care-service.types";

type UseCareReminderTypeEnumsOptions = {
  enabled?: boolean;
};

type UseCareReminderTypeEnumsResult = {
  options: EnumOption[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<EnumOption[]>;
};

export function useCareReminderTypeEnums(
  options: UseCareReminderTypeEnumsOptions = {},
): UseCareReminderTypeEnumsResult {
  const { enabled = true } = options;
  const [items, setItems] = useState<EnumOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnums = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      return [] as EnumOption[];
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getCareReminderTypeEnums(false);
      setItems(response);
      return response;
    } catch (err) {
      console.error("Load care reminder enums failed:", err);
      setError("Khong the tai loai nhac nho");
      return [] as EnumOption[];
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadEnums();
  }, [loadEnums]);

  return {
    options: items,
    isLoading,
    error,
    reload: loadEnums,
  };
}
