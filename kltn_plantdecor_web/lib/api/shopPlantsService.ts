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
  nurseryId?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface ShopPlantListItem {
  id: number;
  name: string;
  basePrice: string;
  size: string;
  careLevel: string;
  isActive: boolean;
  primaryImageUrl: string | null;
  totalInstances: number;
  availableInstances: number;
  availableCommonQuantity: number;
  totalAvailableStock: number;
  categoryNames: Category[];
  tagNames: Tag[];
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
