"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ApiClientRequestConfig } from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AdminUser,
  AdminUserSearchPayload,
  AdminUserSearchRequest,
} from "@/types/admin-user.types";

export const searchAdminUsers = async (
  data: AdminUserSearchRequest,
  loading = true,
  config: ApiClientRequestConfig = {}
): Promise<ResponseModel<AdminUserSearchPayload>> => {
  return apiClient.post("/admin/users/search", data, loading, {
    ...config,
    showToast: config.showToast ?? true,
  });
};

export const getAdminUserById = async (
  id: number,
  loading = true
): Promise<ResponseModel<AdminUser>> => {
  return apiClient.get(`/admin/users/${id}`, undefined, loading);
};

export const toggleAdminUserActive = async (
  id: number,
  loading = true
): Promise<ResponseModel<AdminUser>> => {
  return apiClient.patch(`/admin/users/${id}/toggle-active`, undefined, loading);
};
