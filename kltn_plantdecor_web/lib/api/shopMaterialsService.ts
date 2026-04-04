import * as apiClient from '@/lib/api/apiService.client';
import * as apiServer from '@/lib/api/apiService.server';
import type { ResponseModel } from '@/types/api.types';

export interface ShopMaterialSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface ShopMaterialListItem {
  id: number;
  materialCode: string;
  name: string;
  basePrice: number;
  unit: string;
  brand: string;
  isActive: boolean;
  primaryImageUrl: string | null;
  categoryNames: string[];
  tagNames: string[];
}

export interface ShopMaterialSearchPayload {
  items: ShopMaterialListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface MaterialCategory {
  id: number;
  parentCategoryId?: number | null;
  name: string;
  isActive?: boolean;
  categoryType?: number;
  categoryTypeName?: string | null;
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
  isPrimary: boolean;
}

export interface MaterialDetailResponse {
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
  createdAt: string;
  updatedAt: string;
  categories: MaterialCategory[];
  tags: MaterialTag[];
  images: MaterialImage[];
}

export interface MaterialNursery {
  id: number;
  nurseryMaterialId: number;
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

export const searchShopMaterials = async (
  data: ShopMaterialSearchRequest,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<ShopMaterialSearchPayload>> => {
  if (isServer) {
    return apiServer.post('/shop/materials/search', data);
  }

  return apiClient.post('/shop/materials/search', data, loading);
};

export const getMaterialById = async (
  id: number,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<MaterialDetailResponse>> => {
  if (isServer) {
    return apiServer.get(`/material/${id}`);
  }

  return apiClient.get(`/material/${id}`, undefined, loading);
};

export const getMaterialNurseries = async (
  materialId: number,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<MaterialNursery[]>> => {
  if (isServer) {
    return apiServer.get(`/shop/materials/${materialId}/nurseries`);
  }

  return apiClient.get(`/shop/materials/${materialId}/nurseries`, undefined, loading);
};
