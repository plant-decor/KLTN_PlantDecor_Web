'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';

export interface SystemEnumValueItem {
  value: number;
  name: string;
}

export interface SystemEnumPayload {
  enumName: string;
  values: SystemEnumValueItem[];
}

const getResponsePayload = <T>(response: { data?: T; payload?: T }): T | undefined => {
  return response.payload ?? response.data;
};

/** GET /system/enums/{enumName} — ví dụ enumName: `PaymentStrategies` */
export const getSystemEnumByName = async (
  enumName: string,
  loading = true
): Promise<SystemEnumValueItem[]> => {
  const response = await apiClient.get<ResponseModel<SystemEnumPayload>>(
    `/system/enums/${encodeURIComponent(enumName)}`,
    undefined,
    loading,
    { showToast: false, showErrorToast: false }
  );
  const payload = getResponsePayload(response);
  return Array.isArray(payload?.values) ? payload.values : [];
};
