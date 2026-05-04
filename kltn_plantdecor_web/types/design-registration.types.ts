import type { DesignTemplateNurseryOffering } from '@/types/admin-design-template.types';

export interface MarketedDesignTemplateTierItem {
  id: number;
  designTemplateTierId: number;
  materialId: number | null;
  plantId: number | null;
  itemType: number;
  quantity: number;
  createdAt?: string;
}

export interface MarketedDesignTemplateTier {
  id: number;
  designTemplateId: number;
  tierName: string;
  minArea: number;
  maxArea: number;
  packagePrice: number;
  scopedOfWork: string;
  estimatedDays: number;
  isActive: boolean;
  createdAt?: string;
  items: MarketedDesignTemplateTierItem[];
}

export interface MarketedDesignTemplate {
  id: number;
  name: string;
  description: string;
  style: number;
  roomTypes: number[];
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
  specializations?: Array<{ id: number; name: string; description?: string }>;
  tiers: MarketedDesignTemplateTier[];
  nurseryOfferings: DesignTemplateNurseryOffering[];
}

export interface MarketedDesignTemplateTierNursery {
  id: number;
  nurseryId: number;
  nurseryName: string;
  designTemplateId: number;
  designTemplateName: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CustomerDesignRegistrationRequest {
  nurseryId?: number | null;
  designTemplateTierId: number;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  customerNote?: string;
}

export interface CustomerDesignRegistrationResponse {
  id: number;
  nurseryId: number | null;
  designTemplateTierId: number;
  totalPrice: number;
  depositAmount: number;
  address: string;
  phone: string;
  customerNote?: string;
  status: number;
  statusName: string;
  createdAt?: string;
}

export interface DesignRegistrationCustomer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string | null;
}

export interface DesignRegistrationNursery {
  id: number;
  name: string;
}

export interface DesignFlowEnumValue {
  value: number;
  name: string;
}

export interface DesignFlowEnumGroup {
  enumName: 'DesignRegistrationStatus' | 'DesignTaskStatus' | 'TaskType' | string;
  values: DesignFlowEnumValue[];
}

export interface DesignTemplatePreview {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  style: number;
  roomTypes: number[];
}

export interface DesignRegistrationTierDetail {
  id: number;
  tierName: string;
  minArea: number;
  maxArea: number;
  packagePrice: number;
  estimatedDays: number;
  scopedOfWork: string;
  designTemplate: DesignTemplatePreview;
}

export interface DesignRegistrationTaskMaterialUsage {
  id: number;
  materialId: number;
  materialName: string;
  actualQuantity: number;
  note: string;
}

export interface DesignRegistrationTask {
  id: number;
  designRegistrationId: number;
  assignedStaffId: number | null;
  scheduledDate?: string | null;
  taskType: number;
  taskTypeName: string;
  reportImageUrl?: string | null;
  createdAt: string;
  status: number;
  statusName: string;
  assignedStaff: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string | null;
  } | null;
  registration: {
    id: number;
    userId: number;
    assignedCaretakerId: number | null;
    nurseryId: number;
    status: number;
    statusName: string;
    address: string;
    phone: string;
  };
  taskMaterialUsages: DesignRegistrationTaskMaterialUsage[];
}

export interface CustomerDesignRegistrationListItem {
  id: number;
  userId: number;
  orderId: number | null;
  nurseryId: number | null;
  designTemplateTierId: number;
  assignedCaretakerId: number | null;
  totalPrice: number;
  depositAmount: number;
  latitude: number;
  longitude: number;
  width: number | null;
  length: number | null;
  currentStateImageUrl?: string | null;
  address: string;
  phone: string;
  customerNote?: string;
  cancelReason?: string | null;
  status: number;
  statusName: string;
  createdAt: string;
  approvedAt?: string | null;
  customer?: DesignRegistrationCustomer | null;
  assignedCaretaker?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string | null;
  } | null;
  nursery: DesignRegistrationNursery | null;
  designTemplateTier: DesignRegistrationTierDetail;
  designTasks: DesignRegistrationTask[];
}

export type CustomerDesignRegistrationDetail = CustomerDesignRegistrationListItem;

export interface DesignEligibleCaretakerSpecialization {
  id: number;
  name: string;
  description: string;
}

export interface DesignEligibleCaretaker {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  status: number;
  specializations: DesignEligibleCaretakerSpecialization[];
}

export interface DesignEligibleCaretakerAvailability {
  staff: DesignEligibleCaretaker;
  isAvailable: boolean;
  conflictDates: string[];
}

export interface AssignDesignTaskRequest {
  assignedStaffId: number;
  scheduledDate: string;
}

export interface DesignRegistrationsQuery {
  pageNumber?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
  status?: number;
}

export interface PaginatedDesignRegistrationResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
