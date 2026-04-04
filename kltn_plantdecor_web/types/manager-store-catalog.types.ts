export interface PaginatedPayload<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ManagerNursery {
  id: number;
  managerId: number;
  managerName: string;
  name: string;
  address: string;
  area: number | null;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  isActive: boolean;
  createdAt: string;
  totalPlants: number;
  totalMaterials: number;
}

export interface AvailableImportCommonPlantItem {
  id: number;
  name: string;
  basePrice: number;
  isUniqueInstance: boolean;
  size: number;
  sizeName: string;
  careLevelType: number;
  careLevelTypeName: string;
  isActive: boolean;
  primaryImageUrl: string | null;
  totalInstances: number;
  availableInstances: number;
  availableCommonQuantity: number;
  totalAvailableStock: number;
  categoryNames: string[];
  tagNames: string[];
}

export interface CommonPlantInventoryItem {
  id: number;
  plantId: number;
  plantName: string;
  nurseryId: number;
  nurseryName: string;
  quantity: number;
  reservedQuantity: number;
  isActive: boolean;
  availableQuantity: number;
}

export interface PaginationQuery {
  pageNumber?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
}

export interface CreateCommonPlantRequest {
  plantId: number;
  quantity: number;
  isActive: boolean;
}

export interface UpdateCommonPlantRequest {
  quantity: number;
  reservedQuantity: number;
  isActive: boolean;
}

export interface NurseryMaterialItem {
  id: number;
  materialId: number;
  materialName: string;
  materialCode: string;
  unit: string;
  nurseryId: number;
  nurseryName: string;
  quantity: number;
  expiredDate: string | null;
  reservedQuantity: number;
  isActive: boolean;
  availableQuantity: number;
}

export interface ImportNurseryMaterialRequest {
  materialId: number;
  quantity: number;
  expiredDate: string | null;
}

export interface UpdateNurseryMaterialRequest {
  quantity: number;
  expiredDate: string | null;
  isActive: boolean;
}

export interface PlantSummaryItem {
  plantId: number;
  plantName: string;
  primaryImageUrl: string | null;
  basePrice: number;
  totalInstances: number;
  availableCount: number;
  soldCount: number;
  reservedCount: number;
  damagedCount: number;
  inactive: number;
  minPrice: number;
  maxPrice: number;
}

export interface PlantInstanceItem {
  plantInstanceId: number;
  plantId: number;
  plantName: string;
  sku: string | null;
  specificPrice: number;
  height: number;
  healthStatus: string;
  description: string;
  status: number;
  statusName: string;
  primaryImageUrl: string | null;
  createdAt: string;
}

export interface PlantInstanceListQuery extends PaginationQuery {
  status?: number;
}

export interface CreatePlantInstanceInput {
  plantId: number;
  specificPrice: number;
  height: number;
  trunkDiameter: number;
  healthStatus: string;
  age: number;
  description: string;
}

export interface CreatePlantInstanceBatchRequest {
  instances: CreatePlantInstanceInput[];
}

export interface CreatedPlantInstanceItem {
  id: number;
  plantId: number;
  plantName: string;
  currentNurseryId: number;
  nurseryName: string;
  sku: string | null;
  specificPrice: number;
  height: number;
  trunkDiameter: number;
  healthStatus: string;
  age: number;
  description: string;
  status: number;
  statusName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlantInstanceBatchPayload {
  totalCreated: number;
  instances: CreatedPlantInstanceItem[];
}

export interface UpdatePlantInstanceStatusRequest {
  status: number;
}

export interface BatchUpdatePlantInstanceStatusRequest {
  instanceIds: number[];
  status: number;
}

export interface PlantInstanceEnumValue {
  value: number;
  name: string;
}

export interface PlantInstanceEnumGroup {
  enumName: string;
  values: PlantInstanceEnumValue[];
}

export interface SystemPlantSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  keyword?: string;
  isUniqueInstance?: boolean;
  isActive?: boolean;
}

export interface SystemPlantSearchItem {
  id: number;
  name: string;
  basePrice: number;
  isUniqueInstance: boolean;
  isActive: boolean;
  primaryImageUrl: string | null;
}

export interface SystemPlantSearchPayload extends PaginatedPayload<SystemPlantSearchItem> {}
