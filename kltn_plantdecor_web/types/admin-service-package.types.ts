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

export interface AdminCareServicePackageSuitabilityRule {
  id?: number;
  careServicePackageId?: number;
  categoryId?: number | null;
  categoryName?: string | null;
  careDifficultyLevel?: number | null;
  careDifficultyLevelName?: string | null;
}

export interface AdminCareServicePackageSuitabilityRuleCreateRequest {
  categoryId?: number;
  careDifficultyLevel?: number;
}

export interface AdminCareServicePackageDetail extends AdminCareServicePackageListItem {
  specializationIds?: number[];
  specializations?: AdminSpecializationOption[];
  suitabilityRules?: AdminCareServicePackageSuitabilityRule[];
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
  suitabilityRules?: AdminCareServicePackageSuitabilityRuleCreateRequest[];
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
