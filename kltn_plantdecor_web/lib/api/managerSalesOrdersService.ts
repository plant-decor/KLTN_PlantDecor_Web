'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  ManagerNurseryOrderDetail,
  ManagerNurseryOrderListPayload,
  ManagerNurseryOrdersListQuery,
  ManagerNurseryOrderShipper,
} from '@/types/manager-sales-orders.types';

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

const buildListQueryParams = (query?: ManagerNurseryOrdersListQuery) => {
  if (!query) {
    return undefined;
  }

  return {
    ...(typeof query.status === 'number' ? { status: query.status } : {}),
    ...(typeof query.pageNumber === 'number' ? { pageNumber: query.pageNumber } : {}),
    ...(typeof query.pageSize === 'number' ? { pageSize: query.pageSize } : {}),
  };
};

export const getManagerNurseryOrders = async (
  query?: ManagerNurseryOrdersListQuery,
  loading = true
): Promise<ManagerNurseryOrderListPayload> => {
  const response = await apiClient.get<ResponseModel<ManagerNurseryOrderListPayload>>(
    '/manager/nursery-orders',
    buildListQueryParams(query),
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const getManagerNurseryOrderDetail = async (
  nurseryOrderId: number,
  loading = true
): Promise<ManagerNurseryOrderDetail> => {
  const response = await apiClient.get<ResponseModel<ManagerNurseryOrderDetail>>(
    `/manager/nursery-orders/${nurseryOrderId}`,
    undefined,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const getManagerNurseryOrderShippers = async (
  loading = true
): Promise<ManagerNurseryOrderShipper[]> => {
  const response = await apiClient.get<ResponseModel<ManagerNurseryOrderShipper[]>>(
    '/manager/nursery-orders/shippers',
    undefined,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const updateManagerNurseryOrderShipper = async (
  nurseryOrderId: number,
  shipperId: number,
  loading = true
): Promise<ManagerNurseryOrderDetail> => {
  const response = await apiClient.put<ResponseModel<ManagerNurseryOrderDetail>>(
    `/manager/nursery-orders/${nurseryOrderId}/shipper`,
    { shipperId },
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const markManagerNurseryOrderAsAssigned = async (
  nurseryOrderId: number,
  loading = true
): Promise<ManagerNurseryOrderDetail> => {
  const response = await apiClient.put<ResponseModel<ManagerNurseryOrderDetail>>(
    `/manager/nursery-orders/${nurseryOrderId}/mark-assigned`,
    {},
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};
