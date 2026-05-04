'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type { MyNurseryMaterialSummaryPayload, NurseryTopProductItem } from '@/types/manager-dashboard.types';

type WrappedResponse<T> = ResponseModel<T> | T;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const unwrapPayloadData = <T>(response: WrappedResponse<T>): T => {
  if (!isRecord(response)) {
    return response as T;
  }
  if ('payload' in response && response.payload !== undefined) {
    return response.payload as T;
  }
  if ('data' in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export const getManagerNurseryTopProducts = async (
  from: string,
  to: string,
  limit = 10,
  loading = false
): Promise<NurseryTopProductItem[]> => {
  const response = await apiClient.get<ResponseModel<NurseryTopProductItem[]>>(
    '/manager/nursery-products/top',
    { from, to, limit },
    loading,
    { showToast: false, showErrorToast: false }
  );
  return unwrapPayloadData(response);
};

export const getMyNurseryMaterialSummary = async (
  lowStockThreshold = 5,
  expiringInDays = 30,
  loading = false
): Promise<MyNurseryMaterialSummaryPayload> => {
  const response = await apiClient.get<ResponseModel<MyNurseryMaterialSummaryPayload>>(
    '/manager/Nurseries/my-nursery/material-summary',
    { lowStockThreshold, expiringInDays },
    loading,
    { showToast: false, showErrorToast: false }
  );
  return unwrapPayloadData(response);
};
