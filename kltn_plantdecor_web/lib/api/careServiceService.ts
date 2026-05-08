"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AssignServiceRegistrationCaretakerRequest,
  CareServicePackage,
  CareServiceSpecialization,
  CareServicePackageSuitabilityRule,
  CreateServiceRegistrationRequest,
  CreatedServiceRegistration,
  EligibleCaretaker,
  EnumOption,
  ManagerServiceRegistration,
  ManagerServiceRegistrationsQuery,
  MyServiceRegistration,
  NurseryServiceScheduleItem,
  NurseryCareService,
  PaginatedApiResponse,
  PublicShift,
  ServiceProgressDetail,
  ServiceProgressReassignRequest,
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

  const rawSpecializations = Array.isArray(item.specializations)
    ? item.specializations
    : [];
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
    .filter((specialization): specialization is CareServiceSpecialization =>
      Boolean(specialization),
    );

  const rawSuitabilityRules = Array.isArray(item.suitabilityRules)
    ? item.suitabilityRules
    : [];
  const suitabilityRules: CareServicePackageSuitabilityRule[] = rawSuitabilityRules
    .map((rule) => {
      if (!isRecord(rule)) {
        return null;
      }

      const normalized: CareServicePackageSuitabilityRule = {};

      const ruleId =
        rule.id == null ? null : toNumber(rule.id, Number.NaN);
      if (ruleId != null && Number.isFinite(ruleId)) {
        normalized.id = ruleId;
      }

      const careServicePackageId =
        rule.careServicePackageId == null
          ? null
          : toNumber(rule.careServicePackageId, Number.NaN);
      if (careServicePackageId != null && Number.isFinite(careServicePackageId)) {
        normalized.careServicePackageId = careServicePackageId;
      }

      if (rule.categoryId == null) {
        normalized.categoryId = null;
      } else {
        const categoryId = toNumber(rule.categoryId, Number.NaN);
        normalized.categoryId = Number.isFinite(categoryId) ? categoryId : null;
      }

      normalized.categoryName = toNullableText(rule.categoryName);

      if (rule.careDifficultyLevel == null) {
        normalized.careDifficultyLevel = null;
      } else {
        const careDifficultyLevel = toNumber(rule.careDifficultyLevel, Number.NaN);
        normalized.careDifficultyLevel = Number.isFinite(careDifficultyLevel)
          ? careDifficultyLevel
          : null;
      }

      normalized.careDifficultyLevelName = toNullableText(rule.careDifficultyLevelName);

      return normalized;
    })
    .filter(
      (rule): rule is CareServicePackageSuitabilityRule => Boolean(rule),
    );

  return {
    id,
    name: toText(item.name),
    description: toText(item.description),
    features: toText(item.features),
    visitPerWeek: toNumber(item.visitPerWeek),
    durationDays: toNumber(item.durationDays),
    totalSessions:
      item.totalSessions == null ? undefined : toNumber(item.totalSessions),
    serviceType: toNumber(item.serviceType),
    areaLimit: toNumber(item.areaLimit),
    unitPrice: toNumber(item.unitPrice),
    isActive: toBoolean(item.isActive, true),
    createdAt: toText(item.createdAt) || undefined,
    specializations,
    suitabilityRules: suitabilityRules.length ? suitabilityRules : undefined,
  };
};

const normalizeNurseryCareService = (
  item: unknown,
): NurseryCareService | null => {
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

const normalizePublicShift = (item: unknown): PublicShift | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    shiftName: toText(item.shiftName),
    startTime: toText(item.startTime),
    endTime: toText(item.endTime),
  };
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

