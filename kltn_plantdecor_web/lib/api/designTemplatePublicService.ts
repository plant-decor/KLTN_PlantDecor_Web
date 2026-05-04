"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type { MarketedDesignTemplate, MarketedDesignTemplateTier, MarketedDesignTemplateTierNursery } from "@/types/design-registration.types";

type WrappedResponse<T> = ResponseModel<T> | T;

const QUERY_CONFIG = { showToast: false, showErrorToast: false };

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

const normalizeTierItem = (value: unknown) => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    designTemplateTierId: toNumber(value.designTemplateTierId),
    materialId: value.materialId == null ? null : toNumber(value.materialId),
    plantId: value.plantId == null ? null : toNumber(value.plantId),
    itemType: toNumber(value.itemType),
    quantity: toNumber(value.quantity),
    createdAt: toText(value.createdAt) || undefined,
  };
};

const normalizeTier = (value: unknown): MarketedDesignTemplateTier | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const items = Array.isArray(value.items) ? value.items : [];

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
    items: items.map(normalizeTierItem).filter((item): item is NonNullable<ReturnType<typeof normalizeTierItem>> => Boolean(item)),
  };
};

const normalizeNursery = (value: unknown): MarketedDesignTemplateTierNursery | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.id == null ? undefined : toNumber(value.id, Number.NaN);
  const nurseryId = toNumber(value.nurseryId, Number.NaN);
  const designTemplateId = toNumber(value.designTemplateId, Number.NaN);

  if (!Number.isFinite(nurseryId) || !Number.isFinite(designTemplateId)) {
    return null;
  }

  return {
    id: id != null && Number.isFinite(id) ? id : 0,
    nurseryId,
    nurseryName: toText(value.nurseryName),
    designTemplateId,
    designTemplateName: toText(value.designTemplateName),
    isActive: toBoolean(value.isActive, true),
    createdAt: toText(value.createdAt) || undefined,
  };
};

const normalizeTemplate = (value: unknown): MarketedDesignTemplate | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const specializations = Array.isArray(value.specializations)
    ? value.specializations
      .map((item) => {
        if (!isRecord(item)) {
          return null;
        }

        const specializationId = toNumber(item.id, Number.NaN);
        if (!Number.isFinite(specializationId)) {
          return null;
        }

        return {
          id: specializationId,
          name: toText(item.name),
          description: toText(item.description) || undefined,
        };
      })
      .filter((item): item is { id: number; name: string; description: string | undefined } => Boolean(item))
    : [];

  return {
    id,
    name: toText(value.name),
    description: toText(value.description),
    style: toNumber(value.style),
    roomTypes: Array.isArray(value.roomTypes) ? value.roomTypes.map((item) => toNumber(item)).filter((item) => Number.isFinite(item)) : [],
    imageUrl: toText(value.imageUrl),
    createdAt: toText(value.createdAt) || undefined,
    updatedAt: toText(value.updatedAt) || undefined,
    specializations,
    tiers: Array.isArray(value.tiers) ? value.tiers.map(normalizeTier).filter((item): item is MarketedDesignTemplateTier => Boolean(item)) : [],
    nurseryOfferings: Array.isArray(value.nurseryOfferings)
      ? value.nurseryOfferings.map(normalizeNursery).filter((item): item is MarketedDesignTemplateTierNursery => Boolean(item))
      : [],
  };
};

export const getMarketedDesignTemplates = async (loading = true): Promise<MarketedDesignTemplate[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>("/public/design-templates", undefined, loading, QUERY_CONFIG);
  const unwrapped = unwrapPayloadData(response);
  return Array.isArray(unwrapped) ? unwrapped.map(normalizeTemplate).filter((item): item is MarketedDesignTemplate => Boolean(item)) : [];
};

export const getMarketedDesignTemplateTiers = async (loading = true): Promise<MarketedDesignTemplateTier[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>("/public/design-template-tiers/marketed", undefined, loading, QUERY_CONFIG);
  const unwrapped = unwrapPayloadData(response);
  return Array.isArray(unwrapped) ? unwrapped.map(normalizeTier).filter((item): item is MarketedDesignTemplateTier => Boolean(item)) : [];
};

export const getDesignTemplateTiers = async (
  designTemplateId: number,
  includeInactive = false,
  loading = true
): Promise<MarketedDesignTemplateTier[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "/public/design-template-tiers",
    { designTemplateId, includeInactive },
    loading,
    QUERY_CONFIG
  );
  const unwrapped = unwrapPayloadData(response);
  return Array.isArray(unwrapped) ? unwrapped.map(normalizeTier).filter((item): item is MarketedDesignTemplateTier => Boolean(item)) : [];
};

export const getDesignTemplateTierNurseries = async (id: number, loading = true): Promise<MarketedDesignTemplateTierNursery[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(`/public/design-template-tiers/${id}/nurseries`, undefined, loading, QUERY_CONFIG);
  const unwrapped = unwrapPayloadData(response);
  return Array.isArray(unwrapped) ? unwrapped.map(normalizeNursery).filter((item): item is MarketedDesignTemplateTierNursery => Boolean(item)) : [];
};
