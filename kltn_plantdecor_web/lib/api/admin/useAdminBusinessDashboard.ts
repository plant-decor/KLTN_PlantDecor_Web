"use client";

import { useCallback, useState } from "react";
import {
  getAdminRevenueByNursery,
  getAdminRevenueSummary,
} from "@/lib/api/adminRevenueService";
import { getAdminTopProducts } from "@/lib/api/adminDashboardService";
import type { AdminTopProductItem } from "@/types/admin-dashboard.types";
import type {
  AdminRevenueByNurseryRow,
  AdminRevenueSummaryPayload,
} from "@/types/admin-revenue.types";

const getResponsePayload = <T,>(response: { data?: T; payload?: T }): T | undefined => {
  return response.payload ?? response.data;
};

const normalizeError = (err: unknown): string => {
  if (!err || typeof err !== "object") {
    return "An error occurred";
  }
  const candidate = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return candidate.response?.data?.message || candidate.message || "An error occurred";
};

export interface UseAdminBusinessDashboardReturn {
  summary: AdminRevenueSummaryPayload | null;
  byNursery: AdminRevenueByNurseryRow[];
  topProducts: AdminTopProductItem[];
  loading: boolean;
  error: string | null;
  fetchDashboard: (fromIso: string, toIso: string, topLimit?: number) => Promise<void>;
  clearError: () => void;
}

export const useAdminBusinessDashboard = (): UseAdminBusinessDashboardReturn => {
  const [summary, setSummary] = useState<AdminRevenueSummaryPayload | null>(null);
  const [byNursery, setByNursery] = useState<AdminRevenueByNurseryRow[]>([]);
  const [topProducts, setTopProducts] = useState<AdminTopProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (fromIso: string, toIso: string, topLimit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, byNurseryRes, topRes] = await Promise.all([
        getAdminRevenueSummary({ from: fromIso, to: toIso }, false),
        getAdminRevenueByNursery({ from: fromIso, to: toIso }, false),
        getAdminTopProducts({ from: fromIso, to: toIso, limit: topLimit }, false),
      ]);

      setSummary(getResponsePayload(summaryRes) ?? null);
      const nurseryPayload = getResponsePayload(byNurseryRes) ?? [];
      setByNursery(Array.isArray(nurseryPayload) ? nurseryPayload : []);
      const topPayload = getResponsePayload(topRes) ?? [];
      setTopProducts(Array.isArray(topPayload) ? topPayload : []);
    } catch (err) {
      setSummary(null);
      setByNursery([]);
      setTopProducts([]);
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    summary,
    byNursery,
    topProducts,
    loading,
    error,
    fetchDashboard,
    clearError,
  };
};