const normalizeServiceRegistration = (
  item: unknown,
): MyServiceRegistration | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const nurseryCareService = isRecord(item.nurseryCareService)
    ? item.nurseryCareService
    : {};
  const careServicePackage = isRecord(nurseryCareService.careServicePackage)
    ? nurseryCareService.careServicePackage
    : {};
  const prefferedShift = isRecord(item.prefferedShift)
    ? item.prefferedShift
    : null;
  const customer = isRecord(item.customer) ? item.customer : null;
  const mainCaretaker = isRecord(item.mainCaretaker)
    ? item.mainCaretaker
    : null;
  const currentCaretaker = isRecord(item.currentCaretaker)
    ? item.currentCaretaker
    : null;
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
    mainCaretaker: mainCaretaker
      ? {
        id: toNumber(mainCaretaker.id),
        fullName: toText(mainCaretaker.fullName),
        email: toText(mainCaretaker.email),
        phone: toText(mainCaretaker.phone),
        avatar: toNullableText(mainCaretaker.avatar),
      }
      : null,
    currentCaretaker: currentCaretaker
      ? {
        id: toNumber(currentCaretaker.id),
        fullName: toText(currentCaretaker.fullName),
        email: toText(currentCaretaker.email),
        phone: toText(currentCaretaker.phone),
        avatar: toNullableText(currentCaretaker.avatar),
      }
      : null,
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
      .filter(
        (progress): progress is MyServiceRegistration["progresses"][number] =>
          Boolean(progress),
      ),
    rating: (() => {
      if (!rating) {
        return null;
      }
      const ratingId = toNumber(rating.id, Number.NaN);
      const score = toNumber(
        rating.score !== undefined ? rating.score : rating.rating,
        Number.NaN,
      );
      if (!Number.isFinite(ratingId) || !Number.isFinite(score)) {
        return null;
      }
      const comment =
        toText(rating.comment) || toText(rating.description) || undefined;
      return { id: ratingId, score, comment };
    })(),
  };
};

const normalizeEligibleCaretaker = (
  item: unknown,
): EligibleCaretaker | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const specializations = Array.isArray(item.specializations)
    ? item.specializations
      .map((specialization) => {
        if (!isRecord(specialization)) {
          return null;
        }

        const specializationId = toNumber(specialization.id, Number.NaN);
        if (!Number.isFinite(specializationId)) {
          return null;
        }

        return {
          id: specializationId,
          name: toText(specialization.name),
          description: toText(specialization.description),
        };
      })
      .filter((specialization): specialization is EligibleCaretaker["specializations"][number] =>
        Boolean(specialization)
      )
    : [];

  return {
    id,
    username: toText(item.username),
    email: toText(item.email),
    phoneNumber: toText(item.phoneNumber),
    avatarUrl: toNullableText(item.avatarUrl),
    status: toNumber(item.status),
    specializations,
  };
};

const normalizeNurseryServiceScheduleItem = (
  item: unknown,
): NurseryServiceScheduleItem | null => {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const shift = isRecord(item.shift) ? item.shift : null;
  const caretaker = isRecord(item.caretaker) ? item.caretaker : null;
  const serviceRegistration = isRecord(item.serviceRegistration)
    ? item.serviceRegistration
    : null;
  const nurseryCareService =
    serviceRegistration && isRecord(serviceRegistration.nurseryCareService)
      ? serviceRegistration.nurseryCareService
      : null;
  const careServicePackage =
    nurseryCareService && isRecord(nurseryCareService.careServicePackage)
      ? nurseryCareService.careServicePackage
      : null;
  const customer =
    serviceRegistration && isRecord(serviceRegistration.customer)
      ? serviceRegistration.customer
      : isRecord(item.customer)
        ? item.customer
        : null;
  const statusValue =
    typeof item.status === "string" ? item.status : toNumber(item.status);
  const statusName = toText(item.statusName);

  return {
    id,
    serviceRegistrationId: toNumber(item.serviceRegistrationId),
    status: statusValue,
    statusName,
    taskType: toNullableText(item.taskType) ?? undefined,
    taskTypeName: toNullableText(item.taskTypeName) ?? undefined,
    taskDate: toText(item.taskDate || item.date || item.scheduledDate),
    actualStartTime: toNullableText(item.actualStartTime),
    actualEndTime: toNullableText(item.actualEndTime),
    description: toNullableText(item.description),
    incidentReason: toNullableText(item.incidentReason),
    incidentImageUrl: toNullableText(item.incidentImageUrl),
    hasIncidents: toBoolean(item.hasIncidents, false),
    evidenceImageUrl: toNullableText(item.evidenceImageUrl),
    shift: shift
      ? {
        id: toNumber(shift.id),
        shiftName: toText(shift.shiftName),
        startTime: toText(shift.startTime),
        endTime: toText(shift.endTime),
      }
      : null,
    caretaker: caretaker
      ? {
        id: toNumber(caretaker.id),
        fullName: toText(caretaker.fullName),
        email: toText(caretaker.email),
        phone: toText(caretaker.phone),
        avatar: toNullableText(caretaker.avatar),
      }
      : null,
    customer: customer
      ? {
        id: toNumber(customer.id),
        fullName: toText(customer.fullName),
        email: toText(customer.email),
        phone: toNullableText(customer.phone),
        avatar: toNullableText(customer.avatar),
      }
      : null,
    servicePackage: isRecord(item.servicePackage)
      ? {
        id: toNumber(item.servicePackage.id),
        name: toText(item.servicePackage.name),
        description: toNullableText(item.servicePackage.description),
      }
      : null,
    serviceRegistration: serviceRegistration
      ? {
        id: toNumber(serviceRegistration.id),
        address: toText(serviceRegistration.address),
        phone: toText(serviceRegistration.phone),
        nurseryCareService: {
          id: toNumber(nurseryCareService?.id),
          nurseryId: toNumber(nurseryCareService?.nurseryId),
          nurseryName: toText(nurseryCareService?.nurseryName),
          careServicePackage: {
            id: toNumber(careServicePackage?.id),
            name: toText(careServicePackage?.name),
            description: toText(careServicePackage?.description),
            visitPerWeek: toNullableNumber(careServicePackage?.visitPerWeek),
            durationDays: toNumber(careServicePackage?.durationDays),
            serviceType: toNumber(careServicePackage?.serviceType),
            unitPrice: toNumber(careServicePackage?.unitPrice),
          },
        },
        customer: customer
          ? {
            id: toNumber(customer.id),
            fullName: toText(customer.fullName),
            email: toText(customer.email),
            phone: toNullableText(customer.phone),
            avatar: toNullableText(customer.avatar),
          }
          : null,
      }
      : null,
  };
};

