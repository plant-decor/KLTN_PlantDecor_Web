"use client";

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  Plant,
  PlantDetail,
  PlantEnumGroup,
  PlantUpsertRequest,
} from '@/types/store-management.types';

export interface AdminPlantSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  keyword?: string;
  isActive?: boolean;
  placementType?: number;
  careLevelType?: number;
  careLevel?: string;
  toxicity?: boolean;
  airPurifying?: boolean;
  hasFlower?: boolean;
  petSafe?: boolean;
  childSafe?: boolean;
  isUniqueInstance?: boolean;
  minBasePrice?: number;
  maxBasePrice?: number;
  categoryIds?: number[];
  tagIds?: number[];
  sizes?: number[];
  fengShuiElement?: number;
  nurseryId?: number;
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

export interface AssignCategoriesRequest {
  plantId: number;
  categoryIds: number[];
}

export interface AssignTagsRequest {
  plantId: number;
  tagIds: number[];
}

export const searchAdminPlants = async (
  data: AdminPlantSearchRequest,
  loading = true
): Promise<ResponseModel<AdminPlantSearchPayload>> => {
  return apiClient.post('/system/plants/search', data, loading);
};

export const getAdminPlantById = async (
  id: number,
  loading = true
): Promise<ResponseModel<PlantDetail>> => {
  return apiClient.get(`/admin/Plants/${id}`, undefined, loading);
};

export const createAdminPlant = async (
  data: PlantUpsertRequest,
  loading = true
): Promise<ResponseModel<PlantDetail>> => {
  return apiClient.post('/admin/Plants', data, loading);
};

export const updateAdminPlant = async (
  id: number,
  data: PlantUpsertRequest,
  loading = true
): Promise<ResponseModel<PlantDetail>> => {
  return apiClient.patch(`/admin/Plants/${id}`, data, loading);
};

export const uploadAdminPlantImages = async (
  id: number,
  files: File[],
  loading = true
): Promise<ResponseModel<unknown>> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return apiClient.post(`/admin/Plants/${id}/images`, formData, loading, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const setAdminPlantPrimaryImage = async (
  id: number,
  imageId: number,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.patch(`/admin/Plants/${id}/images/${imageId}/set-primary`, undefined, loading);
};

export const uploadAdminPlantThumbnail = async (
  id: number,
  file: File,
  loading = true
): Promise<ResponseModel<unknown>> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(`/admin/Plants/${id}/thumbnail`, formData, loading, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const toggleAdminPlantActive = async (
  id: number,
  loading = true
): Promise<ResponseModel<PlantDetail>> => {
  return apiClient.patch(`/admin/Plants/${id}/toggle-active`, undefined, loading);
};

export const assignPlantCategories = async (
  data: AssignCategoriesRequest,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.post('/admin/Plants/assign-categories', data, loading);
};

export const assignPlantTags = async (
  data: AssignTagsRequest,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.post('/admin/Plants/assign-tags', data, loading);
};

export const removePlantCategory = async (
  plantId: number,
  categoryId: number,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.del(`/admin/Plants/${plantId}/categories/${categoryId}`, loading);
};

export const removePlantTag = async (
  plantId: number,
  tagId: number,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.del(`/admin/Plants/${plantId}/tags/${tagId}`, loading);
};

export const getPlantEnums = async (
  loading = true
): Promise<ResponseModel<PlantEnumGroup[]>> => {
  return apiClient.get('/system/enums/plants', undefined, loading);
};
