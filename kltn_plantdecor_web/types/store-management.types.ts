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
  fengShuiElement: string | null;
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
  fengShuiElement: string;
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
}

// Plant Combo Types
export interface PlantCombo {
  plantComboId: number;
  comboCode: string;
  comboName: string;
  comboType: string;
  description: string;
  suitableSpace: string;
  suitableRooms: string;
  fengShuiElement: string;
  fengShuiPurpose: string;
  themeName: string;
  themeDescription: string;
  originalPrice: number;
  comboPrice: number;
  discountPercent: number;
  minPlants: number;
  maxPlants: number;
  tags: string;
  season: string;
  viewCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  images?: PlantComboImage[];
}

export interface PlantComboImage {
  id?: number;
  plantComboId?: number;
  url: string;
  preview?: string;
  isThumbnail: boolean;
  createdAt?: string;
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
  description: string;
  basePrice: number;
  unit: string;
  brand: string;
  specifications: Record<string, unknown>;
  expiryMonths: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  images?: MaterialImage[];
}

export interface MaterialImage {
  id?: number;
  materialId?: number;
  url: string;
  preview?: string;
  isThumbnail: boolean;
  createdAt?: string;
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
