'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  ImportNurseryMaterialRequest,
  NurseryMaterialItem,
  PaginatedPayload,
  PaginationQuery,
  UpdateNurseryMaterialRequest,
} from '@/types/manager-store-catalog.types';

const buildPaginationParams = (query?: PaginationQuery) => {
  if (!query) {
    return undefined;
  }

  return {
    ...(typeof query.pageNumber === 'number' ? { PageNumber: query.pageNumber } : {}),
    ...(typeof query.pageSize === 'number' ? { PageSize: query.pageSize } : {}),
    ...(typeof query.skip === 'number' ? { Skip: query.skip } : {}),
    ...(typeof query.take === 'number' ? { Take: query.take } : {}),
  };
};

export const getMyManagerNurseryMaterials = async (
  query?: PaginationQuery,
  loading = true
): Promise<ResponseModel<PaginatedPayload<NurseryMaterialItem>>> => {
  return apiClient.get('/manager/nursery-materials/my-materials', buildPaginationParams(query), loading);
};

export const importManagerNurseryMaterial = async (
  request: ImportNurseryMaterialRequest,
  loading = true
): Promise<ResponseModel<NurseryMaterialItem>> => {
  return apiClient.post('/manager/nursery-materials/import', request, loading);
};

export const updateManagerNurseryMaterial = async (
  id: number,
  request: UpdateNurseryMaterialRequest,
  loading = true
): Promise<ResponseModel<NurseryMaterialItem>> => {
  return apiClient.patch(`/manager/nursery-materials/${id}`, request, loading);
};

export const toggleManagerNurseryMaterialActive = async (
  id: number,
  loading = true
): Promise<ResponseModel<NurseryMaterialItem>> => {
  return apiClient.patch(`/manager/nursery-materials/${id}/toggle-active`, undefined, loading);
};
