"use client";

import { useCallback, useMemo, useState } from "react";
import {
  getAdminUserAiQuota,
  getAdminUserSubscriptions,
  triggerMonthlyResetAll,
  triggerMonthlyResetUser,
} from "@/lib/api/aiQuotaService";
import type { UserQuotaStatus, UserSubscription } from "@/types/tier-package.types";

const normalizeError = (err: unknown): string => {
  if (!err || typeof err !== "object") return "An error occurred";
  const candidate = err as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || "An error occurred";
};

export interface UseAdminUserAiQuotaReturn {
  quotaStatus: UserQuotaStatus | null;
  subscriptions: UserSubscription[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchUserQuota: (userId: number) => Promise<void>;
  fetchUserSubscriptions: (userId: number) => Promise<void>;
  resetUserQuota: (userId: number) => Promise<boolean>;
  resetAllQuota: () => Promise<boolean>;
  clearError: () => void;
}

export const useAdminUserAiQuota = (): UseAdminUserAiQuotaReturn => {
  const [quotaStatus, setQuotaStatus] = useState<UserQuotaStatus | null>(null);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserQuota = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUserAiQuota(userId, true);
      setQuotaStatus(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserSubscriptions = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUserSubscriptions(userId, true);
      setSubscriptions(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const resetUserQuota = useCallback(async (userId: number): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      await triggerMonthlyResetUser(userId, true);
      await fetchUserQuota(userId);
      return true;
    } catch (err) {
      setError(normalizeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchUserQuota]);

  const resetAllQuota = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      await triggerMonthlyResetAll(true);
      return true;
    } catch (err) {
      setError(normalizeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({
      quotaStatus,
      subscriptions,
      loading,
      saving,
      error,
      fetchUserQuota,
      fetchUserSubscriptions,
      resetUserQuota,
      resetAllQuota,
      clearError,
    }),
    [quotaStatus, subscriptions, loading, saving, error, fetchUserQuota, fetchUserSubscriptions, resetUserQuota, resetAllQuota, clearError]
  );
};

export default useAdminUserAiQuota;
