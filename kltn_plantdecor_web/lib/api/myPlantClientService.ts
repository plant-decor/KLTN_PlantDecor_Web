"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type {
  MyCareReminderCreateRequest,
  MyCareReminderItem,
  MyCareReminderListPayload,
  MyPlantItem,
  MyPlantUpdateRequest,
} from "@/types/my-plant.types";

const QUERY_CONFIG = {
  showToast: false,
  showErrorToast: false,
};

type ApiPayload<T> = {
  payload?: T;
  data?: T;
};

export type MyCareRemindersQuery = {
  careType?: number;
  pageNumber?: number;
  pageSize?: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getStringField = (
  record: Record<string, unknown> | null,
  key: string,
) => {
  const value = record?.[key];
  return typeof value === "string" ? value : undefined;
};

const getBooleanField = (
  record: Record<string, unknown> | null,
  key: string,
) => {
  const value = record?.[key];
  return typeof value === "boolean" ? value : undefined;
};

const unwrapPayloadData = (response: unknown): unknown => {
  if (!isRecord(response)) {
    return response;
  }

  if ("payload" in response && response.payload !== undefined) {
    return response.payload;
  }

  if ("data" in response && response.data !== undefined) {
    return response.data;
  }

  return response;
};

const toApiActionResult = <T,>(
  response: unknown,
  includeData = true,
): ApiActionResult<T> => {
  const responseRecord = isRecord(response) ? response : null;
  const payload = unwrapPayloadData(response);
  const payloadRecord = isRecord(payload) ? payload : null;
  const result: ApiActionResult<T> = { success: false };

  if (includeData && payload !== undefined && payload !== null) {
    if (
      payloadRecord &&
      ("payload" in payloadRecord || "data" in payloadRecord)
    ) {
      result.data = (payloadRecord.payload ?? payloadRecord.data) as T;
    } else {
      result.data = payload as T;
    }
  }

  result.message =
    getStringField(responseRecord, "message") ??
    getStringField(payloadRecord, "message");

  const success =
    getBooleanField(responseRecord, "success") ??
    getBooleanField(payloadRecord, "success");
  result.success = success ?? true;

  return result;
};

export const getMyCareReminders = async (
  query: MyCareRemindersQuery = { pageNumber: 1, pageSize: 10 },
  loading = true,
): Promise<MyCareReminderListPayload> => {
  const response = await apiClient.get<ApiPayload<MyCareReminderListPayload>>(
    "/user-plants/my-care-reminders",
    query,
    loading,
    QUERY_CONFIG,
  );

  const payload = unwrapPayloadData(response);
  if (isRecord(payload) && Array.isArray(payload.items)) {
    return payload as unknown as MyCareReminderListPayload;
  }

  return {
    items: [],
    totalCount: 0,
    pageNumber: query.pageNumber ?? 1,
    pageSize: query.pageSize ?? 10,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  };
};

export const getTodayMyCareReminders = async (
  loading = true,
): Promise<MyCareReminderItem[]> => {
  const response = await apiClient.get<ApiPayload<MyCareReminderItem[]>>(
    "/user-plants/my-care-reminders/today",
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const payload = unwrapPayloadData(response);
  if (Array.isArray(payload)) {
    return payload as MyCareReminderItem[];
  }

  if (isRecord(payload)) {
    if (Array.isArray(payload.payload)) {
      return payload.payload as MyCareReminderItem[];
    }

    if (Array.isArray(payload.data)) {
      return payload.data as MyCareReminderItem[];
    }
  }

  return [];
};

export type ApiActionResult<T> = {
  success: boolean;
  message?: string;
  data?: T | null;
};

export const updateMyPlant = async (
  id: number,
  request: MyPlantUpdateRequest,
  loading = true,
): Promise<ApiActionResult<MyPlantItem>> => {
  const response = await apiClient.put<ApiPayload<MyPlantItem>>(
    `/user-plants/my/${id}`,
    request,
    loading,
    QUERY_CONFIG,
  );

  return toApiActionResult<MyPlantItem>(response);
};

export const createMyCareReminder = async (
  request: MyCareReminderCreateRequest,
  loading = true,
): Promise<ApiActionResult<MyCareReminderItem>> => {
  const response = await apiClient.post<ApiPayload<MyCareReminderItem>>(
    "/user-plants/my-care-reminders",
    request,
    loading,
    QUERY_CONFIG,
  );

  return toApiActionResult<MyCareReminderItem>(response);
};

export const updateMyCareReminder = async (
  id: number,
  request: MyCareReminderCreateRequest,
  loading = true,
): Promise<ApiActionResult<MyCareReminderItem>> => {
  const response = await apiClient.put<ApiPayload<MyCareReminderItem>>(
    `/user-plants/my-care-reminders/${id}`,
    request,
    loading,
    QUERY_CONFIG,
  );

  return toApiActionResult<MyCareReminderItem>(response);
};

export const completeMyCareReminder = async (
  id: number,
  loading = true,
): Promise<ApiActionResult<MyCareReminderItem>> => {
  const response = await apiClient.patch<ApiPayload<MyCareReminderItem>>(
    `/user-plants/my-care-reminders/${id}/complete`,
    undefined,
    loading,
    QUERY_CONFIG,
  );

  return toApiActionResult<MyCareReminderItem>(response);
};

export const deleteMyCareReminder = async (
  id: number,
  loading = true,
): Promise<ApiActionResult<null>> => {
  const response = await apiClient.del<ApiPayload<unknown>>(
    `/user-plants/my-care-reminders/${id}`,
    loading,
    QUERY_CONFIG,
  );

  return toApiActionResult<null>(response, false);
};
