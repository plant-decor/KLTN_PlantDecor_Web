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
