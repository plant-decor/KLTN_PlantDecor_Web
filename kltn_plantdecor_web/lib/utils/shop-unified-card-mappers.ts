import type { Category, Tag } from '@/data/storeCatalogData';
import type { ShopUnifiedMaterialItem, ShopUnifiedPlantItem } from '@/lib/api/shopUnifiedService';
import type { ShopMaterialListItem } from '@/lib/api/shopMaterialsService';
import type { ShopPlantListItem } from '@/lib/api/shopPlantsService';

const toProductCategory = (name: string, index: number): Category => ({
  id: index + 1,
  parentCategoryId: null,
  name,
  isActive: true,
  categoryType: 0,
  categoryTypeName: 'General',
  createdAt: '',
  updatedAt: '',
  description: '',
});

const toProductTag = (name: string, index: number): Tag => ({
  id: index + 1,
  tagName: name,
  tagType: 0,
  tagTypeName: 'General',
});

export const toProductCardPlant = (plant: ShopUnifiedPlantItem): ShopPlantListItem => ({
  id: plant.id,
  name: plant.name,
  basePrice: plant.basePrice,
  size: plant.sizeName ?? '',
  careLevel: plant.careLevelTypeName ?? '',
  isActive: plant.isActive,
  primaryImageUrl: plant.primaryImageUrl,
  totalInstances: plant.totalInstances,
  availableInstances: plant.availableInstances,
  availableCommonQuantity: plant.availableCommonQuantity,
  totalAvailableStock: plant.totalAvailableStock,
  categoryNames: (plant.categoryNames ?? []).map((name, index) => toProductCategory(name, index)),
  tagNames: (plant.tagNames ?? []).map((name, index) => toProductTag(name, index)),
});

export const toMaterialCardMaterial = (material: ShopUnifiedMaterialItem): ShopMaterialListItem => ({
  id: material.materialId ?? material.id,
  materialCode: material.materialCode ?? '',
  name: material.materialName,
  basePrice: material.basePrice ?? 0,
  unit: material.unit ?? '',
  brand: material.nurseryName ?? '',
  isActive: material.isActive ?? true,
  primaryImageUrl: material.primaryImageUrl ?? null,
  categoryNames: [],
  tagNames: [],
});
