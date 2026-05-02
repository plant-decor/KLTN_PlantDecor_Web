"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AdminCareServicePackageCreateRequest,
  AdminCareServicePackageDetail,
  AdminCareServicePackageListItem,
  AdminCareServicePackageSuitabilityRuleCreateRequest,
  AdminCareServicePackageUpdateRequest,
  AdminSpecializationOption,
  CareServiceTypeOption,
  AdminCareServicePackageSuitabilityRule,
} from "@/types/admin-service-package.types";

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

export const unwrapPayloadData = <T>(response: WrappedResponse<T>): T => {
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

const normalizePackageItem = (item: unknown): AdminCareServicePackageListItem | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const serviceTypeLabel =
    toText(item.serviceTypeLabel) || toText(item.serviceTypeName) || toText(item.serviceTypeDisplayName);

  return {
    id,
    name: toText(item.name),
    description: toText(item.description),
    features: toText(item.features),
    serviceType: toNumber(item.serviceType),
    serviceTypeLabel: serviceTypeLabel || undefined,
    visitPerWeek: item.visitPerWeek == null ? null : toNumber(item.visitPerWeek),
    durationDays: toNumber(item.durationDays),
    totalSessions: item.totalSessions == null ? null : toNumber(item.totalSessions),
    areaLimit: toNumber(item.areaLimit),
    unitPrice: toNumber(item.unitPrice),
    isActive: toBoolean(item.isActive, false),
    createdAt: toText(item.createdAt) || undefined,
    updatedAt: toText(item.updatedAt) || undefined,
  };
};

const normalizeSpecializationItem = (item: unknown): AdminSpecializationOption | null => {
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
    description: toText(item.description) || undefined,
    isActive: toBoolean(item.isActive, true),
  };
};

const normalizeSuitabilityRuleItem = (item: unknown): AdminCareServicePackageSuitabilityRule | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = item.id == null ? undefined : toNumber(item.id, NaN);
  const careServicePackageId =
    item.careServicePackageId == null ? undefined : toNumber(item.careServicePackageId, NaN);

  const categoryIdRaw = item.categoryId == null ? null : toNumber(item.categoryId, NaN);
  const categoryId = categoryIdRaw != null && Number.isFinite(categoryIdRaw) ? categoryIdRaw : null;

  const careDifficultyRaw = item.careDifficultyLevel == null ? null : toNumber(item.careDifficultyLevel, NaN);
  const careDifficultyLevel =
    careDifficultyRaw != null && Number.isFinite(careDifficultyRaw) ? careDifficultyRaw : null;

  return {
    id: id != null && Number.isFinite(id) ? id : undefined,
    careServicePackageId:
      careServicePackageId != null && Number.isFinite(careServicePackageId) ? careServicePackageId : undefined,
    categoryId,
    categoryName: item.categoryName == null ? null : toText(item.categoryName) || null,
    careDifficultyLevel,
    careDifficultyLevelName: item.careDifficultyLevelName == null ? null : toText(item.careDifficultyLevelName) || null,
  };
};

const normalizeDetail = (raw: unknown): AdminCareServicePackageDetail => {
  const base = normalizePackageItem(raw);

  if (!base) {
    return {
      id: 0,
      name: "",
      description: "",
      features: "",
      serviceType: 0,
      visitPerWeek: null,
      durationDays: 0,
      totalSessions: null,
      areaLimit: 0,
      unitPrice: 0,
      isActive: false,
      specializationIds: [],
      specializations: [],
      suitabilityRules: [],
    };
  }

  const source = isRecord(raw) ? raw : {};
  const specializationIds = Array.isArray(source.specializationIds)
    ? source.specializationIds.map((value) => toNumber(value, NaN)).filter((value) => Number.isFinite(value))
    : [];

  const specializationRaw = Array.isArray(source.specializations)
    ? source.specializations
    : Array.isArray(source.specializationDetails)
      ? source.specializationDetails
      : [];

  const specializations = specializationRaw
    .map(normalizeSpecializationItem)
    .filter((item): item is AdminSpecializationOption => Boolean(item));

  const suitabilityRulesRaw = Array.isArray(source.suitabilityRules) ? source.suitabilityRules : [];
  const suitabilityRules = suitabilityRulesRaw
    .map(normalizeSuitabilityRuleItem)
    .filter((item): item is AdminCareServicePackageSuitabilityRule => Boolean(item));

  return {
    ...base,
    specializationIds,
    specializations,
    suitabilityRules,
  };
};

