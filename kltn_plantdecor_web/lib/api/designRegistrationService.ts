"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";
import type {
  AssignDesignTaskRequest,
  RescheduleDesignTaskRequest,
  CustomerDesignRegistrationRequest,
  CustomerDesignRegistrationResponse,
  CustomerDesignRegistrationListItem,
  CustomerDesignRegistrationDetail,
  DesignEligibleCaretaker,
  DesignEligibleCaretakerAvailability,
  DesignFlowEnumGroup,
  DesignFlowEnumValue,
  DesignRegistrationTask,
  DesignRegistrationsQuery,
  PaginatedDesignRegistrationResponse,
} from "@/types/design-registration.types";

type WrappedResponse<T> = ResponseModel<T> | T;

const QUERY_CONFIG = { showToast: false, showErrorToast: false };
const MUTATION_CONFIG = { showToast: false, showErrorToast: false };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value: unknown, fallback = ""): string => typeof value === "string" ? value : fallback;

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return fallback;
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
    nurseryId: value.nurseryId == null ? null : toNumber(value.nurseryId),
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

const normalizeDesignFlowEnumValue = (value: unknown): DesignFlowEnumValue | null => {
  if (!isRecord(value)) {
    return null;
  }

  const enumValue = toNumber(value.value, Number.NaN);
  if (!Number.isFinite(enumValue)) {
    return null;
  }

  return {
    value: enumValue,
    name: toText(value.name),
  };
};

const normalizeDesignFlowEnumGroup = (value: unknown): DesignFlowEnumGroup | null => {
  if (!isRecord(value)) {
    return null;
  }

  const enumName = toText(value.enumName);
  if (!enumName) {
    return null;
  }

  return {
    enumName,
    values: Array.isArray(value.values)
      ? value.values
        .map(normalizeDesignFlowEnumValue)
        .filter((item): item is DesignFlowEnumValue => Boolean(item))
      : [],
  };
};

const normalizeDesignRegistrationCustomer = (value: unknown): CustomerDesignRegistrationListItem["customer"] | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    fullName: toText(value.fullName),
    email: toText(value.email),
    phone: toText(value.phone),
    avatar: value.avatar == null ? null : toText(value.avatar),
  };
};

const normalizeDesignRegistrationNursery = (value: unknown): CustomerDesignRegistrationListItem["nursery"] | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    name: toText(value.name),
  };
};

const normalizeDesignTemplatePreview = (value: unknown): CustomerDesignRegistrationListItem["designTemplateTier"]["designTemplate"] | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    name: toText(value.name),
    description: toText(value.description),
    imageUrl: toText(value.imageUrl),
    style: toNumber(value.style),
    roomTypes: Array.isArray(value.roomTypes) ? value.roomTypes.map((item) => toNumber(item)).filter(Number.isFinite) : [],
  };
};

const normalizeDesignRegistrationTier = (value: unknown): CustomerDesignRegistrationListItem["designTemplateTier"] | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    tierName: toText(value.tierName),
    minArea: toNumber(value.minArea),
    maxArea: toNumber(value.maxArea),
    packagePrice: toNumber(value.packagePrice),
    estimatedDays: toNumber(value.estimatedDays),
    scopedOfWork: toText(value.scopedOfWork),
    designTemplate: normalizeDesignTemplatePreview(value.designTemplate) ?? {
      id: 0,
      name: "",
      description: "",
      imageUrl: "",
      style: 0,
      roomTypes: [],
    },
  };
};

const normalizeDesignRegistrationTaskMaterialUsage = (value: unknown): CustomerDesignRegistrationListItem["designTasks"][number]["taskMaterialUsages"][number] | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    materialId: toNumber(value.materialId),
    materialName: toText(value.materialName),
    actualQuantity: toNumber(value.actualQuantity),
    note: toText(value.note),
  };
};

