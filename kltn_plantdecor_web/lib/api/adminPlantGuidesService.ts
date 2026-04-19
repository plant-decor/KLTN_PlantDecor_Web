"use client";

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  AdminLightRequirementGroup,
  AdminLightRequirementOption,
  AdminPlantGuideDetail,
  AdminPlantGuideListPayload,
  AdminPlantGuideSearchRequest,
  AdminPlantGuideUpsertRequest,
} from '@/types/admin-plant-guide.types';

export interface SystemEnumOption {
  value: number;
  name: string;
}

export interface SystemEnumGroup {
  enumName: string;
  values: SystemEnumOption[];
}

interface RoomDesignEnumPayload {
  roomTypes: SystemEnumOption[];
  roomStyles: SystemEnumOption[];
  lightRequirements: SystemEnumOption[];
}

type WrappedResponse<T> = ResponseModel<T> | T;

const getResponsePayload = <T,>(response: WrappedResponse<T>): T | undefined => {
  if (response && typeof response === 'object') {
    const payload = response as { payload?: T; data?: T };
    return payload.payload ?? payload.data ?? (response as T);
  }

  return response as T;
};

export const getAdminPlantGuides = async (
  params: AdminPlantGuideSearchRequest,
  loading = true
): Promise<ResponseModel<AdminPlantGuideListPayload>> => {
  return apiClient.get('/admin/PlantGuides', params, loading, { showToast: false, showErrorToast: false });
};

export const getAdminPlantGuideById = async (
  id: number,
  loading = true
): Promise<ResponseModel<AdminPlantGuideDetail>> => {
  return apiClient.get(`/admin/PlantGuides/${id}`, undefined, loading, { showToast: false, showErrorToast: false });
};

export const getAdminPlantGuideByPlantId = async (
  plantId: number,
  loading = true
): Promise<ResponseModel<AdminPlantGuideDetail | null>> => {
  try {
    return await apiClient.get(`/plants/${plantId}/guide`, undefined, loading, { showToast: false, showErrorToast: false });
  } catch (error) {
    if (error instanceof Error && /status 404/i.test(error.message)) {
      return { payload: null } as ResponseModel<AdminPlantGuideDetail | null>;
    }

    throw error;
  }
};

export const createAdminPlantGuide = async (
  data: AdminPlantGuideUpsertRequest,
  loading = true
): Promise<ResponseModel<AdminPlantGuideDetail>> => {
  return apiClient.post('/admin/PlantGuides', data, loading, { showToast: true, showErrorToast: true });
};

export const updateAdminPlantGuide = async (
  id: number,
  data: AdminPlantGuideUpsertRequest,
  loading = true
): Promise<ResponseModel<AdminPlantGuideDetail>> => {
  return apiClient.patch(`/admin/PlantGuides/${id}`, data, loading, { showToast: true, showErrorToast: true });
};

export const deleteAdminPlantGuide = async (
  id: number,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.del(`/admin/PlantGuides/${id}`, loading, { showToast: false, showErrorToast: false });
};

export const getLightRequirementOptions = async (
  loading = true
): Promise<ResponseModel<AdminLightRequirementGroup>> => {
  return apiClient.get('/system/enums/LightRequirement', undefined, loading, { showToast: false, showErrorToast: false });
};

const normalizeLightRequirementGroup = (group?: AdminLightRequirementGroup | null): AdminLightRequirementOption[] => {
  return group?.values ?? [];
};

const normalizeSystemEnumOptions = (raw: unknown): SystemEnumOption[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const option = item as { value?: unknown; name?: unknown };
      const value = Number(option.value);
      if (!Number.isFinite(value) || typeof option.name !== 'string') {
        return null;
      }

      return {
        value,
        name: option.name,
      };
    })
    .filter((item): item is SystemEnumOption => Boolean(item));
};

export const getRoomDesignEnums = async (loading = true): Promise<ResponseModel<SystemEnumGroup[]>> => {
  return apiClient.get('/system/enums/room-design', undefined, loading, {
    showToast: false,
    showErrorToast: false,
  });
};

export const fetchRoomDesignEnumOptions = async (loading = true): Promise<RoomDesignEnumPayload> => {
  const response = await getRoomDesignEnums(loading);
  const payload = getResponsePayload(response) ?? [];

  const groups = Array.isArray(payload) ? payload : [];
  const groupMap = new Map<string, SystemEnumOption[]>();

  groups.forEach((group) => {
    if (!group || typeof group !== 'object') {
      return;
    }

    const candidate = group as { enumName?: unknown; values?: unknown };
    if (typeof candidate.enumName !== 'string') {
      return;
    }

    groupMap.set(candidate.enumName, normalizeSystemEnumOptions(candidate.values));
  });

  return {
    roomTypes: groupMap.get('RoomType') ?? [],
    roomStyles: groupMap.get('RoomStyle') ?? [],
    lightRequirements: groupMap.get('LightRequirement') ?? [],
  };
};

export const fetchLightRequirementOptions = async (loading = true): Promise<AdminLightRequirementOption[]> => {
  const response = await getLightRequirementOptions(loading);
  const payload = getResponsePayload(response);
  return normalizeLightRequirementGroup(payload ?? null);
};