const normalizeServiceTypeOptions = (raw: unknown): CareServiceTypeOption[] => {
  const unwrapped = unwrapPayloadData(raw as WrappedResponse<unknown>);

  if (Array.isArray(unwrapped)) {
    const directValues = unwrapped
      .map((item) => {
        if (!isRecord(item)) {
          return null;
        }

        const value = toNumber(item.value ?? item.id ?? item.key, NaN);
        if (!Number.isFinite(value)) {
          return null;
        }

        const label = toText(item.label) || toText(item.name) || toText(item.displayName) || String(value);
        return { value, label };
      })
      .filter((item): item is CareServiceTypeOption => Boolean(item));

    if (directValues.length > 0) {
      return directValues;
    }

    return unwrapped
      .flatMap((item) => {
        if (!isRecord(item) || !Array.isArray(item.values)) {
          return [];
        }

        return item.values
          .map((valueItem) => {
            if (!isRecord(valueItem)) {
              return null;
            }

            const value = toNumber(valueItem.value ?? valueItem.id ?? valueItem.key, NaN);
            if (!Number.isFinite(value)) {
              return null;
            }

            const label =
              toText(valueItem.label) ||
              toText(valueItem.name) ||
              toText(valueItem.displayName) ||
              String(value);

            return { value, label };
          })
          .filter((option): option is CareServiceTypeOption => Boolean(option));
      });
  }

  if (isRecord(unwrapped)) {
    return Object.entries(unwrapped)
      .map(([key, value]) => {
        const numeric = toNumber(value, NaN);
        if (!Number.isFinite(numeric)) {
          return null;
        }

        return {
          value: numeric,
          label: key,
        };
      })
      .filter((item): item is CareServiceTypeOption => Boolean(item));
  }

  return [];
};

const normalizeSpecializations = (raw: unknown): AdminSpecializationOption[] => {
  const unwrapped = unwrapPayloadData(raw as WrappedResponse<unknown>);

  const list = Array.isArray(unwrapped)
    ? unwrapped
    : isRecord(unwrapped) && Array.isArray(unwrapped.items)
      ? unwrapped.items
      : [];

  return list
    .map(normalizeSpecializationItem)
    .filter((item): item is AdminSpecializationOption => Boolean(item));
};

export const getAllAdminCareServicePackages = async (
  loading = true
): Promise<AdminCareServicePackageListItem[]> => {
  const response = await apiClient.get<
    WrappedResponse<AdminCareServicePackageListItem[]> | unknown
  >("care-service-packages/all", undefined, loading, QUERY_CONFIG);

  const raw = unwrapPayloadData(response as WrappedResponse<unknown>);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(normalizePackageItem)
    .filter((item): item is AdminCareServicePackageListItem => Boolean(item));
};

export const getAdminCareServicePackageDetail = async (
  id: number,
  loading = true
): Promise<AdminCareServicePackageDetail> => {
  const response = await apiClient.get<
    WrappedResponse<AdminCareServicePackageDetail> | unknown
  >(`care-service-packages/${id}`, undefined, loading, QUERY_CONFIG);

  const raw = unwrapPayloadData(response as WrappedResponse<unknown>);
  return normalizeDetail(raw);
};

export const createAdminCareServicePackage = async (
  data: AdminCareServicePackageCreateRequest,
  loading = true
): Promise<AdminCareServicePackageDetail> => {
  const response = await apiClient.post<
    WrappedResponse<AdminCareServicePackageDetail> | unknown
  >("care-service-packages", data, loading, MUTATION_CONFIG);

  const raw = unwrapPayloadData(response as WrappedResponse<unknown>);
  return normalizeDetail(raw);
};

export const updateAdminCareServicePackage = async (
  id: number,
  data: AdminCareServicePackageUpdateRequest,
  loading = true
): Promise<AdminCareServicePackageDetail> => {
  const response = await apiClient.put<
    WrappedResponse<AdminCareServicePackageDetail> | unknown
  >(`care-service-packages/${id}`, data, loading, MUTATION_CONFIG);

  const raw = unwrapPayloadData(response as WrappedResponse<unknown>);
  return normalizeDetail(raw);
};

export const updateAdminCareServicePackageSpecializations = async (
  id: number,
  specializationIds: number[],
  loading = true
): Promise<AdminCareServicePackageDetail> => {
  const response = await apiClient.put<WrappedResponse<AdminCareServicePackageDetail> | unknown>(
    `care-service-packages/${id}/specializations`,
    { specializationIds },
    loading,
    MUTATION_CONFIG
  );

  const raw = unwrapPayloadData(response as WrappedResponse<unknown>);
  return normalizeDetail(raw);
};

export const updateAdminCareServicePackageSuitabilityRules = async (
  id: number,
  suitabilityRules: AdminCareServicePackageSuitabilityRuleCreateRequest[],
  loading = true
): Promise<AdminCareServicePackageDetail> => {
  const response = await apiClient.put<WrappedResponse<AdminCareServicePackageDetail> | unknown>(
    `care-service-packages/${id}/suitability-rules`,
    { suitabilityRules },
    loading,
    MUTATION_CONFIG
  );

  const raw = unwrapPayloadData(response as WrappedResponse<unknown>);
  return normalizeDetail(raw);
};

export const deleteAdminCareServicePackage = async (id: number, loading = true): Promise<void> => {
  await apiClient.del<unknown>(`care-service-packages/${id}`, loading, MUTATION_CONFIG);
};

export const getCareServiceTypeOptions = async (loading = true): Promise<CareServiceTypeOption[]> => {
  const response = await apiClient.get<unknown>(
    "system/enums/care-services",
    undefined,
    loading,
    QUERY_CONFIG
  );

  return normalizeServiceTypeOptions(response);
};

export const getActiveSpecializations = async (loading = true): Promise<AdminSpecializationOption[]> => {
  const response = await apiClient.get<unknown>("specializations", undefined, loading, QUERY_CONFIG);

  return normalizeSpecializations(response).filter((item) => item.isActive);
};
