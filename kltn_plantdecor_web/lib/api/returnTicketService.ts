'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  CreateReturnTicketRequest,
  ReturnTicket,
  ReturnTicketEnumGroup,
  ReturnTicketItem,
} from '@/types/return-ticket.types';

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

export const createReturnTicket = async (
  data: CreateReturnTicketRequest,
  loading = true
): Promise<ReturnTicket> => {
  const response = await apiClient.post<ResponseModel<ReturnTicket>>(
    '/return-tickets',
    data,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const uploadReturnTicketItemImages = async (
  ticketId: number,
  itemId: number,
  files: File[],
  loading = true
): Promise<ReturnTicketItem> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await apiClient.post<ResponseModel<ReturnTicketItem>>(
    `/return-tickets/${ticketId}/items/${itemId}/images`,
    formData,
    loading,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const getMyReturnTickets = async (loading = true): Promise<ReturnTicket[]> => {
  const response = await apiClient.get<ResponseModel<ReturnTicket[]>>(
    '/return-tickets/my',
    undefined,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response) || [];
};

export const getReturnTicketStatusEnums = async (loading = true): Promise<ReturnTicketEnumGroup[]> => {
  const response = await apiClient.get<ResponseModel<ReturnTicketEnumGroup[]>>(
    '/system/enums/return-tickets',
    undefined,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response) || [];
};

export const getReturnTicketItemStatusEnums = async (loading = true): Promise<ReturnTicketEnumGroup[]> => {
  const response = await apiClient.get<ResponseModel<ReturnTicketEnumGroup[]>>(
    '/system/enums/return-ticket-items',
    undefined,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response) || [];
};

export const getReturnTicketAssignmentStatusEnums = async (
  loading = true
): Promise<ReturnTicketEnumGroup[]> => {
  const response = await apiClient.get<ResponseModel<ReturnTicketEnumGroup[]>>(
    '/system/enums/return-ticket-assignments',
    undefined,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response) || [];
};
