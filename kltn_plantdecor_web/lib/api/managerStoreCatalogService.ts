'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  AvailableImportCommonPlantItem,
  CommonPlantInventoryItem,
  CreateCommonPlantRequest,
  ManagerNursery,
  PaginatedPayload,
  PaginationQuery,
  UpdateCommonPlantRequest,
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

export const getMyManagerNursery = async (
  loading = true
): Promise<ResponseModel<ManagerNursery>> => {
  return apiClient.get('/manager/Nurseries/my-nursery', undefined, loading);
};

export const getManagerCommonPlants = async (
  nurseryId: number,
  query?: PaginationQuery,
  loading = true
): Promise<ResponseModel<PaginatedPayload<CommonPlantInventoryItem>>> => {
  return apiClient.get(
    `/manager/nurseries/${nurseryId}/common-plants`,
    buildPaginationParams(query),
    loading
  );
};

export const getAvailableImportCommonPlants = async (
  nurseryId: number,
  query?: PaginationQuery,
  loading = true
): Promise<ResponseModel<PaginatedPayload<AvailableImportCommonPlantItem>>> => {
  return apiClient.get(
    `/manager/nurseries/${nurseryId}/common-plants/available-import-plants`,
    buildPaginationParams(query),
    loading
  );
};

export const createManagerCommonPlant = async (
  nurseryId: number,
  request: CreateCommonPlantRequest,
  loading = true
): Promise<ResponseModel<CommonPlantInventoryItem>> => {
  return apiClient.post(`/manager/nurseries/${nurseryId}/common-plants`, request, loading);
};

export const updateManagerCommonPlant = async (
  nurseryId: number,
  commonPlantId: number,
  request: UpdateCommonPlantRequest,
  loading = true
): Promise<ResponseModel<CommonPlantInventoryItem>> => {
  return apiClient.patch(
    `/manager/nurseries/${nurseryId}/common-plants/${commonPlantId}`,
    request,
    loading
  );
};

export const toggleManagerCommonPlantActive = async (
  nurseryId: number,
  commonPlantId: number,
  loading = true
): Promise<ResponseModel<CommonPlantInventoryItem>> => {
  return apiClient.patch(
    `/manager/nurseries/${nurseryId}/common-plants/${commonPlantId}/toggle-active`,
    undefined,
    loading
  );
};
