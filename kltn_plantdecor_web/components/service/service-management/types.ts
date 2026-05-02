import type { AdminCareServicePackageDetail } from "@/types/admin-service-package.types";

export type ModalMode = "view" | "edit" | "create";

/** Maximum visits per week allowed by business rules. */
export const MAX_VISITS_PER_WEEK = 6;

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
  categoryIds: number[];
  careDifficultyLevels: number[];
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
  categoryIds: [],
  careDifficultyLevels: [],
};

export const buildFormFromDetail = (
  detail: AdminCareServicePackageDetail
): ServicePackageFormValue => {
  const specializationIdsFromResponse = detail.specializationIds ?? [];
  const specializationIds =
    specializationIdsFromResponse.length > 0
      ? specializationIdsFromResponse
      : (detail.specializations ?? []).map((item) => item.id);

  const categoryIds = (detail.suitabilityRules ?? [])
    .map((rule) => rule.categoryId)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  const careDifficultyLevels = (detail.suitabilityRules ?? [])
    .map((rule) => rule.careDifficultyLevel)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  const visitPerWeek =
    detail.visitPerWeek == null || !Number.isFinite(detail.visitPerWeek)
      ? detail.visitPerWeek
      : Math.min(MAX_VISITS_PER_WEEK, Math.max(0, Math.trunc(detail.visitPerWeek)));

  return {
    name: detail.name,
    description: detail.description,
    features: detail.features,
    serviceType: detail.serviceType,
    visitPerWeek,
    durationDays: detail.durationDays,
    areaLimit: detail.areaLimit,
    unitPrice: detail.unitPrice,
    isActive: detail.isActive,
    specializationIds,
    categoryIds: [...new Set(categoryIds)],
    careDifficultyLevels: [...new Set(careDifficultyLevels)],
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
