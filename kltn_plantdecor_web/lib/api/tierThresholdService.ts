"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  TierThreshold,
  CreateTierThresholdRequest,
  UpdateTierThresholdRequest,
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

export const getPublicTierThresholds = async (loading = true): Promise<TierThreshold[]> => {
  const response = await apiClient.get<WrappedResponse<TierThreshold[]>>(
    "public/tier-thresholds",
    undefined,
    loading,
    QUERY_CONFIG
  );
  const raw = unwrapPayload(response);
  return Array.isArray(raw) ? raw : [];
};

export const getAdminTierThresholds = async (loading = true): Promise<TierThreshold[]> => {
  const response = await apiClient.get<WrappedResponse<TierThreshold[]>>(
    "admin/tier-thresholds",
    undefined,
    loading,
    QUERY_CONFIG
  );
  const raw = unwrapPayload(response);
  return Array.isArray(raw) ? raw : [];
};

export const createTierThreshold = async (
  data: CreateTierThresholdRequest,
  loading = true
): Promise<TierThreshold> => {
  const response = await apiClient.post<WrappedResponse<TierThreshold>>(
    "admin/tier-thresholds",
    data,
    loading,
    MUTATION_CONFIG
  );
  return unwrapPayload(response) as TierThreshold;
};

export const updateTierThreshold = async (
  id: number,
  data: UpdateTierThresholdRequest,
  loading = true
): Promise<TierThreshold> => {
  const response = await apiClient.put<WrappedResponse<TierThreshold>>(
    `admin/tier-thresholds/${id}`,
    data,
    loading,
    MUTATION_CONFIG
  );
  return unwrapPayload(response) as TierThreshold;
};

export const deactivateTierThreshold = async (id: number, loading = true): Promise<void> => {
  await apiClient.del<unknown>(`admin/tier-thresholds/${id}`, loading, MUTATION_CONFIG);
};
