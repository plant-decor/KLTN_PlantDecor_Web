"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  CareServicePackage,
  CareServiceSpecialization,
  CreateServiceRegistrationRequest,
  CreatedServiceRegistration,
  EnumOption,
  MyServiceRegistration,
  NearbyNursery,
  NearbyNurseryQuery,
  NurseryCareService,
  PaginatedApiResponse,
  ServiceRegistrationsQuery,
} from "@/types/care-service.types";

const QUERY_CONFIG = {
  showToast: false,
  showErrorToast: false,
};

const MUTATION_CONFIG = {
  showToast: false,
  showErrorToast: false,
};

type WrappedResponse<T> = ResponseModel<T> | T;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  return typeof value === "boolean" ? value : fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value == null) {
    return null;
  }

  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNullableText = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }

  return toText(value);
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

const normalizePackage = (item: unknown): CareServicePackage | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const rawSpecializations = Array.isArray(item.specializations) ? item.specializations : [];
  const specializations: CareServiceSpecialization[] = rawSpecializations
    .map((specialization) => {
      if (!isRecord(specialization)) {
        return null;
      }

      const specializationId = toNumber(specialization.id, Number.NaN);
      if (!Number.isFinite(specializationId)) {
        return null;
      }

      const normalized: CareServiceSpecialization = {
        id: specializationId,
        name: toText(specialization.name),
      };

      const description = toText(specialization.description);
      if (description) {
        normalized.description = description;
      }

      if (specialization.isActive != null) {
        normalized.isActive = toBoolean(specialization.isActive, true);
      }

      return normalized;
    })
    .filter((specialization): specialization is CareServiceSpecialization => Boolean(specialization));

  return {
    id,
    name: toText(item.name),
    description: toText(item.description),
    features: toText(item.features),
    visitPerWeek: toNumber(item.visitPerWeek),
    durationDays: toNumber(item.durationDays),
    totalSessions: item.totalSessions == null ? undefined : toNumber(item.totalSessions),
    serviceType: toNumber(item.serviceType),
    areaLimit: toNumber(item.areaLimit),
    unitPrice: toNumber(item.unitPrice),
    isActive: toBoolean(item.isActive, true),
    createdAt: toText(item.createdAt) || undefined,
    specializations,
  };
};

const normalizeNurseryCareService = (item: unknown): NurseryCareService | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const careServicePackage = normalizePackage(item.careServicePackage);
  if (!careServicePackage) {
    return null;
  }

  return {
    id,
    nurseryId: toNumber(item.nurseryId),
    nurseryName: toText(item.nurseryName),
    isActive: toBoolean(item.isActive, true),
    createdAt: toText(item.createdAt) || undefined,
    careServicePackage,
  };
};

const normalizeNearbyNursery = (item: unknown): NearbyNursery | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const availableServices = Array.isArray(item.availableServices)
    ? item.availableServices
        .map((service) => {
          if (!isRecord(service) || !isRecord(service.careServicePackage)) {
            return null;
          }

          const refId = toNumber(service.id, Number.NaN);
          if (!Number.isFinite(refId)) {
            return null;
          }

          return {
            id: refId,
            nurseryId: toNumber(service.nurseryId),
            nurseryName: toText(service.nurseryName),
            careServicePackage: {
              id: toNumber(service.careServicePackage.id),
              name: toText(service.careServicePackage.name),
              description: toText(service.careServicePackage.description),
              visitPerWeek: toNumber(service.careServicePackage.visitPerWeek),
              durationDays: toNumber(service.careServicePackage.durationDays),
              serviceType: toNumber(service.careServicePackage.serviceType),
              unitPrice: toNumber(service.careServicePackage.unitPrice),
            },
          };
        })
        .filter((service): service is NearbyNursery["availableServices"][number] => Boolean(service))
    : [];

  return {
    id,
    name: toText(item.name),
    address: toText(item.address),
    phone: toText(item.phone),
    latitude: toNumber(item.latitude),
    longitude: toNumber(item.longitude),
    distanceKm: toNumber(item.distanceKm),
    availableServices,
  };
};

const normalizeEnumOptions = (raw: unknown): EnumOption[] => {
  const unwrapped = unwrapPayloadData(raw as WrappedResponse<unknown>);

  if (!isRecord(unwrapped) || !Array.isArray(unwrapped.values)) {
    return [];
  }

  return unwrapped.values
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const value = toNumber(item.value, Number.NaN);
      if (!Number.isFinite(value)) {
        return null;
      }

      return {
        value,
        name: toText(item.name) || String(value),
      };
    })
    .filter((item): item is EnumOption => Boolean(item));
};

const parseScheduleDaysOfWeek = (value: unknown): number[] => {
  const normalize = (items: unknown[]): number[] =>
    items
      .map((item) => toNumber(item, Number.NaN))
      .filter((item) => Number.isFinite(item));

  if (Array.isArray(value)) {
    return normalize(value);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? normalize(parsed) : [];
  } catch {
    return [];
  }
};

