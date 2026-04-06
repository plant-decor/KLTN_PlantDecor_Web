"use client";

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  Plant,
  PlantCombo,
  PlantComboAssignTagsRequest,
  PlantComboCreateRequest,
  PlantComboItemUpsertRequest,
  PlantComboListPayload,
  PlantComboUpdateRequest,
} from '@/types/store-management.types';

export interface AdminPlantComboListParams {
  PageNumber?: number;
  PageSize?: number;
}

export interface AdminPlantSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  keyword?: string;
  isActive?: boolean;
  isUniqueInstance?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

export interface AdminPlantSearchPayload {
  items: Plant[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const getAdminPlantCombos = async (
  params: AdminPlantComboListParams,
  loading = true
): Promise<ResponseModel<PlantComboListPayload>> => {
  return apiClient.get('/admin/PlantCombos', params, loading);
};

export const getPlantComboById = async (
  id: number,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  return apiClient.get(`/PlantCombos/${id}`, undefined, loading);
};

export const createAdminPlantCombo = async (
  data: PlantComboCreateRequest,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  return apiClient.post('/admin/PlantCombos', data, loading);
};

export const updateAdminPlantCombo = async (
  id: number,
  data: PlantComboUpdateRequest,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  return apiClient.patch(`/admin/PlantCombos/${id}`, data, loading);
};

export const uploadAdminPlantComboThumbnail = async (
  id: number,
  file: File,
  loading = true
): Promise<ResponseModel<unknown>> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(`/admin/PlantCombos/${id}/thumbnail`, formData, loading, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadAdminPlantComboImages = async (
  id: number,
  files: File[],
  loading = true
): Promise<ResponseModel<unknown>> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return apiClient.post(`/admin/PlantCombos/${id}/images`, formData, loading, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const toggleAdminPlantComboActive = async (
  id: number,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  return apiClient.patch(`/admin/PlantCombos/${id}/toggle-active`, undefined, loading);
};

export const assignPlantComboTags = async (
  data: PlantComboAssignTagsRequest,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  return apiClient.post('/admin/PlantCombos/assign-tags', data, loading);
};

export const removePlantComboTag = async (
  comboId: number,
  tagId: number,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  return apiClient.del(`/admin/PlantCombos/${comboId}/tags/${tagId}`, loading);
};

export const addPlantComboItem = async (
  comboId: number,
  data: PlantComboItemUpsertRequest,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  return apiClient.post(`/admin/PlantCombos/${comboId}/items`, data, loading);
};

export const updatePlantComboItem = async (
  comboItemId: number,
  data: PlantComboItemUpsertRequest,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  return apiClient.put(`/admin/PlantCombos/items/${comboItemId}`, data, loading);
};

export const removePlantComboItem = async (
  comboId: number,
  comboItemId: number,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  return apiClient.del(`/admin/PlantCombos/${comboId}/items/${comboItemId}`, loading);
};

export const searchAdminPlantsForCombo = async (
  data: AdminPlantSearchRequest,
  loading = true
): Promise<ResponseModel<AdminPlantSearchPayload>> => {
  return apiClient.post('/system/plants/search', data, loading);
};
