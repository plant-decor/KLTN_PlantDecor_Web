import {
  DEFAULT_PAGE_SIZE,
  type PlantStorePageQuery,
  type PlantStoreTab,
} from '@/lib/utils/plant-store/constants';
import { cloneQuery, parsePositiveInt, toSingle } from '@/lib/utils/plant-store/query';

const buildPlantStoreHref = (params: URLSearchParams) => `/plant-store?${params.toString()}`;

export const buildTabHref = (query: PlantStorePageQuery, tab: PlantStoreTab) => {
  const params = cloneQuery(query);
  params.set('tab', tab);
  return buildPlantStoreHref(params);
};

export const buildPaginationHref = (
  query: PlantStorePageQuery,
  key: 'page' | 'mPage',
  targetPage: number
): string => {
  const params = cloneQuery(query);
  params.set(key, String(Math.max(1, targetPage)));
  return buildPlantStoreHref(params);
};

export const buildSharedPageSizeHref = (
  query: PlantStorePageQuery,
  targetPageSize: number,
  activeTab: PlantStoreTab
): string => {
  const params = cloneQuery(query);
  const safePageSize = Math.max(1, Math.floor(targetPageSize));

  params.set('pageSize', String(safePageSize));
  params.set('tab', activeTab);
  params.set('page', '1');
  params.set('mPage', '1');

  return buildPlantStoreHref(params);
};

export const resolveSharedPageSize = (query: PlantStorePageQuery) => {
  const pageSize = parsePositiveInt(toSingle(query.pageSize), DEFAULT_PAGE_SIZE);
  const legacyMaterialPageSize = parsePositiveInt(toSingle(query.mPageSize), DEFAULT_PAGE_SIZE);

  if (toSingle(query.pageSize)) {
    return pageSize;
  }

  return legacyMaterialPageSize;
};
