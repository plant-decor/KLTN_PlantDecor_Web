"use client";

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  Material,
  MaterialDetail,
  MaterialUpsertRequest,
} from '@/types/store-management.types';

export interface AdminMaterialSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  keyword?: string;
  isActive?: boolean;
}

export interface AdminMaterialSearchPayload {
  items: Material[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AssignMaterialCategoriesRequest {
  materialId: number;
  categoryIds: number[];
}

export interface AssignMaterialTagsRequest {
  materialId: number;
  tagIds: number[];
}

export const searchAdminMaterials = async (
  data: AdminMaterialSearchRequest,
  loading = true, showToast = false
): Promise<ResponseModel<AdminMaterialSearchPayload>> => {
  return apiClient.post('/system/materials/search', data, loading, { showToast});
};

export const getAdminMaterialById = async (
  id: number,
  loading = true
): Promise<ResponseModel<MaterialDetail>> => {
  return apiClient.get(`/material/${id}`, undefined, loading);
};

export const createAdminMaterial = async (
  data: MaterialUpsertRequest,
  loading = true
): Promise<ResponseModel<MaterialDetail>> => {
  return apiClient.post('/admin/Materials', data, loading);
};

export const updateAdminMaterial = async (
  id: number,
  data: MaterialUpsertRequest,
  loading = true
): Promise<ResponseModel<MaterialDetail>> => {
  return apiClient.patch(`/admin/Materials/${id}`, data, loading);
};

export const uploadAdminMaterialImages = async (
  id: number,
  files: File[],
  loading = true
): Promise<ResponseModel<unknown>> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return apiClient.post(`/admin/Materials/${id}/images`, formData, loading, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteAdminMaterialImage = async (
  id: number,
  imageId: number,
  loading = true
): Promise<ResponseModel<unknown>> => {
  return apiClient.del(`/admin/Materials/${id}/images/${imageId}`, loading);
};

export const uploadAdminMaterialThumbnail = async (
  id: number,
  file: File,
  loading = true
): Promise<ResponseModel<unknown>> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(`/admin/Materials/${id}/thumbnail`, formData, loading, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const toggleAdminMaterialActive = async (
  id: number,
  loading = true
): Promise<ResponseModel<MaterialDetail>> => {
  return apiClient.patch(`/admin/Materials/${id}/toggle-active`, undefined, loading);
};

export const assignMaterialCategories = async (
  data: AssignMaterialCategoriesRequest,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.post('/admin/Materials/assign-categories', data, loading);
};

export const assignMaterialTags = async (
  data: AssignMaterialTagsRequest,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.post('/admin/Materials/assign-tags', data, loading);
};

export const removeMaterialCategory = async (
  materialId: number,
  categoryId: number,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.del(`/admin/Materials/${materialId}/categories/${categoryId}`, loading);
};

export const removeMaterialTag = async (
  materialId: number,
  tagId: number,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.del(`/admin/Materials/${materialId}/tags/${tagId}`, loading);
};
