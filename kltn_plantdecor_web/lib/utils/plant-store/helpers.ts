import type { CategoryResponse } from '@/lib/api/categoriesService';
import type {
  PlantEnumGroup,
  ShopNurserySearchPayload,
  ShopNurserySearchRequest,
  ShopPlantSearchPayload,
  ShopPlantSearchRequest,
} from '@/lib/api/shopPlantsService';
import type {
  ShopMaterialSearchPayload,
  ShopMaterialSearchRequest,
} from '@/lib/api/shopMaterialsService';
import {
  DEFAULT_TAB,
  NURSERY_FILTER_PAGE_SIZE,
  type PlantStorePageQuery,
  type PlantStoreTab,
} from '@/lib/utils/plant-store/constants';
import {
  parseBooleanOrUndefined,
  parseCsvStringArray,
  parseIntOrUndefined,
  parseNumberArray,
  parsePositiveInt,
  toSingle,
} from '@/lib/utils/plant-store/query';
import { resolveSharedPageSize } from '@/lib/utils/plant-store/url';
import type {
  ShopUnifiedPagedItems,
  ShopUnifiedSearchPayload,
  ShopUnifiedSearchRequest,
  UnifiedEnumGroup,
  ShopUnifiedConfigPayload,
} from '@/lib/api/shopUnifiedService';

export const getActiveTab = (query: PlantStorePageQuery): PlantStoreTab => {
  const tab = toSingle(query.tab)?.toLowerCase();
  return tab === 'materials' ? 'materials' : DEFAULT_TAB;
};

export const buildPlantRequestBody = (query: PlantStorePageQuery): ShopPlantSearchRequest => {
  const page = parsePositiveInt(toSingle(query.page), 1);
  const pageSize = resolveSharedPageSize(query);
  const sortByDirect = toSingle(query.sortBy)?.trim();
  const sortDirectionDirect = toSingle(query.sortDirection)?.trim();
  const sortCombined = toSingle(query.sort)?.trim() || '';
  const [sortByCombined, sortDirectionCombined] = sortCombined.split(':');
  const sortBy = sortByDirect || sortByCombined || undefined;
  const sortDirection = sortDirectionDirect || sortDirectionCombined || undefined;

  const categoryIds = [...parseNumberArray(query.categoryIds), ...parseNumberArray(query.categoryId)];
  const uniqueCategoryIds = [...new Set(categoryIds)];

  const tagIdsFromArray = parseNumberArray(query.tagIds);
  const tagIdsFromCsv = parseCsvStringArray(toSingle(query.tagIdsCsv))
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
  const uniqueTagIds = [...new Set([...tagIdsFromArray, ...tagIdsFromCsv])];

  const sizes = parseNumberArray(query.sizes);

  return {
    pagination: { pageNumber: page, pageSize },
    keyword: toSingle(query.q)?.trim() || undefined,
    isActive: parseBooleanOrUndefined(toSingle(query.isActive)) ?? true,
    placementType: parseIntOrUndefined(toSingle(query.placementType)),
    careLevelType: parseIntOrUndefined(toSingle(query.careLevelType)),
    careLevel: toSingle(query.careLevel)?.trim() || undefined,
    toxicity: parseBooleanOrUndefined(toSingle(query.toxicity)),
    airPurifying: parseBooleanOrUndefined(toSingle(query.airPurifying)),
    hasFlower: parseBooleanOrUndefined(toSingle(query.hasFlower)),
    petSafe: parseBooleanOrUndefined(toSingle(query.petSafe)),
    childSafe: parseBooleanOrUndefined(toSingle(query.childSafe)),
    isUniqueInstance: parseBooleanOrUndefined(toSingle(query.isUniqueInstance)),
    minBasePrice: parseIntOrUndefined(toSingle(query.minBasePrice)),
    maxBasePrice: parseIntOrUndefined(toSingle(query.maxBasePrice)),
    categoryIds: uniqueCategoryIds.length > 0 ? uniqueCategoryIds : undefined,
    tagIds: uniqueTagIds.length > 0 ? uniqueTagIds : undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
    fengShuiElement: parseIntOrUndefined(toSingle(query.fengShuiElement)),
    nurseryId: parseIntOrUndefined(toSingle(query.nurseryId)),
    sortBy,
    sortDirection,
  };
};

export const buildMaterialRequestBody = (query: PlantStorePageQuery): ShopMaterialSearchRequest => {
  const page = parsePositiveInt(toSingle(query.mPage), 1);
  const pageSize = resolveSharedPageSize(query);

  return {
    pagination: {
      pageNumber: page,
      pageSize,
    },
  };
};

export const buildNurseryRequestBody = (): ShopNurserySearchRequest => ({
  pagination: { pageNumber: 1, pageSize: NURSERY_FILTER_PAGE_SIZE },
});

export const flattenCategories = (nodes: CategoryResponse[]): CategoryResponse[] => {
  const result: CategoryResponse[] = [];
  const walk = (items: CategoryResponse[]) => {
    items.forEach((item) => {
      result.push(item);
      if (Array.isArray(item.subCategories) && item.subCategories.length > 0) {
        walk(item.subCategories);
      }
    });
  };
  walk(nodes);
  return result;
};

export const getPayload = <T,>(response: { payload?: T; data?: T } | null | undefined): T | null => {
  if (!response) return null;
  return response.payload ?? response.data ?? null;
};

export const getEnumValues = (groups: PlantEnumGroup[], key: string) =>
  groups.find((item) => item.enumName === key)?.values ?? [];