const normalizeServiceRegistration = (item: unknown): MyServiceRegistration | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const nurseryCareService = isRecord(item.nurseryCareService) ? item.nurseryCareService : {};
  const careServicePackage = isRecord(nurseryCareService.careServicePackage)
    ? nurseryCareService.careServicePackage
    : {};
  const prefferedShift = isRecord(item.prefferedShift) ? item.prefferedShift : null;
  const customer = isRecord(item.customer) ? item.customer : null;
  const progresses = Array.isArray(item.progresses) ? item.progresses : [];
  const rating = isRecord(item.rating) ? item.rating : null;

  return {
    id,
    status: toNumber(item.status),
    statusName: toText(item.statusName),
    serviceDate: toText(item.serviceDate),
    totalSessions: toNumber(item.totalSessions),
    address: toText(item.address),
    phone: toText(item.phone),
    note: toText(item.note),
    latitude: toNumber(item.latitude),
    longitude: toNumber(item.longitude),
    scheduleDaysOfWeek: parseScheduleDaysOfWeek(item.scheduleDaysOfWeek),
    cancelReason: toNullableText(item.cancelReason),
    createdAt: toText(item.createdAt),
    approvedAt: toNullableText(item.approvedAt),
    orderId: toNullableNumber(item.orderId),
    nurseryCareService: {
      id: toNumber(nurseryCareService.id),
      nurseryId: toNumber(nurseryCareService.nurseryId),
      nurseryName: toText(nurseryCareService.nurseryName),
      careServicePackage: {
        id: toNumber(careServicePackage.id),
        name: toText(careServicePackage.name),
        description: toText(careServicePackage.description),
        visitPerWeek: toNumber(careServicePackage.visitPerWeek),
        durationDays: toNumber(careServicePackage.durationDays),
        serviceType: toNumber(careServicePackage.serviceType),
        unitPrice: toNumber(careServicePackage.unitPrice),
      },
    },
    prefferedShift: prefferedShift
      ? {
          id: toNumber(prefferedShift.id),
          shiftName: toText(prefferedShift.shiftName),
          startTime: toText(prefferedShift.startTime),
          endTime: toText(prefferedShift.endTime),
        }
      : null,
    customer: customer
      ? {
          id: toNumber(customer.id),
          fullName: toText(customer.fullName),
          email: toText(customer.email),
          phone: toText(customer.phone),
          avatar: toNullableText(customer.avatar),
        }
      : null,
    mainCaretaker: item.mainCaretaker ?? null,
    currentCaretaker: item.currentCaretaker ?? null,
    progresses: progresses
      .map((progress) => {
        if (!isRecord(progress)) {
          return null;
        }

        return {
          id: toNumber(progress.id),
          action: toText(progress.action),
          description: toText(progress.description),
          createdAt: toText(progress.createdAt),
        };
      })
      .filter((progress): progress is MyServiceRegistration["progresses"][number] => Boolean(progress)),
    rating: rating
      ? {
          id: toNumber(rating.id),
          score: toNumber(rating.score),
          comment: toText(rating.comment) || undefined,
        }
      : null,
  };
};

const buildPaginationParams = (query?: ServiceRegistrationsQuery) => {
  if (!query) {
    return undefined;
  }

  return {
    ...(typeof query.pageNumber === "number" ? { PageNumber: query.pageNumber } : {}),
    ...(typeof query.pageSize === "number" ? { PageSize: query.pageSize } : {}),
  };
};

export const getManagerNurseryCareServices = async (loading = true): Promise<NurseryCareService[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "nursery-care-services/my",
    undefined,
    loading,
    QUERY_CONFIG
  );

  const raw = unwrapPayloadData(response);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(normalizeNurseryCareService)
    .filter((item): item is NurseryCareService => Boolean(item));
};

export const getManagerNotOfferedPackages = async (loading = true): Promise<CareServicePackage[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "nursery-care-services/not-offered-packages",
    undefined,
    loading,
    QUERY_CONFIG
  );

  const raw = unwrapPayloadData(response);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map(normalizePackage).filter((item): item is CareServicePackage => Boolean(item));
};

export const addManagerPackageToNursery = async (
  careServicePackageId: number,
  loading = true
): Promise<NurseryCareService> => {
  const response = await apiClient.post<WrappedResponse<unknown>>(
    "nursery-care-services",
    { careServicePackageId },
    loading,
    MUTATION_CONFIG
  );

  const raw = unwrapPayloadData(response);
  const normalized = normalizeNurseryCareService(raw);
  if (!normalized) {
    throw new Error("Không thể thêm gói dịch vụ vào vựa");
  }

  return normalized;
};

