import type { PlantGuideFormData } from '@/types/admin-plant-guide.types';

// Plant (Admin) Types
export interface PlantEnumValue {
  value: number;
  name: string;
}

export interface PlantEnumGroup {
  enumName: 'PlacementType' | 'PlantSize' | 'CareLevelType' | string;
  values: PlantEnumValue[];
}

export interface PlantEnumPayload {
  placementTypes: PlantEnumValue[];
  sizes: PlantEnumValue[];
  careLevelTypes: PlantEnumValue[];
  lightRequirements: PlantEnumValue[];
}

export interface Plant {
  id: number;
  name: string;
  basePrice: number;
  size: number;
  sizeName: string;
  careLevelType: number;
  careLevelTypeName: string;
  careLevel: string;
  isActive: boolean;
  primaryImageUrl: string | null;
  totalInstances: number;
  availableInstances: number;
  availableCommonQuantity: number;
  totalAvailableStock: number;
  categoryNames: string[];
  tagNames: string[];
}

export interface PlantCategory {
  id: number;
  parentCategoryId?: number | null;
  name: string;
  isActive?: boolean;
  categoryType?: number;
  categoryTypeName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  parentCategoryName?: string | null;
}

export interface PlantTag {
  id: number;
  name?: string;
  tagName?: string;
  tagType?: number;
  tagTypeName?: string | null;
}

export interface PlantDetailImage {
  id: number;
  imageUrl: string;
}

export interface PlantDetail {
  id: number;
  name: string;
  specificName: string | null;
  origin: string | null;
  description: string | null;
  basePrice: number;
  placementType: number;
  placementTypeName?: string;
  size: number;
  sizeName?: string;
  growthRate: string | null;
  toxicity: boolean;
  airPurifying: boolean;
  hasFlower: boolean;
  petSafe: boolean;
  childSafe: boolean;
  fengShuiElement: number | null;
  fengShuiMeaning: string | null;
  potIncluded: boolean;
  potSize: string | null;
  careLevelType: number;
  careLevelTypeName?: string;
  careLevel: string;
  isActive: boolean;
  isUniqueInstance: boolean;
  createdAt?: string;
  updatedAt?: string;
  categories: PlantCategory[];
  tags: PlantTag[];
  images: PlantDetailImage[];
  totalInstances?: number;
  availableInstances?: number;
}

export interface PlantUpsertRequest {
  name: string;
  specificName: string;
  origin: string;
  description: string;
  basePrice: number;
  placementType: number;
  size: number;
  growthRate: string;
  toxicity: boolean;
  airPurifying: boolean;
  hasFlower: boolean;
  petSafe: boolean;
  childSafe: boolean;
  fengShuiElement: number;
  fengShuiMeaning: string;
  potIncluded: boolean;
  potSize: string;
  careLevelType: number;
  careLevel: string;
  isActive: boolean;
  isUniqueInstance: boolean;
}

export interface PlantFormData extends PlantUpsertRequest {
  categoryIds: number[];
  tagIds: number[];
  plantGuide?: PlantGuideFormData;
}

// Plant Combo Types
export interface PlantCombo {
  id: number;
  comboCode: string;
  comboName: string;
  comboType: number;
  comboTypeName?: string;
  description: string;
  suitableSpace: string;
  suitableRooms: string[];
  fengShuiElement: number | null;
  fengShuiPurpose: string;
  petSafe?: boolean;
  childSafe?: boolean;
  themeName: string;
  themeDescription: string;
  comboPrice: number;
  season: number;
  seasonName?: string;
  viewCount: number;
  purchaseCount?: number;
  isActive: boolean;
  primaryImageUrl?: string | null;
  totalItems?: number;
  createdAt?: string;
  updatedAt?: string;
  comboItems?: PlantComboItem[];
  tagsNavigation?: PlantComboTag[];
  images?: PlantComboImage[];
}

export interface PlantComboItem {
  id?: number;
  plantComboId?: number;
  plantId: number;
  plantName?: string;
  quantity: number;
  notes?: string | null;
}

export interface PlantComboTag {
  id: number;
  tagName: string;
  tagType?: number | null;
  tagTypeName?: string | null;
}