const normalizeDesignRegistrationTask = (value: unknown): CustomerDesignRegistrationListItem["designTasks"][number] | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const assignedStaff = isRecord(value.assignedStaff) ? value.assignedStaff : undefined;
  const registration = isRecord(value.registration) ? value.registration : undefined;

  return {
    id,
    designRegistrationId: toNumber(value.designRegistrationId),
    assignedStaffId: value.assignedStaffId == null ? null : toNumber(value.assignedStaffId),
    scheduledDate: value.scheduledDate == null ? null : toText(value.scheduledDate),
    taskType: toNumber(value.taskType),
    taskTypeName: toText(value.taskTypeName),
    reportImageUrl: value.reportImageUrl == null ? null : toText(value.reportImageUrl),
    createdAt: toText(value.createdAt),
    status: toNumber(value.status),
    statusName: toText(value.statusName),
    assignedStaff: assignedStaff == null
      ? null
      : {
        id: toNumber(assignedStaff.id),
        fullName: toText(assignedStaff.fullName),
        email: toText(assignedStaff.email),
        phone: toText(assignedStaff.phone),
        avatar: assignedStaff.avatar == null ? null : toText(assignedStaff.avatar),
      },
    registration: {
      id: toNumber(registration?.id),
      userId: toNumber(registration?.userId),
      assignedCaretakerId: registration?.assignedCaretakerId == null ? null : toNumber(registration?.assignedCaretakerId),
      nurseryId: toNumber(registration?.nurseryId),
      status: toNumber(registration?.status),
      statusName: toText(registration?.statusName),
      address: toText(registration?.address),
      phone: toText(registration?.phone),
    },
    taskMaterialUsages: Array.isArray(value.taskMaterialUsages)
      ? value.taskMaterialUsages.map(normalizeDesignRegistrationTaskMaterialUsage).filter((item): item is CustomerDesignRegistrationListItem["designTasks"][number]["taskMaterialUsages"][number] => Boolean(item))
      : [],
  };
};

const normalizeDesignRegistration = (value: unknown): CustomerDesignRegistrationListItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const assignedCaretaker = isRecord(value.assignedCaretaker) ? value.assignedCaretaker : undefined;

  return {
    id,
    userId: toNumber(value.userId),
    orderId: value.orderId == null ? null : toNumber(value.orderId),
    nurseryId: value.nurseryId == null ? null : toNumber(value.nurseryId),
    designTemplateTierId: toNumber(value.designTemplateTierId),
    assignedCaretakerId: value.assignedCaretakerId == null ? null : toNumber(value.assignedCaretakerId),
    totalPrice: toNumber(value.totalPrice),
    depositAmount: toNumber(value.depositAmount),
    latitude: toNumber(value.latitude),
    longitude: toNumber(value.longitude),
    width: value.width == null ? null : toNumber(value.width),
    length: value.length == null ? null : toNumber(value.length),
    currentStateImageUrl: value.currentStateImageUrl == null ? null : toText(value.currentStateImageUrl),
    address: toText(value.address),
    phone: toText(value.phone),
    customerNote: toText(value.customerNote) || undefined,
    cancelReason: value.cancelReason == null ? null : toText(value.cancelReason),
    status: toNumber(value.status),
    statusName: toText(value.statusName),
    createdAt: toText(value.createdAt) || '',
    approvedAt: value.approvedAt == null ? null : toText(value.approvedAt),
    customer: value.customer == null ? null : normalizeDesignRegistrationCustomer(value.customer),
    assignedCaretaker: assignedCaretaker == null
      ? null
      : {
        id: toNumber(assignedCaretaker.id),
        fullName: toText(assignedCaretaker.fullName),
        email: toText(assignedCaretaker.email),
        phone: toText(assignedCaretaker.phone),
        avatar: assignedCaretaker.avatar == null ? null : toText(assignedCaretaker.avatar),
      },
    nursery: value.nursery == null ? null : normalizeDesignRegistrationNursery(value.nursery),
    designTemplateTier: normalizeDesignRegistrationTier(value.designTemplateTier) ?? {
      id: 0,
      tierName: '',
      minArea: 0,
      maxArea: 0,
      packagePrice: 0,
      estimatedDays: 0,
      scopedOfWork: '',
      designTemplate: {
        id: 0,
        name: '',
        description: '',
        imageUrl: '',
        style: 0,
        roomTypes: [],
      },
    },
    designTasks: Array.isArray(value.designTasks)
      ? value.designTasks.map(normalizeDesignRegistrationTask).filter((item): item is CustomerDesignRegistrationListItem["designTasks"][number] => Boolean(item))
      : [],
  };
};

