"use client";

import { useCallback, useState } from "react";
import {
  getAdminFailedOrdersSummary,
  getAdminLowStock,
  getAdminOrderStatusSummary,
} from "@/lib/api/adminDashboardService";
import type {
  AdminFailedOrdersPayload,
  AdminLowStockItem,
  AdminOrderStatusSummaryPayload,
} from "@/types/admin-dashboard.types";

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

export interface UseAdminSystemDashboardReturn {
  lowStock: AdminLowStockItem[];
  orderStatus: AdminOrderStatusSummaryPayload | null;
  failedOrders: AdminFailedOrdersPayload | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: (fromIso: string, toIso: string, threshold: number) => Promise<void>;
  clearError: () => void;
}

export const useAdminSystemDashboard = (): UseAdminSystemDashboardReturn => {
  const [lowStock, setLowStock] = useState<AdminLowStockItem[]>([]);
  const [orderStatus, setOrderStatus] = useState<AdminOrderStatusSummaryPayload | null>(null);
  const [failedOrders, setFailedOrders] = useState<AdminFailedOrdersPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (fromIso: string, toIso: string, threshold: number) => {
    setLoading(true);
    setError(null);
    try {
      const [lowRes, statusRes, failedRes] = await Promise.all([
        getAdminLowStock({ threshold }, false),
        getAdminOrderStatusSummary({ from: fromIso, to: toIso }, false),
        getAdminFailedOrdersSummary({ from: fromIso, to: toIso }, false),
      ]);

      const lowPayload = getResponsePayload(lowRes) ?? [];
      setLowStock(Array.isArray(lowPayload) ? lowPayload : []);
      setOrderStatus(getResponsePayload(statusRes) ?? null);
      setFailedOrders(getResponsePayload(failedRes) ?? null);
    } catch (err) {
      setLowStock([]);
      setOrderStatus(null);
      setFailedOrders(null);
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    lowStock,
    orderStatus,
    failedOrders,
    loading,
    error,
    fetchDashboard,
    clearError,
  };
};
