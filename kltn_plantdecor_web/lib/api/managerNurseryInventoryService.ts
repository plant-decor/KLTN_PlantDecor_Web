'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type { ExpiringSoonMaterialItem, LowStockProductItem } from '@/types/manager-store-catalog.types';

const unwrapPayload = <T>(response: ResponseModel<T> | T): T => {
  if (response && typeof response === 'object' && 'payload' in response && response.payload !== undefined) {
    return response.payload as T;
  }
  if (response && typeof response === 'object' && 'data' in response && (response as { data?: T }).data !== undefined) {
    return (response as { data: T }).data;
  }
  return response as T;
};

export const getNurseryInventoryLowStock = async (
  threshold = 10,
  loading = false
): Promise<LowStockProductItem[]> => {
  const response = await apiClient.get<ResponseModel<LowStockProductItem[]>>(
    '/manager/nursery-inventory/low-stock',
    { threshold },
    loading,
    { showToast: false, showErrorToast: false }
  );
  return unwrapPayload(response);
};

export const getMyNurseryLowStockProducts = async (loading = true): Promise<ResponseModel<LowStockProductItem[]>> => {
  return apiClient.get('/manager/Nurseries/my-nursery/products/low-stock', undefined, loading);
};

export const getMyNurseryExpiringSoonMaterials = async (
  daysAhead = 30,
  loading = true
): Promise<ResponseModel<ExpiringSoonMaterialItem[]>> => {
  return apiClient.get(
    '/manager/Nurseries/my-nursery/materials/expiring-soon',
    { daysAhead },
    loading
  );
};

