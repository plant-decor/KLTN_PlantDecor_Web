"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AdminDesignTemplateCreateRequest,
  AdminDesignTemplateDetail,
  AdminDesignTemplateListItem,
  AdminDesignTemplateTierCreateRequest,
  AdminDesignTemplateTierUpdateRequest,
  AdminDesignTemplateUpdateRequest,
  DesignTemplateNurseryOffering,
  DesignTemplateSpecialization,
  DesignTemplateTier,
  DesignTemplateTierItem,
} from "@/types/admin-design-template.types";

type WrappedResponse<T> = ResponseModel<T> | T;

const QUERY_CONFIG = { showToast: false, showErrorToast: false };
const MUTATION_CONFIG = { showToast: false, showErrorToast: false };

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

const toBoolean = (value: unknown, fallback = false): boolean => {
  return typeof value === "boolean" ? value : fallback;
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

const normalizeSpecialization = (value: unknown): DesignTemplateSpecialization | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    name: toText(value.name),
    description: toText(value.description) || undefined,
  };
};

const normalizeTierItem = (value: unknown): DesignTemplateTierItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.id == null ? undefined : toNumber(value.id, Number.NaN);
  const designTemplateTierId = value.designTemplateTierId == null ? undefined : toNumber(value.designTemplateTierId, Number.NaN);

  return {
    id: id != null && Number.isFinite(id) ? id : undefined,
    designTemplateTierId: designTemplateTierId != null && Number.isFinite(designTemplateTierId) ? designTemplateTierId : undefined,
    materialId: value.materialId == null ? null : toNumber(value.materialId),
    plantId: value.plantId == null ? null : toNumber(value.plantId),
    itemType: toNumber(value.itemType),
    quantity: toNumber(value.quantity, 1),
    createdAt: toText(value.createdAt) || undefined,
  };
};

const normalizeTier = (value: unknown): DesignTemplateTier | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    designTemplateId: toNumber(value.designTemplateId),
    tierName: toText(value.tierName),
    minArea: toNumber(value.minArea),
    maxArea: toNumber(value.maxArea),
    packagePrice: toNumber(value.packagePrice),
    scopedOfWork: toText(value.scopedOfWork),
    estimatedDays: toNumber(value.estimatedDays),
    isActive: toBoolean(value.isActive, true),
    createdAt: toText(value.createdAt) || undefined,
    updatedAt: toText(value.updatedAt) || undefined,
    items: Array.isArray(value.items) ? value.items.map(normalizeTierItem).filter((item): item is DesignTemplateTierItem => Boolean(item)) : [],
  };
};

const normalizeNurseryOffering = (value: unknown): DesignTemplateNurseryOffering | null => {
  if (!isRecord(value)) {
    return null;
  }

  const nurseryId = toNumber(value.nurseryId, Number.NaN);
  if (!Number.isFinite(nurseryId)) {
    return null;
  }

  return {
    id: value.id == null ? undefined : toNumber(value.id),
    nurseryDesignTemplateId: value.nurseryDesignTemplateId == null ? undefined : toNumber(value.nurseryDesignTemplateId),
    nurseryId,
    nurseryName: toText(value.nurseryName),
    designTemplateId: value.designTemplateId == null ? undefined : toNumber(value.designTemplateId),
    designTemplateName: toText(value.designTemplateName) || undefined,
    isActive: toBoolean(value.isActive, true),
    createdAt: toText(value.createdAt) || undefined,
  };
};

const normalizeTemplate = (value: unknown): AdminDesignTemplateListItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const specializationsRaw = Array.isArray(value.specializations) ? value.specializations : [];
  const tiersRaw = Array.isArray(value.tiers) ? value.tiers : [];
  const nurseryOfferingsRaw = Array.isArray(value.nurseryOfferings) ? value.nurseryOfferings : [];

  return {
    id,
    name: toText(value.name),
    description: toText(value.description),
    style: toNumber(value.style),
    imageUrl: toText(value.imageUrl),
    roomTypes: Array.isArray(value.roomTypes) ? value.roomTypes.map((item) => toNumber(item)).filter((item) => Number.isFinite(item)) : [],
    isActive: value.isActive == null ? undefined : toBoolean(value.isActive),
    createdAt: toText(value.createdAt) || undefined,
    updatedAt: toText(value.updatedAt) || undefined,
    specializations: specializationsRaw.map(normalizeSpecialization).filter((item): item is DesignTemplateSpecialization => Boolean(item)),
    tiers: tiersRaw.map(normalizeTier).filter((item): item is DesignTemplateTier => Boolean(item)),
    nurseryOfferings: nurseryOfferingsRaw.map(normalizeNurseryOffering).filter((item): item is DesignTemplateNurseryOffering => Boolean(item)),
  };
};

const normalizeTemplates = (raw: unknown): AdminDesignTemplateListItem[] => {
  const unwrapped = unwrapPayloadData(raw as WrappedResponse<unknown>);
  const list = Array.isArray(unwrapped) ? unwrapped : [];
  return list.map(normalizeTemplate).filter((item): item is AdminDesignTemplateListItem => Boolean(item));
};

