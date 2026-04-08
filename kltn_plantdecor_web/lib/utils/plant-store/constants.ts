export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_TAB = 'plants';
export const NURSERY_FILTER_PAGE_SIZE = 100;
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

export type PlantStoreTab = 'plants' | 'materials';
export type PlantStorePageQuery = Record<string, string | string[] | undefined>;
