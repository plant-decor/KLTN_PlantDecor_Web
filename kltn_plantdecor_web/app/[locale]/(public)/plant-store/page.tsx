import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { getCategoryTreeSSR } from '@/lib/api/categoriesService.server';
import {
  searchShopNurseries,
  type ShopNurserySearchPayload,
} from '@/lib/api/shopPlantsService';
import { getShopUnifiedSearchConfig, searchShopUnified, type UnifiedEnumValue } from '@/lib/api/shopUnifiedService';
import type { CategoryResponse } from '@/lib/api/categoriesService';
import PlantStoreFilters from '@/components/plant-store/PlantStoreFilters';
import PlantStoreUnifiedResults from '@/components/plant-store/PlantStoreUnifiedResults';
import {
  checkWishlistItem,
  checkWishlistPlantInstanceByPlantId,
} from '@/lib/api/cartWishlistService';
import {
  buildUnifiedShopRequestBody,
  buildNurseryRequestBody,
  flattenCategories,
  getDefaultNurseriesPayload,
  getDefaultUnifiedSearchPayload,
  getPayload,
  getUnifiedEnumValues,
  getUnifiedSelectedSort,
  getSharedPageSize,
} from '@/lib/utils/plant-store/helpers';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PlantStorePage({ params, searchParams }: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const cookieStore = await cookies();
  const hasAccessToken = Boolean(cookieStore.get('accessToken')?.value);
  const t = await getTranslations({ locale, namespace: 'plantStore' });
  const tFilter = await getTranslations({ locale, namespace: 'filter' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const sharedPageSize = getSharedPageSize(query);

  const unifiedRequestBody = buildUnifiedShopRequestBody(query);

  const [searchResult, categoriesResult, configResult, nurseriesResult] =
    await Promise.allSettled([
      searchShopUnified(unifiedRequestBody, true, false),
      getCategoryTreeSSR(),
      getShopUnifiedSearchConfig(true, false),
      searchShopNurseries(buildNurseryRequestBody(), true, false),
    ]);

  const searchResponse = searchResult.status === 'fulfilled' ? searchResult.value : null;
  console.log('Shop Unified Search Response:', searchResponse);
  const categoriesResponse = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;
  const configResponse = configResult.status === 'fulfilled' ? configResult.value : null;
  const nurseriesResponse = nurseriesResult.status === 'fulfilled' ? nurseriesResult.value : null;

  const unifiedPayload =
    getPayload(searchResponse) ??
    getDefaultUnifiedSearchPayload(
      unifiedRequestBody.pagination.pageNumber,
      unifiedRequestBody.pagination.pageSize
    );
  const nurseriesPayload =
    getPayload<ShopNurserySearchPayload>(nurseriesResponse) ?? getDefaultNurseriesPayload();
  console.log('Unified Search Payload:', unifiedPayload);
  const initialWishlistState: Record<string, boolean> = {};
  if (hasAccessToken) {
    const wishlistChecks = new Map<string, Promise<boolean>>();
    for (const item of unifiedPayload.items.items) {
      if (item.type === 'Plant' && item.plant) {
        const key = `Plant:${item.plant.id}`;
        if (!wishlistChecks.has(key)) {
          if (item.plant.isUniqueInstance) {
            wishlistChecks.set(
              key,
              checkWishlistPlantInstanceByPlantId(item.plant.id, true, false)
            );
          } else {
            wishlistChecks.set(
              key,
              checkWishlistItem('Plant', item.plant.id, true, false)
            );
          }
        }
        continue;
      }

      if (item.type === 'Material' && item.material) {
        const materialId = item.material.materialId ?? item.material.id;
        const key = `Material:${materialId}`;
        if (!wishlistChecks.has(key)) {
          wishlistChecks.set(key, checkWishlistItem('Material', materialId, true, false));
        }
        continue;
      }

      if (item.type === 'Combo' && item.combo) {
        const key = `PlantCombo:${item.combo.id}`;
        if (!wishlistChecks.has(key)) {
          wishlistChecks.set(key, checkWishlistItem('PlantCombo', item.combo.id, true, false));
        }
      }
    }

    const wishlistSettled = await Promise.allSettled(
      Array.from(wishlistChecks.entries()).map(async ([key, checkPromise]) => ({
        key,
        inWishlist: await checkPromise,
      }))
    );

    wishlistSettled.forEach((result) => {
      if (result.status === 'fulfilled') {
        initialWishlistState[result.value.key] = result.value.inWishlist;
      }
    });
  }

  const categoryTree = getPayload<CategoryResponse[]>(categoriesResponse) ?? [];
  const categoryOptions = flattenCategories(categoryTree).filter((item) => item.isActive);
  const selectedCategories = new Set(unifiedRequestBody.categoryIds ?? []);
  const selectedSizes = new Set(unifiedRequestBody.sizes ?? []);

  const configPayload = getPayload(configResponse);
  const filterEnums = configPayload?.filterEnums ?? [];
  const sortEnums = configPayload?.sortEnums ?? [];

  const placementTypeOptions = getUnifiedEnumValues(filterEnums, 'PlacementType');
  const careLevelTypeOptions = getUnifiedEnumValues(filterEnums, 'CareLevelType');
  const sizeOptions = getUnifiedEnumValues(filterEnums, 'PlantSize');
  const fengShuiElementOptions = getUnifiedEnumValues(filterEnums, 'FengShuiElement');

  const selectedSort = getUnifiedSelectedSort(unifiedRequestBody);

  const sortByOptions = getUnifiedEnumValues(sortEnums, 'UnifiedSearchSortBy');
  const sortDirectionOptions = getUnifiedEnumValues(sortEnums, 'SortDirection');

  const toSortLabel = (sortByName: string, directionName: string) => {
    const direction = directionName.toLowerCase();
    const key = sortByName.toLowerCase();

    if (key === 'name' && direction === 'asc') return t('sort.nameAsc');
    if (key === 'name' && direction === 'desc') return t('sort.nameDesc');
    if (key === 'price' && direction === 'asc') return t('sort.priceAsc');
    if (key === 'price' && direction === 'desc') return t('sort.priceDesc');
    if (key === 'createdat' && direction === 'desc') return t('sort.newest');
    if (key === 'createdat' && direction === 'asc') return t('sort.oldest');
    if (key === 'size' && direction === 'asc') return t('sort.sizeAsc');
    if (key === 'size' && direction === 'desc') return t('sort.sizeDesc');
    if (key === 'availableinstances' && direction === 'desc') return t('sort.availableDesc');
    if (key === 'availableinstances' && direction === 'asc') return t('sort.availableAsc');

    return `${sortByName} ${directionName.toUpperCase()}`;
  };

  const sortOptions = [
    { value: ':', label: t('sort.default') },
    ...sortByOptions.flatMap((sortBy: UnifiedEnumValue) =>
      sortDirectionOptions.map((direction: UnifiedEnumValue) => ({
        value: `${sortBy.name}:${direction.name}`,
        label: toSortLabel(sortBy.name, direction.name),
      }))
    ),
  ];

  const filterTexts = {
    title: tFilter('title'),
    search: tCommon('search'),
    searchByNamePlaceholder: t('filters.searchByNamePlaceholder'),
    category: tFilter('category'),
    placementType: t('filters.placementType'),
    careLevelType: t('filters.careLevelType'),
    all: t('filters.all'),
    size: tFilter('size'),
    minPrice: t('filters.minPrice'),
    maxPrice: t('filters.maxPrice'),
    fengShuiElement: t('filters.fengShuiElement'),
    none: t('filters.none'),
    nursery: t('filters.nursery'),
    allNurseries: t('filters.allNurseries'),
    toxicity: t('filters.toxicity'),
    airPurifying: t('filters.airPurifying'),
    hasFlower: t('filters.hasFlower'),
    petSafe: t('filters.petSafe'),
    childSafe: t('filters.childSafe'),
    uniqueInstance: t('filters.uniqueInstance'),
    includePlants: t('filters.includePlants'),
    includeMaterials: t('filters.includeMaterials'),
    includeCombos: t('filters.includeCombos'),
    apply: t('filters.apply'),
    reset: tFilter('reset'),
  };

  return (
    <div className="py-10 bg-gray-50">
      <div className="w-10/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="hidden md:block md:col-span-1">
            <PlantStoreFilters
              locale={locale}
              pageSize={sharedPageSize}
              requestBody={unifiedRequestBody}
              categoryOptions={categoryOptions}
              selectedCategories={selectedCategories}
              sizeOptions={sizeOptions}
              selectedSizes={selectedSizes}
              placementTypeOptions={placementTypeOptions}
              careLevelTypeOptions={careLevelTypeOptions}
              fengShuiElementOptions={fengShuiElementOptions}
              nurseriesPayload={nurseriesPayload}
              texts={filterTexts}
            />
          </div>

          <PlantStoreUnifiedResults
            locale={locale}
            query={query}
            payload={unifiedPayload.items}
            pageSize={sharedPageSize}
            selectedSort={selectedSort}
            sortOptions={sortOptions}
            foundText={t('result.foundProducts', { count: unifiedPayload.items.totalCount })}
            pageOfText={t('result.pageOf', {
              current: unifiedPayload.items.pageNumber,
              total: Math.max(1, unifiedPayload.items.totalPages),
            })}
            previousLabel={tCommon('previous')}
            nextLabel={tCommon('next')}
            noProductsLabel={t('result.noProducts')}
            itemsPerPageLabel={t('result.itemsPerPage')}
            sortLabel={t('filters.sort')}
            initialWishlistState={initialWishlistState}
          />
        </div>
      </div>
    </div>
  );
}
