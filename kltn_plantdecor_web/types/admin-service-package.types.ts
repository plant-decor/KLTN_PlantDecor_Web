export interface AdminCareServicePackageListItem {
  id: number;
  name: string;
  description: string;
  features: string;
  serviceType: number;
  serviceTypeLabel?: string;
  visitPerWeek: number | null;
  durationDays: number;
  totalSessions?: number | null;
  areaLimit: number;
  unitPrice: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCareServicePackageDetail extends AdminCareServicePackageListItem {
  specializationIds?: number[];
  specializations?: AdminSpecializationOption[];
}

export interface AdminCareServicePackageCreateRequest {
  name: string;
  description: string;
  features: string;
  serviceType: number;
  visitPerWeek: number;
  durationDays: number;
  areaLimit: number;
  unitPrice: number;
  specializationIds: number[];
}

export interface AdminCareServicePackageUpdateRequest {
  name: string;
  description: string;
  features: string;
  serviceType: number;
  visitPerWeek: number;
  durationDays: number;
  areaLimit: number;
  unitPrice: number;
  isActive: boolean;
}

export interface CareServiceTypeOption {
  value: number;
  label: string;
}

export interface AdminSpecializationOption {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}
