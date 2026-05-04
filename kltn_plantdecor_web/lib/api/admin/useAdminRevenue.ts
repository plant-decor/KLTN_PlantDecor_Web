"use client";

import { useCallback, useState } from "react";
import {
  getAdminRevenueByNursery,
  getAdminRevenueSummary,
} from "@/lib/api/adminRevenueService";
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

export interface UseAdminRevenueReturn {
  summary: AdminRevenueSummaryPayload | null;
  byNursery: AdminRevenueByNurseryRow[];
  loading: boolean;
  error: string | null;
  fetchRevenue: (fromIso: string, toIso: string) => Promise<void>;
  clearError: () => void;
}

export const useAdminRevenue = (): UseAdminRevenueReturn => {
  const [summary, setSummary] = useState<AdminRevenueSummaryPayload | null>(null);
  const [byNursery, setByNursery] = useState<AdminRevenueByNurseryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async (fromIso: string, toIso: string) => {
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, byNurseryRes] = await Promise.all([
        getAdminRevenueSummary({ from: fromIso, to: toIso }, false),
        getAdminRevenueByNursery({ from: fromIso, to: toIso }, false),
      ]);

      const summaryPayload = getResponsePayload(summaryRes) ?? null;
      const byNurseryPayload = getResponsePayload(byNurseryRes) ?? [];

      setSummary(summaryPayload);
      setByNursery(Array.isArray(byNurseryPayload) ? byNurseryPayload : []);
    } catch (err) {
      setSummary(null);
      setByNursery([]);
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
    loading,
    error,
    fetchRevenue,
    clearError,
  };
};