export const getDefaultPlantsPayload = (
  pageNumber: number,
  pageSize: number
): ShopPlantSearchPayload => ({
  items: [],
  totalCount: 0,
  pageNumber,
  pageSize,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
});

export const getDefaultMaterialsPayload = (
  pageNumber: number,
  pageSize: number
): ShopMaterialSearchPayload => ({
  items: [],
  totalCount: 0,
  pageNumber,
  pageSize,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
});

export const getDefaultNurseriesPayload = (): ShopNurserySearchPayload => ({
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: NURSERY_FILTER_PAGE_SIZE,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
});

export const getSelectedSort = (requestBody: ShopPlantSearchRequest) =>
  `${requestBody.sortBy || ''}:${requestBody.sortDirection || ''}`;

export const getSharedPageSize = (query: PlantStorePageQuery) =>
  resolveSharedPageSize(query);

export const buildUnifiedShopRequestBody = (
  query: PlantStorePageQuery
): ShopUnifiedSearchRequest => {
  const page = parsePositiveInt(toSingle(query.page), 1);
  const pageSize = resolveSharedPageSize(query);
  const sortByDirect = toSingle(query.sortBy)?.trim();
  const sortDirectionDirect = toSingle(query.sortDirection)?.trim();
  const sortCombined = toSingle(query.sort)?.trim() || '';
  const [sortByCombined, sortDirectionCombined] = sortCombined.split(':');
  const sortBy = sortByDirect || sortByCombined || 'CreatedAt';
  const sortDirection = sortDirectionDirect || sortDirectionCombined || 'Desc';

  const categoryIds = [...parseNumberArray(query.categoryIds), ...parseNumberArray(query.categoryId)];
  const uniqueCategoryIds = [...new Set(categoryIds)];

  const tagIdsFromArray = parseNumberArray(query.tagIds);
  const tagIdsFromCsv = parseCsvStringArray(toSingle(query.tagIdsCsv))
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
  const uniqueTagIds = [...new Set([...tagIdsFromArray, ...tagIdsFromCsv])];

  const sizes = parseNumberArray(query.sizes);

  const includePlants = parseBooleanOrUndefined(toSingle(query.includePlants));
  const includeMaterials = parseBooleanOrUndefined(toSingle(query.includeMaterials));
  const includeCombos = parseBooleanOrUndefined(toSingle(query.includeCombos));

  return {
    pagination: { pageNumber: page, pageSize },
    keyword: toSingle(query.q)?.trim() || undefined,
    minPrice:
      parseIntOrUndefined(toSingle(query.minPrice)) ??
      parseIntOrUndefined(toSingle(query.minBasePrice)),
    maxPrice:
      parseIntOrUndefined(toSingle(query.maxPrice)) ??
      parseIntOrUndefined(toSingle(query.maxBasePrice)),
    categoryIds: uniqueCategoryIds.length > 0 ? uniqueCategoryIds : undefined,
    tagIds: uniqueTagIds.length > 0 ? uniqueTagIds : undefined,
    petSafe: parseBooleanOrUndefined(toSingle(query.petSafe)),
    childSafe: parseBooleanOrUndefined(toSingle(query.childSafe)),
    comboSeason: parseIntOrUndefined(toSingle(query.comboSeason)),
    comboType: parseIntOrUndefined(toSingle(query.comboType)),
    placementType: parseIntOrUndefined(toSingle(query.placementType)),
    careLevelType: parseIntOrUndefined(toSingle(query.careLevelType)),
    careLevel: toSingle(query.careLevel)?.trim() || undefined,
    toxicity: parseBooleanOrUndefined(toSingle(query.toxicity)),
    airPurifying: parseBooleanOrUndefined(toSingle(query.airPurifying)),
    hasFlower: parseBooleanOrUndefined(toSingle(query.hasFlower)),
    isUniqueInstance: parseBooleanOrUndefined(toSingle(query.isUniqueInstance)),
    sizes: sizes.length > 0 ? sizes : undefined,
    fengShuiElement: parseIntOrUndefined(toSingle(query.fengShuiElement)),
    nurseryId: parseIntOrUndefined(toSingle(query.nurseryId)),
    sortBy,
    sortDirection,
    includePlants: includePlants ?? true,
    includeMaterials: includeMaterials ?? true,
    includeCombos: includeCombos ?? true,
  };
};

export const getDefaultUnifiedItemsPayload = (
  pageNumber: number,
  pageSize: number
): ShopUnifiedPagedItems => ({
  items: [],
  totalCount: 0,
  pageNumber,
  pageSize,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
});

export const getDefaultUnifiedSearchPayload = (
  pageNumber: number,
  pageSize: number
): ShopUnifiedSearchPayload => ({
  keyword: null,
  items: getDefaultUnifiedItemsPayload(pageNumber, pageSize),
  plantTotalCount: 0,
  materialTotalCount: 0,
  comboTotalCount: 0,
});

export const getUnifiedEnumValues = (groups: UnifiedEnumGroup[], key: string) =>
  groups.find((item) => item.groupName === key)?.values ?? [];

export const getUnifiedSelectedSort = (requestBody: ShopUnifiedSearchRequest) =>
  `${requestBody.sortBy || ''}:${requestBody.sortDirection || ''}`;

export const getUnifiedConfigPayload = (
  response: { payload?: ShopUnifiedConfigPayload; data?: ShopUnifiedConfigPayload } | null | undefined
) => getPayload<ShopUnifiedConfigPayload>(response);