const mapDesignTaskToScheduleItem = (item: unknown): unknown => {
  if (!isRecord(item)) {
    return item;
  }

  const registration = isRecord(item.registration) ? item.registration : null;
  const customer =
    registration && isRecord(registration.customer) ? registration.customer : null;
  const assignedStaff = isRecord(item.assignedStaff) ? item.assignedStaff : null;
  const designTemplateName = registration
    ? toText(registration.designTemplateName)
    : "";
  const taskTypeName = toText(item.taskTypeName, "Design Service");

  return {
    ...item,
    taskType: "DesignService",
    taskTypeName,
    taskDate: toText(
      (item.taskDate as unknown) ?? item.scheduledDate ?? item.createdAt,
    ),
    description: toNullableText(item.description) ?? taskTypeName,
    evidenceImageUrl: toNullableText(item.reportImageUrl),
    hasIncidents: false,
    incidentReason: null,
    incidentImageUrl: null,
    shift: null,
    caretaker: assignedStaff,
    customer,
    serviceRegistration: registration
      ? {
          id: toNumber(registration.id),
          address: toText(registration.address),
          phone: toText(registration.phone),
          customer,
          nurseryCareService: {
            id: 0,
            nurseryId: toNumber(registration.nurseryId),
            nurseryName: "",
            careServicePackage: {
              id: 0,
              name: designTemplateName || taskTypeName,
              description: taskTypeName,
              visitPerWeek: null,
              durationDays: 0,
              serviceType: 0,
              unitPrice: 0,
            },
          },
        }
      : null,
  };
};

const parseNurseryServiceScheduleItems = (payload: unknown): NurseryServiceScheduleItem[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => normalizeNurseryServiceScheduleItem(item))
      .filter((item): item is NurseryServiceScheduleItem => Boolean(item));
  }

  if (isRecord(payload)) {
    if (Array.isArray(payload.items)) {
      return payload.items
        .map((item) => normalizeNurseryServiceScheduleItem(item))
        .filter((item): item is NurseryServiceScheduleItem => Boolean(item));
    }

    const serviceProgresses = Array.isArray(payload.serviceProgresses)
      ? payload.serviceProgresses
      : [];
    const designTasks = Array.isArray(payload.designTasks)
      ? payload.designTasks
      : [];

    const tagged: unknown[] = [
      ...serviceProgresses.map((item) =>
        isRecord(item)
          ? {
              ...item,
              taskType: "CareService",
              taskTypeName: toText(item.taskTypeName, "Care Service"),
            }
          : item,
      ),
      ...designTasks.map((item) => mapDesignTaskToScheduleItem(item)),
    ];

    return tagged
      .map((item) => normalizeNurseryServiceScheduleItem(item))
      .filter((item): item is NurseryServiceScheduleItem => Boolean(item));
  }

  return [];
};

