"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  TierPackage,
  CreateTierPackageRequest,
  UpdateTierPackageRequest,
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

export const getPublicTierPackages = async (loading = true): Promise<TierPackage[]> => {
  const response = await apiClient.get<WrappedResponse<TierPackage[]>>(
    "public/tier-packages",
    undefined,
    loading,
    QUERY_CONFIG
  );
  const raw = unwrapPayload(response);
  return Array.isArray(raw) ? raw : [];
};

export const getPublicTierPackageById = async (
  id: number,
  loading = true
): Promise<TierPackage | null> => {
  const response = await apiClient.get<WrappedResponse<TierPackage>>(
    `public/tier-packages/${id}`,
    undefined,
    loading,
    QUERY_CONFIG
  );
  return unwrapPayload(response) ?? null;
};

export const getAdminTierPackages = async (loading = true): Promise<TierPackage[]> => {
  const response = await apiClient.get<WrappedResponse<TierPackage[]>>(
    "admin/tier-packages",
    undefined,
    loading,
    QUERY_CONFIG
  );
  const raw = unwrapPayload(response);
  return Array.isArray(raw) ? raw : [];
};

export const createTierPackage = async (
  data: CreateTierPackageRequest,
  loading = true
): Promise<TierPackage> => {
  const response = await apiClient.post<WrappedResponse<TierPackage>>(
    "admin/tier-packages",
    data,
    loading,
    MUTATION_CONFIG
  );
  return unwrapPayload(response) as TierPackage;
};

export const updateTierPackage = async (
  id: number,
  data: UpdateTierPackageRequest,
  loading = true
): Promise<TierPackage> => {
  const response = await apiClient.put<WrappedResponse<TierPackage>>(
    `admin/tier-packages/${id}`,
    data,
    loading,
    MUTATION_CONFIG
  );
  return unwrapPayload(response) as TierPackage;
};

export const deactivateTierPackage = async (id: number, loading = true): Promise<void> => {
  await apiClient.del<unknown>(`admin/tier-packages/${id}`, loading, MUTATION_CONFIG);
};
