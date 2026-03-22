import { Tag } from '@/data/storeCatalogData';
import * as apiClient from '@/lib/api/apiService.client';
import * as apiServer from '@/lib/api/apiService.server';
import type { ResponseModel } from '@/types/api.types';

export interface PlantDetailCategory {
  id: number;
  name: string;
}

export interface PlantDetailTag {
  id: number;
  name: string;
}

export interface PlantDetailImage {
  id: number;
  imageUrl: string;
}

export interface PlantDetailResponse {
  id: number;
  name: string;
  specificName: string | null;
  origin: string | null;
  description: string | null;
  basePrice: number;
  placementType: number;
  placementTypeName: string;
  size: string;
  growthRate: string | null;
  toxicity: boolean | null;
  airPurifying: boolean | null;
  hasFlower: boolean | null;
  petSafe: boolean;
  childSafe: boolean;
  fengShuiElement: string | null;
  fengShuiMeaning: string | null;
  potIncluded: boolean | null;
  potSize: string | null;
  careLevel: string;
  isActive: boolean;
  isUniqueInstance: boolean;
  createdAt: string;
  updatedAt: string;
  categories: PlantDetailCategory[];
  tags: Tag[];
  images: PlantDetailImage[];
  totalInstances: number;
  availableInstances: number;
}

export const getPlantById = async (
  id: number,
  isServer: boolean,
  loading = true
): Promise<ResponseModel<PlantDetailResponse>> => {
  if (isServer) {
    return apiServer.get(`/admin/Plants/${id}`);
  }

  return apiClient.get(`/admin/Plants/${id}`, undefined, loading);
};
