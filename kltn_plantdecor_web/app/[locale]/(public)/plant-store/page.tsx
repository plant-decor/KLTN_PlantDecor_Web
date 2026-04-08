import { getTranslations } from 'next-intl/server';
import { getCategoryTreeSSR } from '@/lib/api/categoriesService.server';
import {
  getPlantEnums,
  type PlantEnumGroup,
  searchShopNurseries,
  searchShopPlants,
  type ShopNurserySearchPayload,
  type ShopPlantSearchPayload,
} from '@/lib/api/shopPlantsService';
import {
  searchShopMaterials,
  type ShopMaterialSearchPayload,
} from '@/lib/api/shopMaterialsService';
import type { CategoryResponse } from '@/lib/api/categoriesService';
import PlantStoreTabs from '@/components/plant-store/PlantStoreTabs';
import PlantStoreFilters from '@/components/plant-store/PlantStoreFilters';
import PlantStorePlantsResults from '@/components/plant-store/PlantStorePlantsResults';
import PlantStoreMaterialsResults from '@/components/plant-store/PlantStoreMaterialsResults';
import {
  buildMaterialRequestBody,
  buildNurseryRequestBody,
  buildPlantRequestBody,
  flattenCategories,
  getActiveTab,
  getDefaultMaterialsPayload,
  getDefaultNurseriesPayload,
  getDefaultPlantsPayload,
  getEnumValues,
  getPayload,
  getSelectedSort,
  getSharedPageSize,
} from '@/lib/utils/plant-store/helpers';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PlantStorePage({ params, searchParams }: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: 'plantStore' });
  const tFilter = await getTranslations({ locale, namespace: 'filter' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const activeTab = getActiveTab(query);
  const sharedPageSize = getSharedPageSize(query);

  const plantRequestBody = buildPlantRequestBody(query);
  const materialRequestBody = buildMaterialRequestBody(query);

  const [plantsResult, categoriesResult, enumsResult, materialsResult, nurseriesResult] =
    await Promise.allSettled([
      activeTab === 'plants' ? searchShopPlants(plantRequestBody, true, false) : Promise.resolve(null),
      activeTab === 'plants' ? getCategoryTreeSSR() : Promise.resolve(null),
      activeTab === 'plants' ? getPlantEnums(true, false) : Promise.resolve(null),
      activeTab === 'materials'
        ? searchShopMaterials(materialRequestBody, true, false)
        : Promise.resolve(null),
      activeTab === 'plants'
        ? searchShopNurseries(buildNurseryRequestBody(), true, false)
        : Promise.resolve(null),
    ]);

  const plantsResponse = plantsResult.status === 'fulfilled' ? plantsResult.value : null;
  const categoriesResponse = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;
  const enumsResponse = enumsResult.status === 'fulfilled' ? enumsResult.value : null;
  const materialsResponse = materialsResult.status === 'fulfilled' ? materialsResult.value : null;
  const nurseriesResponse = nurseriesResult.status === 'fulfilled' ? nurseriesResult.value : null;

  const plantsPayload =
    getPayload<ShopPlantSearchPayload>(plantsResponse) ??
    getDefaultPlantsPayload(
      plantRequestBody.pagination.pageNumber,
      plantRequestBody.pagination.pageSize
    );

  const materialsPayload =
    getPayload<ShopMaterialSearchPayload>(materialsResponse) ??
    getDefaultMaterialsPayload(
      materialRequestBody.pagination.pageNumber,
      materialRequestBody.pagination.pageSize
    );
  const nurseriesPayload =
    getPayload<ShopNurserySearchPayload>(nurseriesResponse) ?? getDefaultNurseriesPayload();

  const categoryTree = getPayload<CategoryResponse[]>(categoriesResponse) ?? [];
  const categoryOptions = flattenCategories(categoryTree).filter((item) => item.isActive);
  const selectedCategories = new Set(plantRequestBody.categoryIds ?? []);
  const selectedSizes = new Set(plantRequestBody.sizes ?? []);

  const plantEnums = getPayload<PlantEnumGroup[]>(enumsResponse) ?? [];
  const placementTypeOptions = getEnumValues(plantEnums, 'PlacementType');
  const careLevelTypeOptions = getEnumValues(plantEnums, 'CareLevelType');
  const sizeOptions = getEnumValues(plantEnums, 'PlantSize');

  const selectedSort = getSelectedSort(plantRequestBody);

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
    sort: t('filters.sort'),
    apply: t('filters.apply'),
    reset: tFilter('reset'),
    sortDefault: t('sort.default'),
    sortNameAsc: t('sort.nameAsc'),
    sortNameDesc: t('sort.nameDesc'),
    sortPriceAsc: t('sort.priceAsc'),
    sortPriceDesc: t('sort.priceDesc'),
    sortNewest: t('sort.newest'),
    sortOldest: t('sort.oldest'),
    sortUpdatedDesc: t('sort.updatedDesc'),
    sortUpdatedAsc: t('sort.updatedAsc'),
    sortSizeAsc: t('sort.sizeAsc'),
    sortSizeDesc: t('sort.sizeDesc'),
    sortCareLevelAsc: t('sort.careLevelAsc'),
    sortCareLevelDesc: t('sort.careLevelDesc'),
    sortAvailableDesc: t('sort.availableDesc'),
    sortAvailableAsc: t('sort.availableAsc'),
  };

  return (
    <div className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        <PlantStoreTabs
          locale={locale}
          query={query}
          activeTab={activeTab}
          plantsLabel={t('tabs.plants')}
          materialsLabel={t('tabs.materials')}
        />

        {activeTab === 'plants' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="hidden md:block md:col-span-1">
              <PlantStoreFilters
                locale={locale}
                pageSize={sharedPageSize}
                requestBody={plantRequestBody}
                selectedSort={selectedSort}
                categoryOptions={categoryOptions}
                selectedCategories={selectedCategories}
                sizeOptions={sizeOptions}
                selectedSizes={selectedSizes}
                placementTypeOptions={placementTypeOptions}
                careLevelTypeOptions={careLevelTypeOptions}
                nurseriesPayload={nurseriesPayload}
                texts={filterTexts}
              />
            </div>

            <PlantStorePlantsResults
              locale={locale}
              query={query}
              payload={plantsPayload}
              pageSize={sharedPageSize}
              activeTab={activeTab}
              foundText={t('result.foundPlants', { count: plantsPayload.totalCount })}
              pageOfText={t('result.pageOf', {
                current: plantsPayload.pageNumber,
                total: Math.max(1, plantsPayload.totalPages),
              })}
              previousLabel={tCommon('previous')}
              nextLabel={tCommon('next')}
              clearFiltersLabel={t('result.clearFilters')}
              noPlantsLabel={t('result.noPlants')}
              itemsPerPageLabel={t('result.itemsPerPage')}
            />
          </div>
        ) : (
          <PlantStoreMaterialsResults
            locale={locale}
            query={query}
            payload={materialsPayload}
            pageSize={sharedPageSize}
            activeTab={activeTab}
            foundText={t('result.foundMaterials', { count: materialsPayload.totalCount })}
            pageOfText={t('result.pageOf', {
              current: materialsPayload.pageNumber,
              total: Math.max(1, materialsPayload.totalPages),
            })}
            previousLabel={tCommon('previous')}
            nextLabel={tCommon('next')}
            noMaterialsLabel={t('result.noMaterials')}
            itemsPerPageLabel={t('result.itemsPerPage')}
          />
        )}
      </div>
    </div>
  );
}
