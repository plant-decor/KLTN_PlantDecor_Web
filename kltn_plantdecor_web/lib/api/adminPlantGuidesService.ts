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
  return apiClient.post('/admin/PlantGuides', data, loading, { showToast: false, showErrorToast: false });
};

export const updateAdminPlantGuide = async (
  id: number,
  data: AdminPlantGuideUpsertRequest,
  loading = true
): Promise<ResponseModel<AdminPlantGuideDetail>> => {
  return apiClient.patch(`/admin/PlantGuides/${id}`, data, loading, { showToast: false, showErrorToast: false });
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

export const fetchLightRequirementOptions = async (loading = true): Promise<AdminLightRequirementOption[]> => {
  const response = await getLightRequirementOptions(loading);
  const payload = getResponsePayload(response);
  return normalizeLightRequirementGroup(payload ?? null);
};
