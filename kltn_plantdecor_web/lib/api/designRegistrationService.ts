"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  CustomerDesignRegistrationRequest,
  CustomerDesignRegistrationResponse,
} from "@/types/design-registration.types";

type WrappedResponse<T> = ResponseModel<T> | T;

const MUTATION_CONFIG = { showToast: false, showErrorToast: false };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value: unknown, fallback = ""): string => typeof value === "string" ? value : fallback;

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

const normalizeRegistration = (value: unknown): CustomerDesignRegistrationResponse | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    nurseryId: toNumber(value.nurseryId),
    designTemplateTierId: toNumber(value.designTemplateTierId),
    totalPrice: toNumber(value.totalPrice),
    depositAmount: toNumber(value.depositAmount),
    address: toText(value.address),
    phone: toText(value.phone),
    customerNote: toText(value.customerNote) || undefined,
    status: toNumber(value.status),
    statusName: toText(value.statusName),
    createdAt: toText(value.createdAt) || undefined,
  };
};

export const createDesignRegistration = async (
  payload: CustomerDesignRegistrationRequest,
  loading = true
): Promise<CustomerDesignRegistrationResponse> => {
  const response = await apiClient.post<WrappedResponse<unknown>>("/api/design-registrations", payload, loading, MUTATION_CONFIG);
  const registration = normalizeRegistration(unwrapPayloadData(response));

  return (
    registration ?? {
      id: 0,
      nurseryId: payload.nurseryId,
      designTemplateTierId: payload.designTemplateTierId,
      totalPrice: 0,
      depositAmount: 0,
      address: payload.address,
      phone: payload.phone,
      customerNote: payload.customerNote,
      status: 0,
      statusName: "",
    }
  );
};
