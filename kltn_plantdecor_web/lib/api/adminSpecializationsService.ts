"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AdminSpecializationCreateRequest,
  AdminSpecializationDetail,
  AdminSpecializationListItem,
  AdminSpecializationUpdateRequest,
} from "@/types/admin-specialization.types";

const QUERY_CONFIG = {
  showToast: false,
  showErrorToast: false,
};

const MUTATION_CONFIG = {
  showToast: false,
  showErrorToast: false,
};

type WrappedResponse<T> = ResponseModel<T> | T;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const unwrapPayloadData = <T>(response: WrappedResponse<T>): T => {
  if (!isRecord(response)) {
    return response as T;
  }

  if ("payload" in response && response.payload !== undefined) {
    return response.payload as T;
  }

  if ("data" in response && response.data !== undefined) {
    return response.data as T;
  }

  return response as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toText = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  return typeof value === "boolean" ? value : fallback;
};

const normalizeSpecializationItem = (item: unknown): AdminSpecializationListItem | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    name: toText(item.name),
    description: toText(item.description),
    isActive: toBoolean(item.isActive, false),
  };
};

const normalizeDetail = (raw: unknown): AdminSpecializationDetail => {
  const base = normalizeSpecializationItem(raw);

  if (!base) {
    return {
      id: 0,
      name: "",
      description: "",
      isActive: false,
    };
  }

  const source = isRecord(raw) ? raw : {};

  return {
    ...base,
    createdAt: toText(source.createdAt) || undefined,
    updatedAt: toText(source.updatedAt) || undefined,
  };
};

const normalizeSpecializationList = (raw: unknown): AdminSpecializationListItem[] => {
  const unwrapped = unwrapPayloadData(raw as WrappedResponse<unknown>);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : isRecord(unwrapped) && Array.isArray(unwrapped.items)
      ? unwrapped.items
      : [];

  return list
    .map(normalizeSpecializationItem)
    .filter((item): item is AdminSpecializationListItem => Boolean(item));
};

export const getAllAdminSpecializations = async (loading = true): Promise<AdminSpecializationListItem[]> => {
  const response = await apiClient.get<WrappedResponse<AdminSpecializationListItem[]> | unknown>(
    "/admin/specializations",
    undefined,
    loading,
    QUERY_CONFIG
  );

  return normalizeSpecializationList(response);
};

export const getAdminSpecializationDetail = async (
  id: number,
  loading = true
): Promise<AdminSpecializationDetail> => {
  const response = await apiClient.get<WrappedResponse<AdminSpecializationDetail> | unknown>(
    `/admin/specializations/${id}`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  const raw = unwrapPayloadData(response as WrappedResponse<unknown>);
  return normalizeDetail(raw);
};

export const createAdminSpecialization = async (
  data: AdminSpecializationCreateRequest,
  loading = true
): Promise<AdminSpecializationDetail> => {
  const response = await apiClient.post<WrappedResponse<AdminSpecializationDetail> | unknown>(
    "/admin/specializations",
    data,
    loading,
    MUTATION_CONFIG
  );

  const raw = unwrapPayloadData(response as WrappedResponse<unknown>);
  return normalizeDetail(raw);
};

export const updateAdminSpecialization = async (
  id: number,
  data: AdminSpecializationUpdateRequest,
  loading = true
): Promise<AdminSpecializationDetail> => {
  const response = await apiClient.put<WrappedResponse<AdminSpecializationDetail> | unknown>(
    `/admin/specializations/${id}`,
    data,
    loading,
    MUTATION_CONFIG
  );

  const raw = unwrapPayloadData(response as WrappedResponse<unknown>);
  return normalizeDetail(raw);
};

export const deleteAdminSpecialization = async (id: number, loading = true): Promise<void> => {
  await apiClient.del<unknown>(`/admin/specializations/${id}`, loading, MUTATION_CONFIG);
};
