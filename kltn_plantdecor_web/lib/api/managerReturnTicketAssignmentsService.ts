'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type {
  ManagerReturnTicketAssignmentDetail,
  ManagerReturnTicketAssignmentItem,
  ManagerReturnTicketAssignmentItemActionRequest,
  ManagerReturnTicketAssignmentItemApproveRequest,
  ManagerReturnTicketAssignmentItemRefundRequest,
  ManagerReturnTicketAssignmentListPayload,
  ManagerReturnTicketAssignmentListQuery,
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

const buildListQueryParams = (query?: ManagerReturnTicketAssignmentListQuery) => {
  if (!query) {
    return undefined;
  }

  return {
    ...(typeof query.status === 'number' ? { status: query.status } : {}),
    ...(typeof query.pageNumber === 'number' ? { pageNumber: query.pageNumber } : {}),
    ...(typeof query.pageSize === 'number' ? { pageSize: query.pageSize } : {}),
  };
};

export const getManagerReturnTicketAssignments = async (
  query?: ManagerReturnTicketAssignmentListQuery,
  loading = true
): Promise<ManagerReturnTicketAssignmentListPayload> => {
  const response = await apiClient.get<ResponseModel<ManagerReturnTicketAssignmentListPayload>>(
    '/manager/return-ticket-assignments',
    buildListQueryParams(query),
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const getManagerReturnTicketAssignmentDetail = async (
  assignmentId: number,
  loading = true
): Promise<ManagerReturnTicketAssignmentDetail> => {
  const response = await apiClient.get<ResponseModel<ManagerReturnTicketAssignmentDetail>>(
    `/manager/return-ticket-assignments/${assignmentId}`,
    undefined,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const startManagerReturnTicketAssignmentReview = async (
  assignmentId: number,
  loading = true
): Promise<ManagerReturnTicketAssignmentDetail> => {
  const response = await apiClient.patch<ResponseModel<ManagerReturnTicketAssignmentDetail>>(
    `/manager/return-ticket-assignments/${assignmentId}/start-review`,
    undefined,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const approveManagerReturnTicketItem = async (
  assignmentId: number,
  itemId: number,
  data: ManagerReturnTicketAssignmentItemApproveRequest,
  loading = true
): Promise<ManagerReturnTicketAssignmentItem> => {
  const response = await apiClient.patch<ResponseModel<ManagerReturnTicketAssignmentItem>>(
    `/manager/return-ticket-assignments/${assignmentId}/items/${itemId}/approve`,
    data,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const rejectManagerReturnTicketItem = async (
  assignmentId: number,
  itemId: number,
  data: ManagerReturnTicketAssignmentItemActionRequest,
  loading = true
): Promise<ManagerReturnTicketAssignmentItem> => {
  const response = await apiClient.patch<ResponseModel<ManagerReturnTicketAssignmentItem>>(
    `/manager/return-ticket-assignments/${assignmentId}/items/${itemId}/reject`,
    data,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};

export const refundManagerReturnTicketItem = async (
  assignmentId: number,
  itemId: number,
  data: ManagerReturnTicketAssignmentItemRefundRequest = {},
  loading = true
): Promise<ManagerReturnTicketAssignmentItem> => {
  const response = await apiClient.patch<ResponseModel<ManagerReturnTicketAssignmentItem>>(
    `/manager/return-ticket-assignments/${assignmentId}/items/${itemId}/refund`,
    data,
    loading,
    {
      showToast: false,
      showErrorToast: false,
    }
  );

  return unwrapPayloadData(response);
};
