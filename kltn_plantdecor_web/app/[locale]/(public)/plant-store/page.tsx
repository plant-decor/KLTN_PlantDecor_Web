import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getCategoryTreeSSR } from '@/lib/api/categoriesService.server';
import {
  getPlantEnums,
  searchShopNurseries,
  searchShopPlants,
  type PlantEnumGroup,
  type ShopNurserySearchPayload,
  type ShopPlantSearchPayload,
  type ShopPlantSearchRequest,
} from '@/lib/api/shopPlantsService';
import {
  searchShopMaterials,
  type ShopMaterialSearchPayload,
  type ShopMaterialSearchRequest,
} from '@/lib/api/shopMaterialsService';
import ProductCard from '@/components/product/ProductCard';
import MaterialCard from '@/components/product/MaterialCard';
import type { CategoryResponse } from '@/lib/api/categoriesService';
import { Select } from '@mui/material';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_TAB = 'plants';
const NURSERY_FILTER_PAGE_SIZE = 100;

const toSingle = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const parseIntOrUndefined = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = parseIntOrUndefined(value);
  return parsed && parsed > 0 ? Math.floor(parsed) : fallback;
};

const parseBooleanOrUndefined = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return undefined;
};

const parseNumberArray = (value: string | string[] | undefined): number[] => {
  if (!value) return [];

  const values = Array.isArray(value) ? value : [value];
  const deduped = new Set<number>();

  values
    .flatMap((item) => item.split(','))
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
    .forEach((item) => deduped.add(item));

  return [...deduped];
};

const parseCsvStringArray = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const flattenCategories = (nodes: CategoryResponse[]): CategoryResponse[] => {
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

const getPayload = <T,>(response: { payload?: T; data?: T } | null | undefined): T | null => {
  if (!response) return null;
  return response.payload ?? response.data ?? null;
};

const getActiveTab = (query: Record<string, string | string[] | undefined>) => {
  const tab = toSingle(query.tab)?.toLowerCase();
  return tab === 'materials' ? 'materials' : DEFAULT_TAB;
};

const buildPlantRequestBody = (
  query: Record<string, string | string[] | undefined>
): ShopPlantSearchRequest => {
  const page = parsePositiveInt(toSingle(query.page), 1);
  const pageSize = parsePositiveInt(toSingle(query.pageSize), DEFAULT_PAGE_SIZE);
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
    fengShuiElement: toSingle(query.fengShuiElement)?.trim() || undefined,
    nurseryId: parseIntOrUndefined(toSingle(query.nurseryId)),
    sortBy,
    sortDirection,
  };
};

const buildMaterialRequestBody = (
  query: Record<string, string | string[] | undefined>
): ShopMaterialSearchRequest => {
  const page = parsePositiveInt(toSingle(query.mPage), 1);
  const pageSize = parsePositiveInt(toSingle(query.mPageSize), DEFAULT_PAGE_SIZE);

  return {
    pagination: {
      pageNumber: page,
      pageSize,
    },
  };
};

const cloneQuery = (query: Record<string, string | string[] | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
      return;
    }
    if (value !== '') {
      params.set(key, value);
    }
  });
  return params;
};

const buildTabHref = (
  query: Record<string, string | string[] | undefined>,
  tab: 'plants' | 'materials'
) => {
  const params = cloneQuery(query);
  params.set('tab', tab);
  return `/plant-store?${params.toString()}`;
};

const buildPaginationHref = (
  query: Record<string, string | string[] | undefined>,
  key: 'page' | 'mPage',
  targetPage: number
): string => {
  const params = cloneQuery(query);
  params.set(key, String(Math.max(1, targetPage)));
  return `/plant-store?${params.toString()}`;
};

const getEnumValues = (groups: PlantEnumGroup[], key: string) =>
  groups.find((item) => item.enumName === key)?.values ?? [];

