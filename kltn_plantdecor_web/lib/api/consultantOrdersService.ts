'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  ConsultantOrder,
  ConsultantOrderSearchPayload,
  ConsultantOrderSearchRequest,
} from '@/types/consultant-order.types';

const getResponsePayload = <T>(response: { data?: T; payload?: T }): T | undefined => {
  return response.payload ?? response.data;
};

/** Không đưa các field int filter = 0 vào body (backend coi 0 là không lọc). `pagination` luôn gửi nguyên. */
export function buildConsultantOrderSearchBody(
  input: ConsultantOrderSearchRequest
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    pagination: input.pagination,
    sortBy: input.sortBy,
    sortDirection: input.sortDirection,
  };

  const email = input.customerEmail?.trim();
  if (email) {
    body.customerEmail = email;
  }
  if (input.createdFrom) {
    body.createdFrom = input.createdFrom;
  }
  if (input.createdTo) {
    body.createdTo = input.createdTo;
  }
  if (input.status != null && input.status !== 0) {
    body.status = input.status;
  }
  if (input.orderType != null && input.orderType !== 0) {
    body.orderType = input.orderType;
  }
  if (input.paymentStrategy != null && input.paymentStrategy !== 0) {
    body.paymentStrategy = input.paymentStrategy;
  }
  if (input.minTotalAmount != null && input.minTotalAmount !== 0) {
    body.minTotalAmount = input.minTotalAmount;
  }
  if (input.maxTotalAmount != null && input.maxTotalAmount !== 0) {
    body.maxTotalAmount = input.maxTotalAmount;
  }

  return body;
}

export const searchConsultantOrders = async (
  data: ConsultantOrderSearchRequest,
  loading = true
): Promise<ConsultantOrderSearchPayload | undefined> => {
  const response = await apiClient.post<ResponseModel<ConsultantOrderSearchPayload>>(
    '/consultant/orders/search',
    buildConsultantOrderSearchBody(data),
    loading,
    { showToast: false, showErrorToast: false }
  );
  return getResponsePayload(response);
};

export const getConsultantOrderById = async (
  id: number,
  loading = true
): Promise<ConsultantOrder | undefined> => {
  const response = await apiClient.get<ResponseModel<ConsultantOrder>>(
    `/consultant/orders/${id}`,
    undefined,
    loading,
    { showToast: false, showErrorToast: false }
  );
  return getResponsePayload(response);
};
