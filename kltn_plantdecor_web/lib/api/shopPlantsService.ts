import { Category, Tag } from '@/data/storeCatalogData';
import * as apiClient from '@/lib/api/apiService.client';
import * as apiServer from '@/lib/api/apiService.server';
import type { ResponseModel } from '@/types/api.types';

export interface ShopPlantSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  keyword?: string;
  isActive?: boolean;
  placementType?: number;
  careLevelType?: number;
  careLevel?: string;
  toxicity?: boolean;
  airPurifying?: boolean;
  hasFlower?: boolean;
  petSafe?: boolean;
  childSafe?: boolean;
  isUniqueInstance?: boolean;
  minBasePrice?: number;
  maxBasePrice?: number;
  categoryIds?: number[];
  tagIds?: number[];
  sizes?: number[];
  fengShuiElement?: number;
  nurseryId?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface ShopPlantListItem {
  id: number;
  name: string;
  basePrice: number;
  size: string;
  careLevel: string;
  isActive: boolean;
  primaryImageUrl: string | null;
  totalInstances: number;
  availableInstances: number;
  availableCommonQuantity: number;
  totalAvailableStock: number;
  categoryNames: Category[];
  description?: string;
  tagNames: Tag[] | string[];
}

export interface ShopPlantSearchPayload {
  items: ShopPlantListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface NurseryPlantInstanceSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  nurseryId: number;
  plantId: number;
}

export interface NurseryPlantInstanceItem {
  plantInstanceId: number;
  plantId: number;
  plantName: string;
  sku: string;
  specificPrice: number;
  height: number;
  healthStatus: string;
  status: number;
  statusName: string;
  primaryImageUrl: string | null;
  createdAt: string;
}

export interface NurseryPlantInstanceSearchPayload {
  items: NurseryPlantInstanceItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ShopPlantInstanceImage {
  id?: number;
  imageUrl?: string;
  url?: string;
  preview?: string;
  isPrimary?: boolean;
  isThumbnail?: boolean;
}

export interface ShopPlantInstanceDetail {
  id: number;
  plantId: number;
  plantName: string;
  currentNurseryId?: number;
  nurseryName?: string;
  sku: string | null;
  specificPrice: number;
  height: number;
  trunkDiameter?: number;
  healthStatus: string;
  age?: number;
  description?: string;
  status: number;
  statusName: string;
  createdAt: string;
  updatedAt?: string;
  images: ShopPlantInstanceImage[];
}

export interface PlantEnumValue {
  value: number;
  name: string;
}

export interface PlantEnumGroup {
  enumName: 'PlacementType' | 'PlantSize' | 'CareLevelType' | string;
  values: PlantEnumValue[];
}

export interface ShopNurseryListItem {
  id: number;
  nurseryMaterialId: number | null;
  nurseryPlantComboId: number | null;
  commonPlantId: number | null;
  managerId: number | null;
  managerName: string | null;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShopNurserySearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface ShopNurserySearchPayload {
  items: ShopNurseryListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const searchShopPlants = async (
  data: ShopPlantSearchRequest,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<ShopPlantSearchPayload>> => {
  if (isServer) {
    return apiServer.post('/shop/plants/search', data);
  }

  return apiClient.post('/shop/plants/search', data, loading);
};

export const searchNurseryPlantInstances = async (
  nurseryId: number,
  data: NurseryPlantInstanceSearchRequest,
  loading = true
): Promise<ResponseModel<NurseryPlantInstanceSearchPayload>> => {
  return apiClient.post(
    `/shop/nurseries/${nurseryId}/plant-instances/search`,
    data,
    loading
  );
};

export const getPlantEnums = async (
  isServer: boolean,
  loading = true
): Promise<ResponseModel<PlantEnumGroup[]>> => {
  if (isServer) {
    return apiServer.get('/system/enums/plants');
  }

  return apiClient.get('/system/enums/plants', undefined, loading);
};

export const searchShopNurseries = async (
  data: ShopNurserySearchRequest,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<ShopNurserySearchPayload>> => {
  if (isServer) {
    return apiServer.post('/shop/nurseries/search', data);
  }

  return apiClient.post('/shop/nurseries/search', data, loading);
};

export const getPlantComboNurseries = async (
  comboId: number,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<ShopNurseryListItem[]>> => {
  if (isServer) {
    return apiServer.get(`/shop/plant-combos/${comboId}/nurseries`);
  }

  return apiClient.get(`/shop/plant-combos/${comboId}/nurseries`, undefined, loading);
};

export const getShopPlantInstanceById = async (
  instanceId: number,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<ShopPlantInstanceDetail>> => {
  if (isServer) {
    return apiServer.get(`/shop/plant-instances/${instanceId}`);
  }

  return apiClient.get(`/shop/plant-instances/${instanceId}`, undefined, loading);
};
