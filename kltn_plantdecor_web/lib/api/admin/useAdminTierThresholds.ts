"use client";

import { useCallback, useMemo, useState } from "react";
import {
  getAdminTierThresholds,
  createTierThreshold,
  updateTierThreshold,
  deactivateTierThreshold,
} from "@/lib/api/tierThresholdService";
import type {
  TierThreshold,
  CreateTierThresholdRequest,
  UpdateTierThresholdRequest,
} from "@/types/tier-package.types";

const normalizeError = (err: unknown): string => {
  if (!err || typeof err !== "object") return "An error occurred";
  const candidate = err as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || "An error occurred";
};

export interface UseAdminTierThresholdsReturn {
  thresholds: TierThreshold[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchThresholds: () => Promise<void>;
  addThreshold: (data: CreateTierThresholdRequest) => Promise<boolean>;
  editThreshold: (id: number, data: UpdateTierThresholdRequest) => Promise<boolean>;
  removeThreshold: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export const useAdminTierThresholds = (): UseAdminTierThresholdsReturn => {
  const [thresholds, setThresholds] = useState<TierThreshold[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThresholds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminTierThresholds(true);
      setThresholds(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addThreshold = useCallback(
    async (data: CreateTierThresholdRequest): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await createTierThreshold(data, true);
        await fetchThresholds();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchThresholds]
  );

  const editThreshold = useCallback(
    async (id: number, data: UpdateTierThresholdRequest): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await updateTierThreshold(id, data, true);
        await fetchThresholds();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchThresholds]
  );

  const removeThreshold = useCallback(
    async (id: number): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await deactivateTierThreshold(id, true);
        await fetchThresholds();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchThresholds]
  );

  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({ thresholds, loading, saving, error, fetchThresholds, addThreshold, editThreshold, removeThreshold, clearError }),
    [thresholds, loading, saving, error, fetchThresholds, addThreshold, editThreshold, removeThreshold, clearError]
  );
};

export default useAdminTierThresholds;