export default async function PlantStorePage({ params, searchParams }: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: 'plantStore' });
  const tFilter = await getTranslations({ locale, namespace: 'filter' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const activeTab = getActiveTab(query);

  const plantRequestBody = buildPlantRequestBody(query);
  const materialRequestBody = buildMaterialRequestBody(query);

  const [plantsResult, categoriesResult, enumsResult, materialsResult, nurseriesResult] =
    await Promise.allSettled([
    activeTab === 'plants' ? searchShopPlants(plantRequestBody, true, false) : Promise.resolve(null),
    activeTab === 'plants' ? getCategoryTreeSSR() : Promise.resolve(null),
    activeTab === 'plants' ? getPlantEnums(true, false) : Promise.resolve(null),
    activeTab === 'materials' ? searchShopMaterials(materialRequestBody, true, false) : Promise.resolve(null),
    activeTab === 'plants'
      ? searchShopNurseries(
          {
            pagination: { pageNumber: 1, pageSize: NURSERY_FILTER_PAGE_SIZE },
          },
          true,
          false
        )
      : Promise.resolve(null),
    ]);

  const plantsResponse = plantsResult.status === 'fulfilled' ? plantsResult.value : null;
  const categoriesResponse = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;
  const enumsResponse = enumsResult.status === 'fulfilled' ? enumsResult.value : null;
  const materialsResponse = materialsResult.status === 'fulfilled' ? materialsResult.value : null;
  const nurseriesResponse = nurseriesResult.status === 'fulfilled' ? nurseriesResult.value : null;

  const plantsPayload = getPayload<ShopPlantSearchPayload>(plantsResponse) ?? {
    items: [],
    totalCount: 0,
    pageNumber: plantRequestBody.pagination.pageNumber,
    pageSize: plantRequestBody.pagination.pageSize,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const materialsPayload = getPayload<ShopMaterialSearchPayload>(materialsResponse) ?? {
    items: [],
    totalCount: 0,
    pageNumber: materialRequestBody.pagination.pageNumber,
    pageSize: materialRequestBody.pagination.pageSize,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };
  const nurseriesPayload = getPayload<ShopNurserySearchPayload>(nurseriesResponse) ?? {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: NURSERY_FILTER_PAGE_SIZE,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const categoryTree = getPayload<CategoryResponse[]>(categoriesResponse) ?? [];
  const categoryOptions = flattenCategories(categoryTree).filter((item) => item.isActive);
  const selectedCategories = new Set(plantRequestBody.categoryIds ?? []);
  const selectedSizes = new Set(plantRequestBody.sizes ?? []);

  const plantEnums = getPayload<PlantEnumGroup[]>(enumsResponse) ?? [];
  const placementTypeOptions = getEnumValues(plantEnums, 'PlacementType');
  const careLevelTypeOptions = getEnumValues(plantEnums, 'CareLevelType');
  const sizeOptions = getEnumValues(plantEnums, 'PlantSize');

  const selectedSort = `${plantRequestBody.sortBy || ''}:${plantRequestBody.sortDirection || ''}`;
  const plantsPrevHref = buildPaginationHref(query, 'page', (plantsPayload.pageNumber || 1) - 1);
  const plantsNextHref = buildPaginationHref(query, 'page', (plantsPayload.pageNumber || 1) + 1);
  const materialsPrevHref = buildPaginationHref(query, 'mPage', (materialsPayload.pageNumber || 1) - 1);
  const materialsNextHref = buildPaginationHref(query, 'mPage', (materialsPayload.pageNumber || 1) + 1);

  return (
    <div className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-2">
            <Link
              href={buildTabHref(query, 'plants')}
              locale={locale}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg border ${
                activeTab === 'plants'
                  ? 'border-gray-300 border-b-white bg-white text-green-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('tabs.plants')}
            </Link>
            <Link
              href={buildTabHref(query, 'materials')}
              locale={locale}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg border ${
                activeTab === 'materials'
                  ? 'border-gray-300 border-b-white bg-white text-green-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('tabs.materials')}
            </Link>
          </div>
        </div>

        {activeTab === 'plants' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="hidden md:block md:col-span-1">
              <form method="get" className="bg-white rounded-lg shadow-md p-6 sticky top-4 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">{tFilter('title')}</h2>

                <div>
                  <label htmlFor="q" className="font-semibold text-gray-900 mb-2 block">
                    {tCommon('search')}
                  </label>
                  <input
                    id="q"
                    name="q"
                    defaultValue={plantRequestBody.keyword || ''}
                    placeholder={t('filters.searchByNamePlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tFilter('category')}</h3>
                  <div className="max-h-48 overflow-auto space-y-2 pr-1">
                    {categoryOptions.map((category) => (
                      <label key={category.id} className="flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          name="categoryIds"
                          value={String(category.id)}
                          defaultChecked={selectedCategories.has(category.id)}
                          className="mr-2"
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="placementType" className="font-semibold text-gray-900 mb-2 block">
                    {t('filters.placementType')}
                  </label>
                  <select
                    id="placementType"
                    name="placementType"
                    defaultValue={
                      plantRequestBody.placementType !== undefined
                        ? String(plantRequestBody.placementType)
                        : ''
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">{t('filters.all')}</option>
                    {placementTypeOptions.map((option) => (
                      <option key={option.value} value={String(option.value)}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="careLevelType" className="font-semibold text-gray-900 mb-2 block">
                    {t('filters.careLevelType')}
                  </label>
                  <select
                    id="careLevelType"
                    name="careLevelType"
                    defaultValue={
                      plantRequestBody.careLevelType !== undefined
                        ? String(plantRequestBody.careLevelType)
                        : ''
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">{t('filters.all')}</option>
                    {careLevelTypeOptions.map((option) => (
                      <option key={option.value} value={String(option.value)}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div>
                  <label htmlFor="careLevel" className="font-semibold text-gray-900 mb-2 block">
                    Care level text
                  </label>
                  <input
                    id="careLevel"
                    name="careLevel"
                    defaultValue={plantRequestBody.careLevel || ''}
                    placeholder="Ex: Easy, Medium, Hard"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div> */}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tFilter('size')}</h3>
                  <div className="space-y-2">
                    {sizeOptions.map((option) => (
                      <label key={option.value} className="flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          name="sizes"
                          value={String(option.value)}
                          defaultChecked={selectedSizes.has(option.value)}
                          className="mr-2"
                        />
                        {option.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="minBasePrice" className="font-semibold text-gray-900 mb-2 block">
                      {t('filters.minPrice')}
                    </label>
                    <input
                      id="minBasePrice"
                      name="minBasePrice"
                      type="number"
                      defaultValue={plantRequestBody.minBasePrice ?? ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxBasePrice" className="font-semibold text-gray-900 mb-2 block">
                      {t('filters.maxPrice')}
                    </label>
                    <input
                      id="maxBasePrice"
                      name="maxBasePrice"
                      type="number"
                      defaultValue={plantRequestBody.maxBasePrice ?? ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fengShuiElement" className="font-semibold text-gray-900 mb-2 block">
                    {t('filters.fengShuiElement')}
                  </label>
                  {/* <input
                    id="fengShuiElement"
                    name="fengShuiElement"
                    defaultValue={plantRequestBody.fengShuiElement || ''}
                    placeholder="Ex: Metal, Wood, Water"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  /> */}
                  <Select
                    native
                    id="fengShuiElement"
                    name="fengShuiElement"
                    defaultValue={plantRequestBody.fengShuiElement || ''}
                    className="w-full border border-gray-300 rounded-lg text-sm"
                  >
                    {['', 'Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'].map((element) => (
                      <option key={element} value={element}>
                        {element === '' ? t('filters.none') : element}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* <div>
                  <label htmlFor="tagIdsCsv" className="font-semibold text-gray-900 mb-2 block">
                    Tag IDs (csv)
                  </label>
                  <input
                    id="tagIdsCsv"
                    name="tagIdsCsv"
                    defaultValue={(plantRequestBody.tagIds || []).join(',')}
                    placeholder="1,2,3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div> */}

                <div>
                  <label htmlFor="nurseryId" className="font-semibold text-gray-900 mb-2 block">
                    {t('filters.nursery')}
                  </label>
                  <select
                    id="nurseryId"
                    name="nurseryId"
                    defaultValue={
                      plantRequestBody.nurseryId !== undefined ? String(plantRequestBody.nurseryId) : ''
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">{t('filters.allNurseries')}</option>
                    {nurseriesPayload.items
                      .filter((nursery) => nursery.isActive)
                      .map((nursery) => (
                        <option key={nursery.id} value={String(nursery.id)}>
                          {nursery.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="toxicity"
                      value="true"
                      defaultChecked={plantRequestBody.toxicity === true}
                      className="mr-2"
                    />
                    {t('filters.toxicity')}
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="airPurifying"
                      value="true"
                      defaultChecked={plantRequestBody.airPurifying === true}
                      className="mr-2"
                    />
                    {t('filters.airPurifying')}
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="hasFlower"
                      value="true"
                      defaultChecked={plantRequestBody.hasFlower === true}
                      className="mr-2"
                    />
                    {t('filters.hasFlower')}
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="petSafe"
                      value="true"
                      defaultChecked={plantRequestBody.petSafe === true}
                      className="mr-2"
                    />
                    {t('filters.petSafe')}
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="childSafe"
                      value="true"
                      defaultChecked={plantRequestBody.childSafe === true}
                      className="mr-2"
                    />
                    {t('filters.childSafe')}
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isUniqueInstance"
                      value="true"
                      defaultChecked={plantRequestBody.isUniqueInstance === true}
                      className="mr-2"
                    />
                    {t('filters.uniqueInstance')}
                  </label>
                </div>

                <div>
                  <label htmlFor="sort" className="font-semibold text-gray-900 mb-2 block">
                    {t('filters.sort')}
                  </label>
                  <select
                    id="sort"
                    name="sort"
                    defaultValue={selectedSort}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value=":">{t('sort.default')}</option>
                    <option value="name:asc">{t('sort.nameAsc')}</option>
                    <option value="name:desc">{t('sort.nameDesc')}</option>
                    <option value="basePrice:asc">{t('sort.priceAsc')}</option>
                    <option value="basePrice:desc">{t('sort.priceDesc')}</option>
                    <option value="createdAt:desc">{t('sort.newest')}</option>
                    <option value="createdAt:asc">{t('sort.oldest')}</option>
                    <option value="updatedAt:desc">{t('sort.updatedDesc')}</option>
                    <option value="updatedAt:asc">{t('sort.updatedAsc')}</option>
                    <option value="size:asc">{t('sort.sizeAsc')}</option>
                    <option value="size:desc">{t('sort.sizeDesc')}</option>
                    <option value="careLevel:asc">{t('sort.careLevelAsc')}</option>
                    <option value="careLevel:desc">{t('sort.careLevelDesc')}</option>
                    <option value="availableInstances:desc">{t('sort.availableDesc')}</option>
                    <option value="availableInstances:asc">{t('sort.availableAsc')}</option>
                  </select>
                </div>

                <input type="hidden" name="tab" value="plants" />
                <input type="hidden" name="page" value="1" />
                <input type="hidden" name="pageSize" value={String(plantRequestBody.pagination.pageSize)} />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {t('filters.apply')}
                  </button>
                  <Link
                    href="/plant-store?tab=plants"
                    locale={locale}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm flex items-center"
                  >
                    {tFilter('reset')}
                  </Link>
                </div>
              </form>
            </div>

            <div className="md:col-span-4">
              <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                <p>
                  {t('result.foundPlants', { count: plantsPayload.totalCount })}
                </p>
                <p>
                  {t('result.pageOf', {
                    current: plantsPayload.pageNumber,
                    total: Math.max(1, plantsPayload.totalPages),
                  })}
                </p>
              </div>

              {plantsPayload.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {plantsPayload.items.map((plant) => (
                    <ProductCard key={plant.id} plant={plant} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-lg text-gray-600 mb-4">{t('result.noPlants')}</p>
                  <Link
                    href="/plant-store?tab=plants"
                    locale={locale}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('result.clearFilters')}
                  </Link>
                </div>
              )}

              <div className="mt-8 flex items-center justify-center gap-3">
                <Link
                  href={plantsPrevHref}
                  locale={locale}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    plantsPayload.hasPrevious
                      ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      : 'pointer-events-none border-gray-200 bg-gray-100 text-gray-400'
                  }`}
                >
                  {tCommon('previous')}
                </Link>
                <Link
                  href={plantsNextHref}
                  locale={locale}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    plantsPayload.hasNext
                      ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      : 'pointer-events-none border-gray-200 bg-gray-100 text-gray-400'
                  }`}
                >
                  {tCommon('next')}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
              <p>
                {t('result.foundMaterials', { count: materialsPayload.totalCount })}
              </p>
              <p>
                {t('result.pageOf', {
                  current: materialsPayload.pageNumber,
                  total: Math.max(1, materialsPayload.totalPages),
                })}
              </p>
            </div>

            {materialsPayload.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {materialsPayload.items.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-lg text-gray-600 mb-4">{t('result.noMaterials')}</p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href={materialsPrevHref}
                locale={locale}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  materialsPayload.hasPrevious
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    : 'pointer-events-none border-gray-200 bg-gray-100 text-gray-400'
                }`}
              >
                {tCommon('previous')}
              </Link>
              <Link
                href={materialsNextHref}
                locale={locale}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  materialsPayload.hasNext
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    : 'pointer-events-none border-gray-200 bg-gray-100 text-gray-400'
                }`}
              >
                {tCommon('next')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