const normalizeTemplateDetail = (raw: unknown): AdminDesignTemplateDetail => {
  const unwrapped = unwrapPayloadData(raw as WrappedResponse<unknown>);
  const template = normalizeTemplate(unwrapped);

  if (!template) {
    return {
      id: 0,
      name: "",
      description: "",
      style: 0,
      imageUrl: "",
      roomTypes: [],
      tiers: [],
      specializations: [],
      nurseryOfferings: [],
    };
  }

  return {
    ...template,
    tiers: template.tiers,
    specializations: template.specializations,
    nurseryOfferings: template.nurseryOfferings ?? [],
  };
};

export const getAdminDesignTemplates = async (loading = true): Promise<AdminDesignTemplateListItem[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>("public/design-templates", undefined, loading, QUERY_CONFIG);
  return normalizeTemplates(response);
};

export const getAdminDesignTemplateDetail = async (
  id: number,
  loading = true
): Promise<AdminDesignTemplateDetail> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(`public/design-templates/${id}`, undefined, loading, QUERY_CONFIG);
  return normalizeTemplateDetail(response);
};

export const getActiveDesignTemplateSpecializations = async (loading = true): Promise<DesignTemplateSpecialization[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>('specializations', undefined, loading, QUERY_CONFIG);
  const unwrapped = unwrapPayloadData(response);
  const list = Array.isArray(unwrapped) ? unwrapped : [];
  return list
    .map(normalizeSpecialization)
    .filter((item): item is DesignTemplateSpecialization => Boolean(item));
};

export const createAdminDesignTemplate = async (
  payload: AdminDesignTemplateCreateRequest,
  loading = true
): Promise<AdminDesignTemplateDetail> => {
  const response = await apiClient.post<WrappedResponse<unknown>>("admin/design-templates", payload, loading, MUTATION_CONFIG);
  return normalizeTemplateDetail(response);
};

export const updateAdminDesignTemplate = async (
  id: number,
  payload: AdminDesignTemplateUpdateRequest,
  loading = true
): Promise<AdminDesignTemplateDetail> => {
  const response = await apiClient.put<WrappedResponse<unknown>>(`admin/design-templates/${id}`, payload, loading, MUTATION_CONFIG);
  return normalizeTemplateDetail(response);
};

export const deleteAdminDesignTemplate = async (id: number, loading = true): Promise<void> => {
  await apiClient.del<WrappedResponse<unknown>>(`admin/design-templates/${id}`, loading, MUTATION_CONFIG);
};

export const getAdminDesignTemplateTiers = async (
  designTemplateId: number,
  includeInactive = false,
  loading = true
): Promise<DesignTemplateTier[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "public/design-template-tiers",
    { designTemplateId, includeInactive },
    loading,
    QUERY_CONFIG
  );

  const unwrapped = unwrapPayloadData(response);
  return Array.isArray(unwrapped) ? unwrapped.map(normalizeTier).filter((item): item is DesignTemplateTier => Boolean(item)) : [];
};

export const getAdminDesignTemplateTierDetail = async (id: number, loading = true): Promise<DesignTemplateTier> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(`/public/design-template-tiers/${id}`, undefined, loading, QUERY_CONFIG);
  const tier = normalizeTier(unwrapPayloadData(response));
  return tier ?? {
    id: 0,
    designTemplateId: 0,
    tierName: "",
    minArea: 0,
    maxArea: 0,
    packagePrice: 0,
    scopedOfWork: "",
    estimatedDays: 0,
    isActive: false,
    items: [],
  };
};

export const createAdminDesignTemplateTier = async (
  payload: AdminDesignTemplateTierCreateRequest,
  loading = true
): Promise<DesignTemplateTier> => {
  const response = await apiClient.post<WrappedResponse<unknown>>("admin/design-template-tiers", payload, loading, MUTATION_CONFIG);
  const tier = normalizeTier(unwrapPayloadData(response));
  return tier ?? {
    id: 0,
    designTemplateId: payload.designTemplateId,
    tierName: payload.tierName,
    minArea: payload.minArea,
    maxArea: payload.maxArea,
    packagePrice: payload.packagePrice,
    scopedOfWork: payload.scopedOfWork,
    estimatedDays: payload.estimatedDays,
    isActive: payload.isActive,
    items: [],
  };
};

export const updateAdminDesignTemplateTier = async (
  id: number,
  payload: AdminDesignTemplateTierUpdateRequest,
  loading = true
): Promise<DesignTemplateTier> => {
  const response = await apiClient.put<WrappedResponse<unknown>>(`admin/design-template-tiers/${id}`, payload, loading, MUTATION_CONFIG);
  const tier = normalizeTier(unwrapPayloadData(response));
  return tier ?? {
    id,
    designTemplateId: 0,
    tierName: payload.tierName,
    minArea: payload.minArea,
    maxArea: payload.maxArea,
    packagePrice: payload.packagePrice,
    scopedOfWork: payload.scopedOfWork,
    estimatedDays: payload.estimatedDays,
    isActive: payload.isActive,
    items: [],
  };
};

export const deactivateAdminDesignTemplateTier = async (id: number, loading = true): Promise<void> => {
  await apiClient.del<WrappedResponse<unknown>>(`admin/design-template-tiers/${id}`, loading, MUTATION_CONFIG);
};
