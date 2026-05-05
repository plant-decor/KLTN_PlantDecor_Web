"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ApiClientRequestConfig } from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AdminNursery,
  AdminNurserySearchPayload,
  AdminNurserySearchRequest,
  AdminNurseryUpsertRequest,
} from "@/types/admin-nursery.types";

export const searchAdminNurseries = async (
  data: AdminNurserySearchRequest,
  loading = true,
  config: ApiClientRequestConfig = {}
): Promise<ResponseModel<AdminNurserySearchPayload>> => {
  return apiClient.post("/system/nurseries/search", data, loading, config);
};

export const createAdminNursery = async (
  data: AdminNurseryUpsertRequest,
  loading = true
): Promise<ResponseModel<AdminNursery>> => {
  return apiClient.post("/admin/nurseries", data, loading);
};

export const updateAdminNursery = async (
  id: number,
  data: AdminNurseryUpsertRequest,
  loading = true
): Promise<ResponseModel<AdminNursery>> => {
  return apiClient.patch(`/admin/nurseries/${id}`, data, loading);
};

export const toggleAdminNurseryActive = async (
  id: number,
  loading = true
): Promise<ResponseModel<unknown>> => {
  return apiClient.patch(`/admin/nurseries/${id}/toggle-active`, undefined, loading);
};
