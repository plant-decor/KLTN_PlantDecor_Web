"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  ManagerCreateNurseryDesignTemplateRequest,
  ManagerNotOfferedDesignTemplate,
  ManagerNurseryDesignTemplateListItem,
} from "@/types/manager-design-template.types";

type WrappedResponse<T> = ResponseModel<T> | T;

const QUERY_CONFIG = { showToast: false, showErrorToast: false };
const MUTATION_CONFIG = { showToast: false, showErrorToast: false };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value: unknown, fallback = ""): string => typeof value === "string" ? value : fallback;

const toBoolean = (value: unknown, fallback = false): boolean => typeof value === "boolean" ? value : fallback;

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

const normalizeMapping = (value: unknown): ManagerNurseryDesignTemplateListItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    nurseryId: toNumber(value.nurseryId),
    nurseryName: toText(value.nurseryName),
    designTemplateId: toNumber(value.designTemplateId),
    designTemplateName: toText(value.designTemplateName),
    isActive: toBoolean(value.isActive, true),
    createdAt: toText(value.createdAt) || undefined,
  };
};

const normalizeTemplate = (value: unknown): ManagerNotOfferedDesignTemplate | null => {
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
    description: toText(value.description),
    imageUrl: toText(value.imageUrl),
  };
};

export const getMyNurseryDesignTemplates = async (activeOnly = false, loading = true): Promise<ManagerNurseryDesignTemplateListItem[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>("/api/manager/nursery-design-templates/my", { activeOnly }, loading, QUERY_CONFIG);
  const unwrapped = unwrapPayloadData(response);
  return Array.isArray(unwrapped) ? unwrapped.map(normalizeMapping).filter((item): item is ManagerNurseryDesignTemplateListItem => Boolean(item)) : [];
};

export const getNotOfferedDesignTemplates = async (loading = true): Promise<ManagerNotOfferedDesignTemplate[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>("/api/manager/nursery-design-templates/not-offered-templates", undefined, loading, QUERY_CONFIG);
  const unwrapped = unwrapPayloadData(response);
  return Array.isArray(unwrapped) ? unwrapped.map(normalizeTemplate).filter((item): item is ManagerNotOfferedDesignTemplate => Boolean(item)) : [];
};

export const createNurseryDesignTemplate = async (
  payload: ManagerCreateNurseryDesignTemplateRequest,
  loading = true
): Promise<ManagerNurseryDesignTemplateListItem> => {
  const response = await apiClient.post<WrappedResponse<unknown>>("/api/manager/nursery-design-templates", payload, loading, MUTATION_CONFIG);
  const mapping = normalizeMapping(unwrapPayloadData(response));
  return mapping ?? {
    id: 0,
    nurseryId: 0,
    nurseryName: "",
    designTemplateId: payload.designTemplateId,
    designTemplateName: "",
    isActive: true,
  };
};

export const toggleNurseryDesignTemplate = async (id: number, loading = true): Promise<ManagerNurseryDesignTemplateListItem> => {
  const response = await apiClient.patch<WrappedResponse<unknown>>(`/api/manager/nursery-design-templates/${id}/toggle`, undefined, loading, MUTATION_CONFIG);
  const mapping = normalizeMapping(unwrapPayloadData(response));
  return mapping ?? {
    id,
    nurseryId: 0,
    nurseryName: "",
    designTemplateId: 0,
    designTemplateName: "",
    isActive: false,
  };
};

export const deleteNurseryDesignTemplate = async (id: number, loading = true): Promise<void> => {
  await apiClient.del<WrappedResponse<unknown>>(`/api/manager/nursery-design-templates/${id}`, loading, MUTATION_CONFIG);
};
