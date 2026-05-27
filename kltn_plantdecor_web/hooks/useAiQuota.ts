"use client";

import { useCallback, useMemo, useState } from "react";
import { getUserAiQuota, getUserSubscriptions, getTierProgress } from "@/lib/api/aiQuotaService";
import type { UserQuotaStatus, UserSubscription, TierProgress } from "@/types/tier-package.types";

const normalizeError = (err: unknown): string => {
  if (!err || typeof err !== "object") return "An error occurred";
  const candidate = err as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || "An error occurred";
};

export interface UseAiQuotaReturn {
  quotaStatus: UserQuotaStatus | null;
  subscriptions: UserSubscription[];
  tierProgress: TierProgress | null;
  loading: boolean;
  error: string | null;
  fetchQuota: () => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
  fetchTierProgress: () => Promise<void>;
  clearError: () => void;
}

export const useAiQuota = (): UseAiQuotaReturn => {
  const [quotaStatus, setQuotaStatus] = useState<UserQuotaStatus | null>(null);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [tierProgress, setTierProgress] = useState<TierProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserAiQuota(true);
      setQuotaStatus(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserSubscriptions(true);
      setSubscriptions(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTierProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTierProgress(true);
      setTierProgress(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({ quotaStatus, subscriptions, tierProgress, loading, error, fetchQuota, fetchSubscriptions, fetchTierProgress, clearError }),
    [quotaStatus, subscriptions, tierProgress, loading, error, fetchQuota, fetchSubscriptions, fetchTierProgress, clearError]
  );
};

export default useAiQuota;