const normalizeEligibleCaretakerSpecialization = (value: unknown): DesignEligibleCaretaker["specializations"][number] | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    name: toText(value.name),
    description: toText(value.description),
  };
};

const normalizeEligibleCaretaker = (value: unknown): DesignEligibleCaretaker | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    id,
    username: toText(value.username),
    email: toText(value.email),
    phoneNumber: toText(value.phoneNumber),
    avatarUrl: value.avatarUrl == null ? null : toText(value.avatarUrl),
    status: toNumber(value.status),
    specializations: Array.isArray(value.specializations)
      ? value.specializations
        .map(normalizeEligibleCaretakerSpecialization)
        .filter((item): item is DesignEligibleCaretaker["specializations"][number] => Boolean(item))
      : [],
  };
};

const normalizeEligibleCaretakerAvailability = (value: unknown): DesignEligibleCaretakerAvailability | null => {
  if (!isRecord(value)) {
    return null;
  }

  const staff = normalizeEligibleCaretaker(value.staff);
  if (!staff) {
    return null;
  }

  return {
    staff,
    isAvailable: toBoolean(value.isAvailable),
    conflictDates: Array.isArray(value.conflictDates)
      ? value.conflictDates.map((item) => toText(item)).filter(Boolean)
      : [],
  };
};

export const getDesignFlowEnums = async (loading = true): Promise<DesignFlowEnumGroup[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "system/enums/design-flow",
    undefined,
    loading,
    QUERY_CONFIG
  );

  const payload = unwrapPayloadData(response);
  return Array.isArray(payload)
    ? payload
      .map(normalizeDesignFlowEnumGroup)
      .filter((item): item is DesignFlowEnumGroup => Boolean(item))
    : [];
};

export const getDesignFlowEnumValues = (
  groups: DesignFlowEnumGroup[],
  enumName: string
): DesignFlowEnumValue[] => groups.find((group) => group.enumName === enumName)?.values ?? [];

export const buildDesignFlowLabelMap = (
  groups: DesignFlowEnumGroup[],
  enumName: string,
  formatter: (value: string) => string = (value) => value
): Record<number, string> => {
  return getDesignFlowEnumValues(groups, enumName).reduce<Record<number, string>>((accumulator, item) => {
    accumulator[item.value] = formatter(item.name);
    return accumulator;
  }, {});
};

export const getMyDesignRegistrations = async (
  query?: DesignRegistrationsQuery,
  loading = true
): Promise<PaginatedDesignRegistrationResponse<CustomerDesignRegistrationListItem>> => {
  const params = {
    pageNumber: query?.pageNumber,
    pageSize: query?.pageSize,
    skip: query?.skip,
    take: query?.take,
    status: query?.status,
  };
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "design-registrations/my",
    params,
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
      .map(normalizeDesignRegistration)
      .filter((item): item is CustomerDesignRegistrationListItem => Boolean(item)),
    totalCount: toNumber(payload.totalCount),
    pageNumber: toNumber(payload.pageNumber, query?.pageNumber ?? 1),
    pageSize: toNumber(payload.pageSize, query?.pageSize ?? 10),
    totalPages: toNumber(payload.totalPages),
    hasPrevious: toBoolean(payload.hasPrevious),
    hasNext: toBoolean(payload.hasNext),
  };
};