const buildPaginationParams = (query?: ServiceRegistrationsQuery) => {
  if (!query) {
    return undefined;
  }

  return {
    ...(typeof query.pageNumber === "number"
      ? { PageNumber: query.pageNumber }
      : {}),
    ...(typeof query.pageSize === "number" ? { PageSize: query.pageSize } : {}),
  };
};

const buildManagerRegistrationParams = (
  query?: ManagerServiceRegistrationsQuery,
) => {
  if (!query) {
    return undefined;
  }

  return {
    ...(typeof query.pageNumber === "number"
      ? { PageNumber: query.pageNumber }
      : {}),
    ...(typeof query.pageSize === "number" ? { PageSize: query.pageSize } : {}),
    ...(typeof query.skip === "number" ? { Skip: query.skip } : {}),
    ...(typeof query.take === "number" ? { Take: query.take } : {}),
    ...(typeof query.status === "number" ? { status: query.status } : {}),
  };
};

export const getManagerNurseryCareServices = async (
  loading = true,
): Promise<NurseryCareService[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "nursery-care-services/my",
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const raw = unwrapPayloadData(response);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(normalizeNurseryCareService)
    .filter((item): item is NurseryCareService => Boolean(item));
};

export const getManagerNotOfferedPackages = async (
  loading = true,
): Promise<CareServicePackage[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "nursery-care-services/not-offered-packages",
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const raw = unwrapPayloadData(response);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(normalizePackage)
    .filter((item): item is CareServicePackage => Boolean(item));
};

export const addManagerPackageToNursery = async (
  careServicePackageId: number,
  loading = true,
): Promise<NurseryCareService> => {
  const response = await apiClient.post<WrappedResponse<unknown>>(
    "nursery-care-services",
    { careServicePackageId },
    loading,
    MUTATION_CONFIG,
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
  loading = true,
): Promise<NurseryCareService> => {
  const response = await apiClient.patch<WrappedResponse<unknown>>(
    `nursery-care-services/${id}/toggle`,
    undefined,
    loading,
    MUTATION_CONFIG,
  );

  const raw = unwrapPayloadData(response);
  const normalized = normalizeNurseryCareService(raw);
  if (!normalized) {
    throw new Error("Không thể cập nhật trạng thái gói dịch vụ");
  }

  return normalized;
};

export const deleteManagerNurseryCareService = async (
  id: number,
  loading = true,
): Promise<void> => {
  await apiClient.del(`nursery-care-services/${id}`, loading, MUTATION_CONFIG);
};

export const getPublicCareServicePackages = async (
  loading = true,
): Promise<CareServicePackage[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "care-service-packages",
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const raw = unwrapPayloadData(response);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(normalizePackage)
    .filter((item): item is CareServicePackage => Boolean(item));
};

export const getPublicNurseryCareServicesByPackage = async (
  careServicePackageId: number,
  loading = true,
): Promise<NurseryCareService[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "nursery-care-services/by-package",
    { careServicePackageId },
    loading,
    QUERY_CONFIG,
  );

  const payload = unwrapPayloadData(response);
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => normalizeNurseryCareService(item))
    .filter((item): item is NurseryCareService => Boolean(item));
};

export const getCareServicePackageDetail = async (
  id: number,
  loading = true,
): Promise<CareServicePackage | null> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `care-service-packages/${id}`,
    undefined,
    loading,
    QUERY_CONFIG,
  );

  return normalizePackage(unwrapPayloadData(response));
};

export const createServiceRegistration = async (
  data: CreateServiceRegistrationRequest,
  loading = true,
): Promise<CreatedServiceRegistration> => {
  const response = await apiClient.post<
    WrappedResponse<CreatedServiceRegistration>
  >("service-registrations", data, loading, MUTATION_CONFIG);

  return unwrapPayloadData(response);
};

export const getCareServiceTypeEnums = async (
  loading = true,
): Promise<EnumOption[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "system/enums/care-services",
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const payload = unwrapPayloadData(response);
  if (Array.isArray(payload) && payload.length > 0) {
    return normalizeEnumOptions({ payload: payload[0] });
  }

  return [];
};

