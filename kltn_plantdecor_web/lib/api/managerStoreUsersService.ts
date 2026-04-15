"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AssignStoreUserSpecializationRequest,
  ReplaceStoreUserSpecializationsRequest,
  StoreUserItem,
  StoreUserListPayload,
  StoreUserListQuery,
  StoreUserSpecializationOption,
} from "@/types/store-management.types";

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

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const toNullableText = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }

  return toText(value);
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

const normalizeSpecialization = (item: unknown): StoreUserItem["specializations"][number] | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    name: toText(item.name),
    description: toText(item.description),
  };
};

const normalizeStaffItem = (item: unknown): StoreUserItem | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const specializations = Array.isArray(item.specializations)
    ? item.specializations
        .map((specialization) => normalizeSpecialization(specialization))
        .filter((specialization): specialization is StoreUserItem["specializations"][number] =>
          Boolean(specialization)
        )
    : [];

  return {
    id,
    username: toText(item.username),
    email: toText(item.email),
    phoneNumber: toText(item.phoneNumber),
    avatarUrl: toNullableText(item.avatarUrl),
    status: toNumber(item.status),
    specializations,
  };
};

const normalizeSpecializationOption = (item: unknown): StoreUserSpecializationOption | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    name: toText(item.name),
    description: toText(item.description),
    isActive: Boolean(item.isActive),
  };
};

const buildPaginationParams = (query?: StoreUserListQuery) => {
  if (!query) {
    return undefined;
  }

  return {
    ...(typeof query.pageNumber === "number" ? { PageNumber: query.pageNumber } : {}),
    ...(typeof query.pageSize === "number" ? { PageSize: query.pageSize } : {}),
  };
};

const toPaginatedPayload = (
  raw: unknown,
  fallbackPageNumber: number,
  fallbackPageSize: number
): StoreUserListPayload => {
  if (Array.isArray(raw)) {
    const allItems = raw
      .map((item) => normalizeStaffItem(item))
      .filter((item): item is StoreUserItem => Boolean(item));

    const totalCount = allItems.length;
    const safePageSize = Math.max(1, fallbackPageSize);
    const safePageNumber = Math.max(1, fallbackPageNumber);
    const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
    const clampedPage = Math.min(safePageNumber, totalPages);
    const start = (clampedPage - 1) * safePageSize;
    const end = start + safePageSize;

    return {
      items: allItems.slice(start, end),
      totalCount,
      pageNumber: clampedPage,
      pageSize: safePageSize,
      totalPages,
      hasPrevious: clampedPage > 1,
      hasNext: clampedPage < totalPages,
    };
  }

  if (!isRecord(raw)) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: fallbackPageNumber,
      pageSize: fallbackPageSize,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    };
  }

  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  const items = itemsRaw
    .map((item) => normalizeStaffItem(item))
    .filter((item): item is StoreUserItem => Boolean(item));

  const totalCount = toNumber(raw.totalCount, items.length);
  const pageNumber = toNumber(raw.pageNumber, fallbackPageNumber);
  const pageSize = toNumber(raw.pageSize, fallbackPageSize);
  const totalPages = toNumber(raw.totalPages, pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0);

  return {
    items,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasPrevious: Boolean(raw.hasPrevious),
    hasNext: Boolean(raw.hasNext),
  };
};

export const getMyNurseryStaffList = async (
  query?: StoreUserListQuery,
  loading = true
): Promise<StoreUserListPayload> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "manager/nurseries/my-nursery/staff",
    buildPaginationParams(query),
    loading,
    QUERY_CONFIG
  );

  const pageNumber = query?.pageNumber ?? 1;
  const pageSize = query?.pageSize ?? 10;
  return toPaginatedPayload(unwrapPayloadData(response), pageNumber, pageSize);
};

export const getMyNurseryStaffDetail = async (staffId: number, loading = true): Promise<StoreUserItem> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `manager/nurseries/my-nursery/staff/${staffId}`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  const normalized = normalizeStaffItem(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Không thể đọc dữ liệu nhân viên");
  }

  return normalized;
};

export const assignSpecializationToStaff = async (
  staffId: number,
  request: AssignStoreUserSpecializationRequest,
  loading = true
): Promise<StoreUserItem> => {
  const response = await apiClient.post<WrappedResponse<unknown>>(
    `manager/nurseries/my-nursery/staff/${staffId}/specializations`,
    request,
    loading,
    MUTATION_CONFIG
  );

  const normalized = normalizeStaffItem(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Không thể gán chuyên môn cho nhân viên");
  }

  return normalized;
};

export const replaceStaffSpecializations = async (
  staffId: number,
  request: ReplaceStoreUserSpecializationsRequest,
  loading = true
): Promise<StoreUserItem> => {
  const response = await apiClient.put<WrappedResponse<unknown>>(
    `manager/nurseries/my-nursery/staff/${staffId}/specializations`,
    request,
    loading,
    MUTATION_CONFIG
  );

  const normalized = normalizeStaffItem(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Không thể cập nhật chuyên môn cho nhân viên");
  }

  return normalized;
};

export const getActiveSpecializationsForStaff = async (loading = true): Promise<StoreUserSpecializationOption[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "specializations",
    undefined,
    loading,
    QUERY_CONFIG
  );

  const raw = unwrapPayloadData(response);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeSpecializationOption(item))
    .filter((item): item is StoreUserSpecializationOption => Boolean(item))
    .filter((item) => item.isActive);
};
