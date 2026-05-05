"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AdminDashboardDateRangeParams,
  AdminFailedOrdersPayload,
  AdminLowStockItem,
  AdminOrderStatusSummaryPayload,
  AdminTopProductItem,
  AdminTopProductsParams,
} from "@/types/admin-dashboard.types";

export const getAdminLowStock = async (
  params: { threshold: number },
  loading = true
): Promise<ResponseModel<AdminLowStockItem[]>> => {
  return apiClient.get("/admin/inventory/low-stock", params, loading);
};

export const getAdminOrderStatusSummary = async (
  params: AdminDashboardDateRangeParams,
  loading = true
): Promise<ResponseModel<AdminOrderStatusSummaryPayload>> => {
  return apiClient.get("/admin/orders/status-summary", params, loading);
};

export const getAdminFailedOrdersSummary = async (
  params: AdminDashboardDateRangeParams,
  loading = true
): Promise<ResponseModel<AdminFailedOrdersPayload>> => {
  return apiClient.get("/admin/orders/failed", params, loading);
};

export const getAdminTopProducts = async (
  params: AdminTopProductsParams,
  loading = true
): Promise<ResponseModel<AdminTopProductItem[]>> => {
  return apiClient.get("/admin/products/top", params, loading);
};