export const getNurseryDesignRegistrations = async (
  query?: DesignRegistrationsQuery,
  loading = true
): Promise<PaginatedDesignRegistrationResponse<CustomerDesignRegistrationListItem>> => {
  const params = {
    pageNumber: query?.pageNumber,
    pageSize: query?.pageSize,
    skip: query?.skip,
    take: query?.take,
    status: query?.status,
  };
  const response = await apiClient.get<WrappedResponse<unknown>>(
    "design-registrations/nursery",
    params,
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
      .map(normalizeDesignRegistration)
      .filter((item): item is CustomerDesignRegistrationListItem => Boolean(item)),
    totalCount: toNumber(payload.totalCount),
    pageNumber: toNumber(payload.pageNumber, query?.pageNumber ?? 1),
    pageSize: toNumber(payload.pageSize, query?.pageSize ?? 10),
    totalPages: toNumber(payload.totalPages),
    hasPrevious: toBoolean(payload.hasPrevious),
    hasNext: toBoolean(payload.hasNext),
  };
};

export const getDesignRegistrationDetail = async (
  id: number,
  loading = true
): Promise<CustomerDesignRegistrationDetail> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `design-registrations/${id}`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  const detail = normalizeDesignRegistration(unwrapPayloadData(response));
  if (!detail) {
    throw new Error("Cannot load design registration detail");
  }

  return detail;
};

export const getNurseryDesignRegistrationDetail = async (
  id: number,
  loading = true
): Promise<CustomerDesignRegistrationDetail> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `design-registrations/nursery/${id}`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  const detail = normalizeDesignRegistration(unwrapPayloadData(response));
  if (!detail) {
    throw new Error("Cannot load nursery design registration detail");
  }

  return detail;
};

export const approveDesignRegistration = async (
  id: number,
  loading = true
): Promise<CustomerDesignRegistrationDetail> => {
  const response = await apiClient.post<WrappedResponse<unknown>>(
    `design-registrations/${id}/approve`,
    undefined,
    loading,
    MUTATION_CONFIG
  );

  const detail = normalizeDesignRegistration(unwrapPayloadData(response));
  if (!detail) {
    throw new Error("Cannot approve design registration");
  }

  return detail;
};

export const rejectDesignRegistration = async (
  id: number,
  rejectReason: string,
  loading = true
): Promise<CustomerDesignRegistrationDetail> => {
  const trimmedReason = rejectReason.trim();
  const endpoint = `design-registrations/${id}/reject?rejectReason=${encodeURIComponent(trimmedReason)}`;

  const response = await apiClient.post<WrappedResponse<unknown>>(
    endpoint,
    undefined,
    loading,
    MUTATION_CONFIG
  );

  const detail = normalizeDesignRegistration(unwrapPayloadData(response));
  if (!detail) {
    throw new Error("Cannot reject design registration");
  }

  return detail;
};

export const assignCaretakerToDesignRegistration = async (
  id: number,
  payload: { caretakerId: number },
  loading = true
): Promise<CustomerDesignRegistrationDetail> => {
  const response = await apiClient.post<WrappedResponse<unknown>>(
    `design-registrations/${id}/assign-caretaker`,
    payload,
    loading,
    MUTATION_CONFIG
  );

  const detail = normalizeDesignRegistration(unwrapPayloadData(response));
  if (!detail) {
    throw new Error("Cannot assign caretaker to design registration");
  }

  return detail;
};

export const managerCancelDesignRegistration = async (
  id: number,
  cancelReason: string,
  loading = true
): Promise<CustomerDesignRegistrationDetail> => {
  const trimmedReason = cancelReason.trim();
  const endpoint = `design-registrations/${id}/manager-cancel?cancelReason=${encodeURIComponent(trimmedReason)}`;

  const response = await apiClient.post<WrappedResponse<unknown>>(
    endpoint,
    undefined,
    loading,
    MUTATION_CONFIG
  );

  const detail = normalizeDesignRegistration(unwrapPayloadData(response));
  if (!detail) {
    throw new Error("Cannot cancel design registration");
  }

  return detail;
};

