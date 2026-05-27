"use client";

import { useCallback, useMemo, useState } from "react";
import { getPublicTierPackages } from "@/lib/api/tierPackageService";
import { createTierPackagePayment } from "@/lib/api/aiQuotaService";
import type { TierPackage } from "@/types/tier-package.types";

const normalizeError = (err: unknown): string => {
  if (!err || typeof err !== "object") return "An error occurred";
  const candidate = err as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || "An error occurred";
};

export interface UseTierPackagesReturn {
  packages: TierPackage[];
  loading: boolean;
  purchasing: boolean;
  error: string | null;
  fetchPackages: () => Promise<void>;
  purchasePackage: (tierPackageId: number) => Promise<void>;
  clearError: () => void;
}

export const useTierPackages = (): UseTierPackagesReturn => {
  const [packages, setPackages] = useState<TierPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicTierPackages(true);
      setPackages(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const purchasePackage = useCallback(async (tierPackageId: number) => {
    setPurchasing(true);
    setError(null);
    try {
      const result = await createTierPackagePayment({ tierPackageId }, true);
      window.location.assign(result.paymentUrl);
    } catch (err) {
      setError(normalizeError(err));
      setPurchasing(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({ packages, loading, purchasing, error, fetchPackages, purchasePackage, clearError }),
    [packages, loading, purchasing, error, fetchPackages, purchasePackage, clearError]
  );
};

export default useTierPackages;
