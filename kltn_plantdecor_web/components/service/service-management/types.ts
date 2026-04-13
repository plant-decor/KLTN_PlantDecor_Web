import type { AdminCareServicePackageDetail } from "@/types/admin-service-package.types";

export type ModalMode = "view" | "edit" | "create";

export interface ServicePackageFormValue {
  name: string;
  description: string;
  features: string;
  serviceType: number;
  visitPerWeek: number | null;
  durationDays: number;
  areaLimit: number;
  unitPrice: number;
  isActive: boolean;
  specializationIds: number[];
}

export const emptyFormValue: ServicePackageFormValue = {
  name: "",
  description: "",
  features: "",
  serviceType: 0,
  visitPerWeek: null,
  durationDays: 1,
  areaLimit: 0,
  unitPrice: 0,
  isActive: true,
  specializationIds: [],
};

export const buildFormFromDetail = (
  detail: AdminCareServicePackageDetail
): ServicePackageFormValue => {
  return {
    name: detail.name,
    description: detail.description,
    features: detail.features,
    serviceType: detail.serviceType,
    visitPerWeek: detail.visitPerWeek,
    durationDays: detail.durationDays,
    areaLimit: detail.areaLimit,
    unitPrice: detail.unitPrice,
    isActive: detail.isActive,
    specializationIds: detail.specializationIds ?? [],
  };
};

export const toCurrency = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString("vi-VN");
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || fallback;
};
