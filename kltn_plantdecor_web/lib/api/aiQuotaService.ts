"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  UserQuotaStatus,
  UserSubscription,
  CreateTierPackagePaymentRequest,
  CreateTierPackagePaymentResponse,
} from "@/types/tier-package.types";

const QUERY_CONFIG = { showToast: false, showErrorToast: false };
const MUTATION_CONFIG = { showToast: false, showErrorToast: false };

type WrappedResponse<T> = ResponseModel<T> | T;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const unwrapPayload = <T>(response: WrappedResponse<T>): T => {
  if (!isRecord(response)) return response as T;
  if ("payload" in response && response.payload !== undefined) return response.payload as T;
  if ("data" in response && response.data !== undefined) return response.data as T;
  return response as T;
};

export const getUserAiQuota = async (loading = true): Promise<UserQuotaStatus> => {
  const response = await apiClient.get<WrappedResponse<UserQuotaStatus>>(
    "user/ai-quota",
    undefined,
    loading,
    QUERY_CONFIG
  );
  return unwrapPayload(response) as UserQuotaStatus;
};

export const getUserSubscriptions = async (loading = true): Promise<UserSubscription[]> => {
  const response = await apiClient.get<WrappedResponse<UserSubscription[]>>(
    "User/subscriptions",
    undefined,
    loading,
    QUERY_CONFIG
  );
  const raw = unwrapPayload(response);
  return Array.isArray(raw) ? raw : [];
};

export const createTierPackagePayment = async (
  data: CreateTierPackagePaymentRequest,
  loading = true
): Promise<CreateTierPackagePaymentResponse> => {
  const response = await apiClient.post<WrappedResponse<CreateTierPackagePaymentResponse>>(
    "payment/create-tier-package",
    data,
    loading,
    MUTATION_CONFIG
  );
  return unwrapPayload(response) as CreateTierPackagePaymentResponse;
};

export const getAdminUserAiQuota = async (
  userId: number,
  loading = true
): Promise<UserQuotaStatus> => {
  const response = await apiClient.get<WrappedResponse<UserQuotaStatus>>(
    `admin/users/${userId}/ai-quota`,
    undefined,
    loading,
    QUERY_CONFIG
  );
  return unwrapPayload(response) as UserQuotaStatus;
};

export const getAdminUserSubscriptions = async (
  userId: number,
  loading = true
): Promise<UserSubscription[]> => {
  const response = await apiClient.get<WrappedResponse<UserSubscription[]>>(
    `admin/users/${userId}/subscriptions`,
    undefined,
    loading,
    QUERY_CONFIG
  );
  const raw = unwrapPayload(response);
  return Array.isArray(raw) ? raw : [];
};

export const triggerMonthlyResetAll = async (loading = true): Promise<void> => {
  await apiClient.post<unknown>(
    "admin/ai-quota/monthly-reset/trigger",
    undefined,
    loading,
    MUTATION_CONFIG
  );
};

export const triggerMonthlyResetUser = async (
  userId: number,
  loading = true
): Promise<void> => {
  await apiClient.post<unknown>(
    `admin/ai-quota/monthly-reset/trigger/${userId}`,
    undefined,
    loading,
    MUTATION_CONFIG
  );
};
