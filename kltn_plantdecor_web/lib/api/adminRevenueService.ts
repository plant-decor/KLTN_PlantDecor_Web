"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AdminRevenueByNurseryRow,
  AdminRevenueDateRangeParams,
  AdminRevenueSummaryPayload,
} from "@/types/admin-revenue.types";

export const getAdminRevenueSummary = async (
  params: AdminRevenueDateRangeParams,
  loading = true
): Promise<ResponseModel<AdminRevenueSummaryPayload>> => {
  return apiClient.get("/admin/revenue/summary", params, loading);
};

export const getAdminRevenueByNursery = async (
  params: AdminRevenueDateRangeParams,
  loading = true
): Promise<ResponseModel<AdminRevenueByNurseryRow[]>> => {
  return apiClient.get("/admin/revenue/by-nursery", params, loading);
};
