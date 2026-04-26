'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type { ExpiringSoonMaterialItem, LowStockProductItem } from '@/types/manager-store-catalog.types';

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

