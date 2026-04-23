import * as apiClient from '@/lib/api/apiService.client';
import * as apiServer from '@/lib/api/apiService.server';
import type { ResponseModel } from '@/types/api.types';
import type { PlantCombo } from '@/types/store-management.types';

export type UnifiedItemType = 'Plant' | 'Material' | 'Combo';

export interface UnifiedPaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface ShopUnifiedSearchRequest {
  pagination: UnifiedPaginationRequest;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: number[];
  tagIds?: number[];
  petSafe?: boolean;
  childSafe?: boolean;
  comboSeason?: number;
  comboType?: number;
  placementType?: number;
  careLevelType?: number;
  careLevel?: string;
  toxicity?: boolean;
  airPurifying?: boolean;
  hasFlower?: boolean;
  isUniqueInstance?: boolean;
  sizes?: number[];
  fengShuiElement?: number;
  nurseryId?: number;
  sortBy?: string;
  sortDirection?: string;
  includePlants?: boolean;
  includeMaterials?: boolean;
  includeCombos?: boolean;
}

export interface ShopUnifiedPlantItem {
  id: number;
  name: string;
  basePrice: number;
  isUniqueInstance: boolean;
  size?: number;
  sizeName?: string;
  careLevelType?: number;
  careLevelTypeName?: string;
  fengShuiElement?: number;
  fengShuiElementName?: string;
  isActive: boolean;
  primaryImageUrl: string | null;
  totalInstances: number;
  availableInstances: number;
  availableCommonQuantity: number;
  totalAvailableStock: number;
  categoryNames: string[];
  tagNames: string[];
}

export interface ShopUnifiedMaterialItem {
  id: number;
  materialId?: number;
  materialName: string;
  materialCode?: string;
  unit?: string;
  nurseryId?: number;
  nurseryName?: string;
  quantity?: number;
  expiredDate?: string | null;
  reservedQuantity?: number;
  isActive?: boolean;
  availableQuantity?: number;
  basePrice?: number;
  primaryImageUrl?: string | null;
}

export interface ShopUnifiedComboNursery {
  nurseryId: number;
  nurseryName: string;
  quantity: number;
}

export interface ShopUnifiedComboItem {
  id: number;
  name: string;
  comboType?: number;
  comboTypeName?: string;
  description?: string;
  price: number;
  primaryImageUrl: string | null;
  nurseries?: ShopUnifiedComboNursery[];
}

export interface ShopUnifiedSearchItem {
  imageUrl: string | null;
  type: UnifiedItemType;
  plant: ShopUnifiedPlantItem | null;
  material: ShopUnifiedMaterialItem | null;
  combo: ShopUnifiedComboItem | null;
}

export interface ShopUnifiedPagedItems {
  items: ShopUnifiedSearchItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ShopUnifiedSearchPayload {
  keyword: string | null;
  items: ShopUnifiedPagedItems;
  plantTotalCount: number;
  materialTotalCount: number;
  comboTotalCount: number;
}

export interface UnifiedEnumValue {
  value: number;
  name: string;
}

export interface UnifiedEnumGroup {
  groupName: string;
  values: UnifiedEnumValue[];
}

export interface ShopUnifiedConfigPayload {
  filterEnums: UnifiedEnumGroup[];
  filterOptions: unknown[];
  sortEnums: UnifiedEnumGroup[];
}

export const searchShopUnified = async (
  data: ShopUnifiedSearchRequest,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<ShopUnifiedSearchPayload>> => {
  if (isServer) {
    console.log('Server-side searchShopUnified with data:', data);
    return apiServer.post('/shop/search', data);
  }
  console.log('Client-side searchShopUnified with data:', data);
  return apiClient.post('/shop/search', data, loading);
};

export const getShopUnifiedSearchConfig = async (
  isServer: boolean,
  loading = true
): Promise<ResponseModel<ShopUnifiedConfigPayload>> => {
  if (isServer) {
    return apiServer.get('/system/search-config/shop-unified');
  }

  return apiClient.get('/system/search-config/shop-unified', undefined, loading);
};

export const getShopComboById = async (
  comboId: number,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<PlantCombo>> => {
  if (isServer) {
    return apiServer.get(`/PlantCombos/${comboId}`);
  }

  return apiClient.get(`/PlantCombos/${comboId}`, undefined, loading);
};