export interface PlantComboImage {
  id: number;
  imageUrl: string;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface PlantComboListPayload {
  items: PlantCombo[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PlantComboCreateRequest {
  comboCode: string;
  comboName: string;
  comboType: number;
  description: string;
  suitableSpace: string;
  suitableRooms: string[];
  fengShuiElement: number;
  fengShuiPurpose: string;
  themeName: string;
  themeDescription: string;
  comboPrice: number;
  season: number;
  isActive: boolean;
  comboItems: Array<{
    plantId: number;
    quantity: number;
    notes?: string;
  }>;
}

export interface PlantComboUpdateRequest {
  comboName: string;
  comboType: number;
  description: string;
  suitableSpace: string;
  suitableRooms: string[];
  fengShuiElement: number;
  fengShuiPurpose: string;
  themeName: string;
  themeDescription: string;
  comboPrice: number;
  season: number;
  isActive: boolean;
}

export interface PlantComboAssignTagsRequest {
  plantComboId: number;
  tagIds: number[];
}

export interface PlantComboItemUpsertRequest {
  plantId: number;
  quantity: number;
  notes?: string;
}

export interface PlantComboFormData {
  comboCode: string;
  comboName: string;
  comboType: number;
  description: string;
  suitableSpace: string;
  suitableRooms: string[];
  fengShuiElement: number;
  fengShuiPurpose: string;
  themeName: string;
  themeDescription: string;
  comboPrice: number;
  season: number;
  isActive: boolean;
  tagIds: number[];
  comboItems: PlantComboItem[];
}

// Plant Instance Types
export interface PlantInstance {
  id: number;
  plantId: number;
  currentNurseryId: number;
  sku: string;
  specificPrice: number;
  height: number;
  trunkDiameter: number;
  healthStatus: string;
  age: number;
  description: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
  images?: PlantInstanceImage[];
}

export interface PlantInstanceImage {
  id?: number;
  plantInstanceId?: number;
  url: string;
  preview?: string;
  isThumbnail: boolean;
  createdAt?: string;
}

// Material Types
export interface Material {
  id: number;
  materialCode: string;
  name: string;
  description?: string | null;
  basePrice: number;
  unit: string;
  brand: string;
  specifications?: Record<string, unknown> | null;
  expiryMonths?: number | null;
  isActive: boolean;
  primaryImageUrl?: string | null;
  categoryNames?: string[];
  tagNames?: string[];
  createdAt?: string;
  updatedAt?: string;
  images?: MaterialImage[];
}

export interface MaterialCategory {
  id: number;
  parentCategoryId?: number | null;
  name: string;
  isActive?: boolean;
  categoryType?: number;
  categoryTypeName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  parentCategoryName?: string | null;
  subCategories?: MaterialCategory[];
}

export interface MaterialTag {
  id: number;
  tagName: string;
  tagType?: number | null;
  tagTypeName?: string | null;
}

export interface MaterialImage {
  id: number;
  imageUrl: string;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface MaterialDetail {
  id: number;
  materialCode: string;
  name: string;
  description: string | null;
  basePrice: number;
  unit: string;
  brand: string;
  specifications: Record<string, unknown> | null;
  expiryMonths: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  categories: MaterialCategory[];
  tags: MaterialTag[];
  images: MaterialImage[];
}

export interface MaterialUpsertRequest {
  materialCode?: string;
  name: string;
  description: string;
  basePrice: number;
  unit: string;
  brand: string;
  specifications?: string | null;
  expiryMonths?: number | null;
  isActive: boolean;
  categoryId?: number[];
  tagId?: number[];
}

export interface MaterialFormData extends MaterialUpsertRequest {
  categoryIds: number[];
  tagIds: number[];
}

// Common types
export interface ImageUploadData {
  file?: File;
  isThumbnail: boolean;
  preview: string;
  id?: number;
  existingImageId?: number;
  plantId?: number;
  plantComboId?: number;
  plantInstanceId?: number;
  materialId?: number;
  url?: string;
  createdAt?: string;
}

export interface DialogState {
  open: boolean;
  editingId: number | null;
  editingData: unknown;
}

export interface StoreUserSpecialization {
  id: number;
  name: string;
  description: string;
}

export interface StoreUserSpecializationOption {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface StoreUserItem {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  status: number;
  specializations: StoreUserSpecialization[];
}

export interface StoreUserListPayload {
  items: StoreUserItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface StoreUserListQuery {
  pageNumber?: number;
  pageSize?: number;
}

export interface AssignStoreUserSpecializationRequest {
  specializationId: number;
}

export interface ReplaceStoreUserSpecializationsRequest {
  specializationIds: number[];
}