export const getCareReminderTypeEnums = async (
  loading = true,
): Promise<EnumOption[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "system/enums/care-reminders",
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const payload = unwrapPayloadData(response);
  if (Array.isArray(payload) && payload.length > 0) {
    return normalizeEnumOptions({ payload: payload[0] });
  }

  return [];
};

export const getDayOfWeekEnums = async (
  loading = true,
): Promise<EnumOption[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "system/enums/DayOfWeek",
    undefined,
    loading,
    QUERY_CONFIG,
  );

  return normalizeEnumOptions(response);
};

export const getSystemEnumValues = async (
  enumName: string,
  loading = true,
): Promise<EnumOption[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `system/enums/${encodeURIComponent(enumName)}`,
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const payload = unwrapPayloadData(response);
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0];
    if (isRecord(first) && Array.isArray(first.values)) {
      return first.values
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
    }

    return normalizeEnumOptions({ payload: first });
  }

  return normalizeEnumOptions(response);
};

export const getPublicShifts = async (
  loading = true,
): Promise<PublicShift[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "shifts",
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const payload = unwrapPayloadData(response);
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => normalizePublicShift(item))
    .filter((item): item is PublicShift => Boolean(item));
};

export const getMyServiceRegistrations = async (
  query?: ServiceRegistrationsQuery,
  loading = true,
): Promise<PaginatedApiResponse<MyServiceRegistration>> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "service-registrations/my",
    buildPaginationParams(query),
    loading,
    QUERY_CONFIG,
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
  loading = true,
): Promise<MyServiceRegistration> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `service-registrations/${id}`,
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Can not load service registration detail");
  }

  return normalized;
};

export const cancelServiceRegistration = async (
  id: number,
  cancelReason: string,
  loading = true,
): Promise<MyServiceRegistration> => {
  const trimmedReason = cancelReason.trim();
  const endpoint = `service-registrations/${id}/cancel?cancelReason=${encodeURIComponent(trimmedReason)}`;

  const response = await apiClient.post<WrappedResponse<unknown>>(
    endpoint,
    undefined,
    loading,
    MUTATION_CONFIG,
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Can not cancel service order");
  }

  return normalized;
};

export const getManagerNurseryServiceRegistrations = async (
  query?: ManagerServiceRegistrationsQuery,
  loading = true,
): Promise<PaginatedApiResponse<ManagerServiceRegistration>> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "service-registrations/nursery",
    buildManagerRegistrationParams(query),
    loading,
    QUERY_CONFIG,
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
      .filter((item): item is ManagerServiceRegistration => Boolean(item)),
    totalCount: toNumber(payload.totalCount),
    pageNumber: toNumber(payload.pageNumber, query?.pageNumber ?? 1),
    pageSize: toNumber(payload.pageSize, query?.pageSize ?? 10),
    totalPages: toNumber(payload.totalPages),
    hasPrevious: toBoolean(payload.hasPrevious),
    hasNext: toBoolean(payload.hasNext),
  };
};

export const getManagerNurseryServiceRegistrationDetail = async (
  id: number,
  loading = true,
): Promise<ManagerServiceRegistration> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `service-registrations/nursery/${id}`,
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Can not load service registration detail");
  }

  return normalized;
};

export const approveManagerServiceRegistration = async (
  id: number,
  loading = true,
): Promise<ManagerServiceRegistration> => {
  const response = await apiClient.post<WrappedResponse<unknown>>(
    `service-registrations/${id}/approve`,
    undefined,
    loading,
    MUTATION_CONFIG,
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Cannot approve service order");
  }

  return normalized;
};

export const rejectManagerServiceRegistration = async (
  id: number,
  rejectReason: string,
  loading = true,
): Promise<ManagerServiceRegistration> => {
  const trimmedReason = rejectReason.trim();
  const endpoint = `service-registrations/${id}/reject?rejectReason=${encodeURIComponent(trimmedReason)}`;

  const response = await apiClient.post<WrappedResponse<unknown>>(
    endpoint,
    undefined,
    loading,
    MUTATION_CONFIG,
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Cannot reject service order");
  }

  return normalized;
};