export const cancelDesignRegistration = async (
  id: number,
  cancelReason: string,
  loading = true
): Promise<CustomerDesignRegistrationDetail> => {
  const trimmedReason = cancelReason.trim();
  const endpoint = `design-registrations/${id}/cancel?cancelReason=${encodeURIComponent(trimmedReason)}`;

  const response = await apiClient.post<WrappedResponse<unknown>>(
    endpoint,
    undefined,
    loading,
    MUTATION_CONFIG
  );

  const detail = normalizeDesignRegistration(unwrapPayloadData(response));
  if (!detail) {
    throw new Error("Cannot cancel design registration");
  }

  return detail;
};

export const createDesignRegistration = async (
  payload: CustomerDesignRegistrationRequest,
  loading = true
): Promise<CustomerDesignRegistrationResponse> => {
  const requestBody = {
    designTemplateTierId: payload.designTemplateTierId,
    latitude: payload.latitude,
    longitude: payload.longitude,
    address: payload.address,
    phone: payload.phone,
    customerNote: payload.customerNote,
    ...(payload.nurseryId ? { nurseryId: payload.nurseryId } : {}),
  };
  const response = await apiClient.post<WrappedResponse<unknown>>("design-registrations", requestBody, loading, MUTATION_CONFIG);
  const registration = normalizeRegistration(unwrapPayloadData(response));

  return (
    registration ?? {
      id: 0,
      nurseryId: payload.nurseryId ?? null,
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

export const getDesignTasksByRegistration = async (
  registrationId: number,
  loading = true
): Promise<DesignRegistrationTask[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `design-tasks/by-registration/${registrationId}`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  const payload = unwrapPayloadData(response);
  return Array.isArray(payload)
    ? payload
      .map(normalizeDesignRegistrationTask)
      .filter((item): item is DesignRegistrationTask => Boolean(item))
    : [];
};

export const getDesignTaskDetail = async (
  id: number,
  loading = true
): Promise<DesignRegistrationTask> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `design-tasks/${id}`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  const task = normalizeDesignRegistrationTask(unwrapPayloadData(response));
  if (!task) {
    throw new Error("Cannot load design task detail");
  }

  return task;
};

export const getEligibleCaretakersForDesignRegistration = async (
  id: number,
  loading = true
): Promise<DesignEligibleCaretaker[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `design-registrations/${id}/eligible-caretakers`,
    undefined,
    loading,
    QUERY_CONFIG
  );

  const payload = unwrapPayloadData(response);
  return Array.isArray(payload)
    ? payload
      .map(normalizeEligibleCaretaker)
      .filter((item): item is DesignEligibleCaretaker => Boolean(item))
    : [];
};

export const getEligibleCaretakersWithAvailabilityForDesignRegistration = async (
  id: number,
  startDate: string,
  loading = true
): Promise<DesignEligibleCaretakerAvailability[]> => {
  const response = await apiClient.get<WrappedResponse<unknown>>(
    `design-registrations/${id}/eligible-caretakers-with-availability`,
    { startDate },
    loading,
    QUERY_CONFIG
  );

  const payload = unwrapPayloadData(response);
  return Array.isArray(payload)
    ? payload
      .map(normalizeEligibleCaretakerAvailability)
      .filter((item): item is DesignEligibleCaretakerAvailability => Boolean(item))
    : [];
};

export const assignDesignTask = async (
  id: number,
  data: AssignDesignTaskRequest,
  loading = true
): Promise<DesignRegistrationTask> => {
  const response = await apiClient.put<WrappedResponse<unknown>>(
    `design-tasks/${id}/assign`,
    data,
    loading,
    MUTATION_CONFIG
  );

  const task = normalizeDesignRegistrationTask(unwrapPayloadData(response));
  if (!task) {
    throw new Error("Cannot assign design task");
  }

  return task;
};

export const rescheduleDesignTask = async (
  id: number,
  data: RescheduleDesignTaskRequest,
  loading = true
): Promise<DesignRegistrationTask> => {
  const response = await apiClient.put<WrappedResponse<unknown>>(
    `design-tasks/${id}/reschedule`,
    data,
    loading,
    MUTATION_CONFIG
  );

  const task = normalizeDesignRegistrationTask(unwrapPayloadData(response));
  if (!task) {
    throw new Error("Cannot reschedule design task");
  }

  return task;
};
