"use client";

import axios, { type InternalAxiosRequestConfig } from "axios";
import axiosClient from "@/lib/axios/axiosClient";
import * as apiClient from "@/lib/api/apiService.client";
import { normalizeApiError } from "@/lib/api/apiService.shared";

type AxiosClientRequestConfig = InternalAxiosRequestConfig & {
  showToast?: boolean;
  showErrorToast?: boolean;
  showLoading?: boolean;
};

const REQUEST_CONFIG = {
  showToast: false,
  showErrorToast: false,
  showLoading: false,
} as const;

export interface ServiceRatingCustomer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export interface ServiceRatingPayload {
  id: number;
  serviceRegistrationId: number;
  rating: number;
  description: string;
  createdAt: string;
  customer: ServiceRatingCustomer | null;
}

export interface SubmitServiceRatingBody {
  serviceRegistrationId: number;
  rating: number;
  description: string;
}

type WrappedResponse<T> = { payload?: T; data?: T } | T;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const unwrapPayloadData = <T>(response: WrappedResponse<T>): T => {
  if (!isRecord(response)) {
    return response as T;
  }
  if ("payload" in response && response.payload !== undefined) {
    return response.payload as T;
  }
  if ("data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const toNullableText = (value: unknown): string | null => {
  if (value == null) return null;
  return toText(value);
};

const normalizeCustomer = (raw: unknown): ServiceRatingCustomer | null => {
  if (!isRecord(raw)) return null;
  const id = toNumber(raw.id, Number.NaN);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    fullName: toText(raw.fullName),
    email: toText(raw.email),
    phone: toText(raw.phone),
    avatar: toNullableText(raw.avatar),
  };
};

export const normalizeServiceRatingPayload = (raw: unknown): ServiceRatingPayload | null => {
  if (!isRecord(raw)) return null;
  const id = toNumber(raw.id, Number.NaN);
  if (!Number.isFinite(id)) return null;
  const ratingVal = raw.rating !== undefined ? toNumber(raw.rating, Number.NaN) : Number.NaN;
  if (!Number.isFinite(ratingVal)) return null;
  return {
    id,
    serviceRegistrationId: toNumber(raw.serviceRegistrationId),
    rating: ratingVal,
    description: toText(raw.description),
    createdAt: toText(raw.createdAt),
    customer: normalizeCustomer(raw.customer),
  };
};

export function ratingPayloadToRegistrationRating(payload: ServiceRatingPayload) {
  return {
    id: payload.id,
    score: payload.rating,
    comment: payload.description || undefined,
  };
}

export const submitServiceRating = async (
  body: SubmitServiceRatingBody,
  loading = false
): Promise<ServiceRatingPayload> => {
  const response = await apiClient.post<WrappedResponse<unknown>>(
    "/api/service-ratings",
    body,
    loading,
    REQUEST_CONFIG
  );
  const payload = normalizeServiceRatingPayload(unwrapPayloadData(response));
  if (!payload) {
    throw new Error("Invalid rating response");
  }
  return payload;
};

export const getServiceRatingByRegistration = async (
  registrationId: number,
  loading = false
): Promise<ServiceRatingPayload | null> => {
  const url = `/api/service-ratings/by-registration/${registrationId}`;
  try {
    const response = await axiosClient.get<WrappedResponse<unknown>>(url, {
      ...REQUEST_CONFIG,
      showLoading: loading,
    } as AxiosClientRequestConfig);
    return normalizeServiceRatingPayload(unwrapPayloadData(response.data));
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw normalizeApiError(err, "GET", url, false);
  }
};