export const managerCancelServiceRegistration = async (
  id: number,
  cancelReason: string,
  loading = true,
): Promise<ManagerServiceRegistration> => {
  const trimmedReason = cancelReason.trim();
  const endpoint = `service-registrations/${id}/manager-cancel?cancelReason=${encodeURIComponent(trimmedReason)}`;

  const response = await apiClient.post<WrappedResponse<unknown>>(
    endpoint,
    undefined,
    loading,
    MUTATION_CONFIG,
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Cannot cancel service order");
  }

  return normalized;
};

export const getEligibleCaretakersForServiceRegistration = async (
  id: number,
  loading = true,
): Promise<EligibleCaretaker[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `service-registrations/${id}/eligible-caretakers`,
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const payload = unwrapPayloadData(response);
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => normalizeEligibleCaretaker(item))
    .filter((item): item is EligibleCaretaker => Boolean(item));
};

export const getEligibleCaretakersForReassgiCaretaker = async (
  id: number,
  loading = true,
): Promise<EligibleCaretaker[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `service-progress/${id}/eligible-caretakers`,
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const payload = unwrapPayloadData(response);
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => normalizeEligibleCaretaker(item))
    .filter((item): item is EligibleCaretaker => Boolean(item));
};

export const assignCaretakerToManagerServiceRegistration = async (
  id: number,
  data: AssignServiceRegistrationCaretakerRequest,
  loading = true,
): Promise<ManagerServiceRegistration> => {
  const response = await apiClient.put<WrappedResponse<unknown>>(
    `service-registrations/${id}/assign-caretaker`,
    data,
    loading,
    MUTATION_CONFIG,
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Cannot assign caretaker to service order");
  }

  return normalized;
};

export interface RescheduleServiceRegistrationRequest {
  serviceDate: string;
  preferredShiftId: number;
}

export const rescheduleManagerServiceRegistration = async (
  id: number,
  data: RescheduleServiceRegistrationRequest,
  loading = true,
): Promise<ManagerServiceRegistration> => {
  const response = await apiClient.put<WrappedResponse<unknown>>(
    `service-registrations/${id}/reschedule`,
    data,
    loading,
    MUTATION_CONFIG,
  );

  const normalized = normalizeServiceRegistration(unwrapPayloadData(response));
  if (!normalized) {
    throw new Error("Cannot reschedule service order");
  }

  return normalized;
};

export const getNurseryScheduleByDate = async (
  date: string,
  loading = true,
): Promise<NurseryServiceScheduleItem[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "service-progress/nursery-schedule/all-services",
    { date },
    loading,
    QUERY_CONFIG,
  );

  return parseNurseryServiceScheduleItems(unwrapPayloadData(response));
};

export const getServiceProgressDetail = async (
  id: number,
  loading = true,
): Promise<ServiceProgressDetail> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `service-progress/${id}`,
    undefined,
    loading,
    QUERY_CONFIG,
  );

  const normalized = normalizeNurseryServiceScheduleItem(
    unwrapPayloadData(response),
  );
  if (!normalized) {
    throw new Error("Cannot load service progress detail");
  }

  return normalized;
};

export const reassignServiceProgressCaretaker = async (
  id: number,
  data: ServiceProgressReassignRequest,
  loading = true,
): Promise<ServiceProgressDetail> => {
  const response = await apiClient.put<WrappedResponse<unknown>>(
    `service-progress/${id}/reassign`,
    data,
    loading,
    MUTATION_CONFIG,
  );

  const normalized = normalizeNurseryServiceScheduleItem(
    unwrapPayloadData(response),
  );
  if (!normalized) {
    throw new Error("Cannot reassign caretaker for service progress");
  }

  return normalized;
};

export const getCaretakerScheduleByRange = async (
  caretakerId: number,
  from: string,
  to: string,
  loading = true,
): Promise<NurseryServiceScheduleItem[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `service-progress/nursery-schedule/caretaker/${caretakerId}/all-services`,
    { from, to },
    loading,
    QUERY_CONFIG,
  );
  return parseNurseryServiceScheduleItems(unwrapPayloadData(response));;
};

export const getStaffScheduleByRange = async (
  staffId: number,
  from: string,
  to: string,
  loading = true
): Promise<NurseryServiceScheduleItem[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `service-progress/nursery-schedule/caretaker/${staffId}/all-services`,
    { from, to },
    loading,
    QUERY_CONFIG
  );

  return parseNurseryServiceScheduleItems(unwrapPayloadData(response));
};
