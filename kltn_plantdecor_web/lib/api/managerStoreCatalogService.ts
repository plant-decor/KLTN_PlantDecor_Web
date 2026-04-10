'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  AvailableImportCommonPlantItem,
  BatchUpdatePlantInstanceStatusRequest,
  CommonPlantInventoryItem,
  CreatePlantInstanceBatchPayload,
  CreatePlantInstanceBatchRequest,
  CreateCommonPlantRequest,
  PlantInstanceEnumGroup,
  PlantInstanceItem,
  PlantInstanceListQuery,
  PlantSummaryItem,
  ManagerNursery,
  ManagerPlantComboListPayload,
  ManagerPlantComboOperationPayload,
  ManagerPlantComboOperationRequest,
  PaginatedPayload,
  PaginationQuery,
  SystemPlantSearchPayload,
  SystemPlantSearchRequest,
  UpdatePlantInstanceStatusRequest,
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

export const getManagerPlantsSummary = async (
  nurseryId: number,
  loading = true
): Promise<ResponseModel<PlantSummaryItem[]>> => {
  return apiClient.get(`/manager/nurseries/${nurseryId}/plants-summary`, undefined, loading);
};

export const getManagerPlantInstances = async (
  nurseryId: number,
  query?: PlantInstanceListQuery,
  loading = true
): Promise<ResponseModel<PaginatedPayload<PlantInstanceItem>>> => {
  const paginationQuery = buildPaginationParams(query);
  const params = {
    ...(paginationQuery ?? {}),
    ...(typeof query?.status === 'number' ? { status: query.status } : {}),
  };

  return apiClient.get(`/manager/nurseries/${nurseryId}/plant-instances`, params, loading);
};

export const createManagerPlantInstanceBatch = async (
  nurseryId: number,
  request: CreatePlantInstanceBatchRequest,
  loading = true
): Promise<ResponseModel<CreatePlantInstanceBatchPayload>> => {
  return apiClient.post(`/manager/nurseries/${nurseryId}/plant-instances/batch`, request, loading);
};

export const uploadManagerPlantInstanceThumbnail = async (
  instanceId: number,
  file: File,
  loading = true
): Promise<ResponseModel<unknown>> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(`/manager/plant-instances/${instanceId}/thumbnail`, formData, loading, {
    showToast: false,
    showErrorToast: false,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadManagerPlantInstanceImages = async (
  instanceId: number,
  files: File[],
  loading = true
): Promise<ResponseModel<unknown>> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return apiClient.post(`/manager/plant-instances/${instanceId}/images`, formData, loading, {
    showToast: false,
    showErrorToast: false,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateManagerPlantInstanceStatus = async (
  instanceId: number,
  request: UpdatePlantInstanceStatusRequest,
  loading = true
): Promise<ResponseModel<unknown>> => {
  return apiClient.patch(`/manager/plant-instances/${instanceId}/status`, request, loading);
};

export const batchUpdateManagerPlantInstanceStatus = async (
  request: BatchUpdatePlantInstanceStatusRequest,
  loading = true
): Promise<ResponseModel<unknown>> => {
  return apiClient.patch('/manager/plant-instances/batch-status', request, loading);
};

export const getPlantInstanceEnums = async (
  loading = true
): Promise<ResponseModel<PlantInstanceEnumGroup[]>> => {
  return apiClient.get('/system/enums/plant-instances', undefined, loading);
};

export const searchSystemPlants = async (
  request: SystemPlantSearchRequest,
  loading = true
): Promise<ResponseModel<SystemPlantSearchPayload>> => {
  return apiClient.post('/system/plants/search', request, loading, { showToast: false });
};

export const getManagerPlantCombos = async (
  query?: PaginationQuery,
  loading = true
): Promise<ResponseModel<ManagerPlantComboListPayload>> => {
  return apiClient.get('/manager/plant-combos', buildPaginationParams(query), loading);
};

export const assembleManagerPlantCombo = async (
  comboId: number,
  request: ManagerPlantComboOperationRequest,
  loading = true,
): Promise<ResponseModel<ManagerPlantComboOperationPayload>> => {
  return apiClient.post(`/manager/plant-combos/${comboId}/assemble`, request, loading );
};

export const decomposeManagerPlantCombo = async (
  comboId: number,
  request: ManagerPlantComboOperationRequest,
  loading = true
): Promise<ResponseModel<ManagerPlantComboOperationPayload>> => {
  return apiClient.post(`/manager/plant-combos/${comboId}/decompose`, request, loading);
};