export const toggleManagerNurseryCareService = async (
  id: number,
  loading = true
): Promise<NurseryCareService> => {
  const response = await apiClient.patch<WrappedResponse<unknown>>(
    `nursery-care-services/${id}/toggle`,
    undefined,
    loading,
    MUTATION_CONFIG
  );

  const raw = unwrapPayloadData(response);
  const normalized = normalizeNurseryCareService(raw);
  if (!normalized) {
    throw new Error("Không thể cập nhật trạng thái gói dịch vụ");
  }

  return normalized;
};

export const deleteManagerNurseryCareService = async (id: number, loading = true): Promise<void> => {
  await apiClient.del(`nursery-care-services/${id}`, loading, MUTATION_CONFIG);
};

export const getPublicCareServicePackages = async (loading = true): Promise<CareServicePackage[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "care-service-packages",
    undefined,
    loading,
    QUERY_CONFIG
  );

  const raw = unwrapPayloadData(response);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map(normalizePackage).filter((item): item is CareServicePackage => Boolean(item));
};

export const getCareServicePackageDetail = async (id: number, loading = true): Promise<CareServicePackage | null> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `care-service-packages/${id}`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  return normalizePackage(unwrapPayloadData(response));
};

export const getNearbyNurseries = async (
  query: NearbyNurseryQuery,
  loading = true
): Promise<NearbyNursery[]> => {
  const params: Record<string, number> = {
    packageId: query.packageId,
    radiusKm: query.radiusKm,
  };

  if (typeof query.lat === "number" && typeof query.lng === "number") {
    params.lat = query.lat;
    params.lng = query.lng;
  }

  const response = await apiClient.get<WrappedResponse<unknown>>(
    "nurseries/nearby",
    params,
    loading,
    QUERY_CONFIG
  );

  const raw = unwrapPayloadData(response);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map(normalizeNearbyNursery).filter((item): item is NearbyNursery => Boolean(item));
};

export const createServiceRegistration = async (
  data: CreateServiceRegistrationRequest,
  loading = true
): Promise<CreatedServiceRegistration> => {
  const response = await apiClient.post<WrappedResponse<CreatedServiceRegistration>>(
    "service-registrations",
    data,
    loading,
    MUTATION_CONFIG
  );

  return unwrapPayloadData(response);
};

export const getCareServiceTypeEnums = async (loading = true): Promise<EnumOption[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "system/enums/care-services",
    undefined,
    loading,
    QUERY_CONFIG
  );

  const payload = unwrapPayloadData(response);
  if (Array.isArray(payload) && payload.length > 0) {
    return normalizeEnumOptions({ payload: payload[0] });
  }

  return [];
};

export const getDayOfWeekEnums = async (loading = true): Promise<EnumOption[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "system/enums/DayOfWeek",
    undefined,
    loading,
    QUERY_CONFIG
  );

  return normalizeEnumOptions(response);
};

export const getSystemEnumValues = async (enumName: string, loading = true): Promise<EnumOption[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `system/enums/${encodeURIComponent(enumName)}`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  return normalizeEnumOptions(response);
};

export const getMyServiceRegistrations = async (
  query?: ServiceRegistrationsQuery,
  loading = true
): Promise<PaginatedApiResponse<MyServiceRegistration>> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "service-registrations/my",
    buildPaginationParams(query),
    loading,
    QUERY_CONFIG
  );

  const payload = unwrapPayloadData(response);
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: query?.pageNumber ?? 1,
      pageSize: query?.pageSize ?? 10,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    };
  }

  return {
    items: payload.items
      .map((item) => normalizeServiceRegistration(item))
      .filter((item): item is MyServiceRegistration => Boolean(item)),
    totalCount: toNumber(payload.totalCount),
    pageNumber: toNumber(payload.pageNumber, query?.pageNumber ?? 1),
    pageSize: toNumber(payload.pageSize, query?.pageSize ?? 10),
    totalPages: toNumber(payload.totalPages),
    hasPrevious: toBoolean(payload.hasPrevious),
    hasNext: toBoolean(payload.hasNext),
  };
};

export const getServiceRegistrationDetail = async (
  id: number,
  loading = true
): Promise<MyServiceRegistration> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `service-registrations/${id}`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Không thể tải chi tiết yêu cầu dịch vụ");
  }

  return normalized;
};

export const cancelServiceRegistration = async (
  id: number,
  cancelReason: string,
  loading = true
): Promise<MyServiceRegistration> => {
  const trimmedReason = cancelReason.trim();
  const endpoint = `service-registrations/${id}/cancel?cancelReason=${encodeURIComponent(trimmedReason)}`;

  const response = await apiClient.post<WrappedResponse<unknown>>(
    endpoint,
    undefined,
    loading,
    MUTATION_CONFIG
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Không thể hủy yêu cầu dịch vụ");
  }

  return normalized;
};
