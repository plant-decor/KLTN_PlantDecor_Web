"use client";

import { useCallback, useMemo, useState } from "react";
import {
  getAdminTierPackages,
  createTierPackage,
  updateTierPackage,
  deactivateTierPackage,
} from "@/lib/api/tierPackageService";
import type {
  TierPackage,
  CreateTierPackageRequest,
  UpdateTierPackageRequest,
} from "@/types/tier-package.types";

const normalizeError = (err: unknown): string => {
  if (!err || typeof err !== "object") return "An error occurred";
  const candidate = err as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || "An error occurred";
};

export interface UseAdminTierPackagesReturn {
  packages: TierPackage[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchPackages: () => Promise<void>;
  addPackage: (data: CreateTierPackageRequest) => Promise<boolean>;
  editPackage: (id: number, data: UpdateTierPackageRequest) => Promise<boolean>;
  removePackage: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export const useAdminTierPackages = (): UseAdminTierPackagesReturn => {
  const [packages, setPackages] = useState<TierPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminTierPackages(true);
      setPackages(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addPackage = useCallback(
    async (data: CreateTierPackageRequest): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await createTierPackage(data, true);
        await fetchPackages();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchPackages]
  );

  const editPackage = useCallback(
    async (id: number, data: UpdateTierPackageRequest): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await updateTierPackage(id, data, true);
        await fetchPackages();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchPackages]
  );

  const removePackage = useCallback(
    async (id: number): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await deactivateTierPackage(id, true);
        await fetchPackages();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchPackages]
  );

  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({ packages, loading, saving, error, fetchPackages, addPackage, editPackage, removePackage, clearError }),
    [packages, loading, saving, error, fetchPackages, addPackage, editPackage, removePackage, clearError]
  );
};

export default useAdminTierPackages;
