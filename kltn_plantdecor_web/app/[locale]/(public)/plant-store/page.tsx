import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCategoryTreeSSR } from '@/lib/api/categoriesService.server';
import {
  searchShopPlants,
  type ShopPlantListItem,
  type ShopPlantSearchPayload,
  type ShopPlantSearchRequest,
} from '@/lib/api/shopPlantsService';
import ProductCard from '@/components/product/ProductCard';
import { CategoryResponse } from '@/lib/api/categoriesService';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DEFAULT_PAGE_SIZE = 12;
const FALLBACK_IMAGE = '/img/background-login.jpg';

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

const buildRequestBody = (query: Record<string, string | string[] | undefined>): ShopPlantSearchRequest => {
  const page = parsePositiveInt(toSingle(query.page), 1);
  const pageSize = parsePositiveInt(toSingle(query.pageSize), DEFAULT_PAGE_SIZE);
  const sortByDirect = toSingle(query.sortBy)?.trim();
  const sortDirectionDirect = toSingle(query.sortDirection)?.trim();
  const sortCombined = toSingle(query.sort)?.trim() || '';
  const [sortByCombined, sortDirectionCombined] = sortCombined.split(':');
  const sortBy = sortByDirect || sortByCombined || undefined;
  const sortDirection = sortDirectionDirect || sortDirectionCombined || undefined;

  const categoryIds = [
    ...parseNumberArray(query.categoryIds),
    ...parseNumberArray(query.categoryId),
  ];
  const uniqueCategoryIds = [...new Set(categoryIds)];

  const tagIdsFromArray = parseNumberArray(query.tagIds);
  const tagIdsFromCsv = parseCsvStringArray(toSingle(query.tagIdsCsv))
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
  const uniqueTagIds = [...new Set([...tagIdsFromArray, ...tagIdsFromCsv])];

  return {
    pagination: { pageNumber: page, pageSize },
    keyword: toSingle(query.q)?.trim() || undefined,
    isActive: parseBooleanOrUndefined(toSingle(query.isActive)) ?? true,
    placementType: parseIntOrUndefined(toSingle(query.placementType)),
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
    nurseryId: parseIntOrUndefined(toSingle(query.nurseryId)),
    sortBy,
    sortDirection,
  };
};

const buildPaginationHref = (
  query: Record<string, string | string[] | undefined>,
  targetPage: number,
): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== '') {
      params.set(key, value);
    }
  });
  params.set('page', String(Math.max(1, targetPage)));
  return `/plant-store?${params.toString()}`;
};

// const mapShopPlantToSamplePlant = (plant: ShopPlantListItem) => ({
//   id: plant.id,
//   name: plant.name,
//   scientificName: plant.name,
//   description: [
//     `Care level: ${plant.careLevel || 'N/A'}`,
//     `Size: ${plant.size || 'N/A'}`,
//     plant.categoryNames.length > 0 ? `Categories: ${plant.categoryNames.join(', ')}` : '',
//   ]
//     .filter(Boolean)
//     .join(' • '),
//   category: 'indoor',
//   price: plant.basePrice,
//   imageUrl: plant.primaryImageUrl || FALLBACK_IMAGE,
//   stock: plant.availableInstances ?? 0,
//   rating: 0,
//   reviewCount: 0,
//   careLevel: 'easy',
//   lightRequirement: 'medium',
//   wateringFrequency: 'weekly',
//   size: 'medium',
//   isFeatured: false,
//   isNewArrival: false,
//   isBestSeller: false,
//   tags: plant.tagNames ?? [],
//   totalInstances: plant.totalInstances ?? 0,
// });

export default async function PlantStorePage({ params, searchParams }: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: 'plantStore' });
  const requestBody = buildRequestBody(query);

  const [plantsResult, categoriesResult] = await Promise.allSettled([
    searchShopPlants(requestBody, true, false),
    getCategoryTreeSSR(),
  ]);

  const plantsResponse = plantsResult.status === 'fulfilled' ? plantsResult.value : null;
  const categoriesResponse = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;

  const plantsPayload = getPayload<ShopPlantSearchPayload>(plantsResponse) ?? {
    items: [],
    totalCount: 0,
    pageNumber: requestBody.pagination.pageNumber,
    pageSize: requestBody.pagination.pageSize,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };
  console.log('Fetched plants on server render:', plantsPayload);

  if (plantsResult.status === 'rejected') {
    console.error('Failed to fetch shop plants on server render:', plantsResult.reason);
  }

  if (categoriesResult.status === 'rejected') {
    console.error('Failed to fetch category tree on server render:', categoriesResult.reason);
  }

  const categoryTree = getPayload<CategoryResponse[]>(categoriesResponse) ?? [];
  const categoryOptions = flattenCategories(categoryTree).filter((item) => item.isActive);
  const selectedCategories = new Set(requestBody.categoryIds ?? []);

  const selectedSort = `${requestBody.sortBy || ''}:${requestBody.sortDirection || ''}`;
  const prevHref = buildPaginationHref(query, (plantsPayload.pageNumber || 1) - 1);
  const nextHref = buildPaginationHref(query, (plantsPayload.pageNumber || 1) + 1);

  return (
    <div className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="hidden md:block md:col-span-1">
            <form method="get" className="bg-white rounded-lg shadow-md p-6 sticky top-4 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>

              <div>
                <label htmlFor="q" className="font-semibold text-gray-900 mb-2 block">Search</label>
                <input
                  id="q"
                  name="q"
                  defaultValue={requestBody.keyword || ''}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Categories</h3>
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
                <label htmlFor="careLevel" className="font-semibold text-gray-900 mb-2 block">Care level</label>
                <input
                  id="careLevel"
                  name="careLevel"
                  defaultValue={requestBody.careLevel || ''}
                  placeholder="VD: Dễ, Trung bình, Khó"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label htmlFor="placementType" className="font-semibold text-gray-900 mb-2 block">Placement type</label>
                <select
                  id="placementType"
                  name="placementType"
                  defaultValue={requestBody.placementType !== undefined ? String(requestBody.placementType) : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  <option value="0">Indoor</option>
                  <option value="1">Semi-outdoor</option>
                  <option value="2">Outdoor</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="minBasePrice" className="font-semibold text-gray-900 mb-2 block">Min price</label>
                  <input
                    id="minBasePrice"
                    name="minBasePrice"
                    type="number"
                    defaultValue={requestBody.minBasePrice ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="maxBasePrice" className="font-semibold text-gray-900 mb-2 block">Max price</label>
                  <input
                    id="maxBasePrice"
                    name="maxBasePrice"
                    type="number"
                    defaultValue={requestBody.maxBasePrice ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tagIdsCsv" className="font-semibold text-gray-900 mb-2 block">Tag IDs (csv)</label>
                <input
                  id="tagIdsCsv"
                  name="tagIdsCsv"
                  defaultValue={(requestBody.tagIds || []).join(',')}
                  placeholder="1,2,3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label htmlFor="nurseryId" className="font-semibold text-gray-900 mb-2 block">Nursery ID</label>
                <input
                  id="nurseryId"
                  name="nurseryId"
                  type="number"
                  defaultValue={requestBody.nurseryId ?? ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm text-gray-700">
                  <input type="checkbox" name="toxicity" value="true" defaultChecked={requestBody.toxicity === true} className="mr-2" />
                  Toxicity
                </label>
                <label className="flex items-center text-sm text-gray-700">
                  <input type="checkbox" name="airPurifying" value="true" defaultChecked={requestBody.airPurifying === true} className="mr-2" />
                  Air Purifying
                </label>
                <label className="flex items-center text-sm text-gray-700">
                  <input type="checkbox" name="hasFlower" value="true" defaultChecked={requestBody.hasFlower === true} className="mr-2" />
                  Has Flower
                </label>
                <label className="flex items-center text-sm text-gray-700">
                  <input type="checkbox" name="petSafe" value="true" defaultChecked={requestBody.petSafe === true} className="mr-2" />
                  Pet Safe
                </label>
                <label className="flex items-center text-sm text-gray-700">
                  <input type="checkbox" name="childSafe" value="true" defaultChecked={requestBody.childSafe === true} className="mr-2" />
                  Child Safe
                </label>
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="isUniqueInstance"
                    value="true"
                    defaultChecked={requestBody.isUniqueInstance === true}
                    className="mr-2"
                  />
                  Unique Instance
                </label>
              </div>

              <div>
                <label htmlFor="sort" className="font-semibold text-gray-900 mb-2 block">Sort</label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={selectedSort}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value=":">Default</option>
                  <option value="name:asc">Name A-Z</option>
                  <option value="name:desc">Name Z-A</option>
                  <option value="basePrice:asc">Price low-high</option>
                  <option value="basePrice:desc">Price high-low</option>
                  <option value="createdAt:desc">Newest</option>
                  <option value="createdAt:asc">Oldest</option>
                  <option value="updatedAt:desc">Updated desc</option>
                  <option value="updatedAt:asc">Updated asc</option>
                  <option value="size:asc">Size asc</option>
                  <option value="size:desc">Size desc</option>
                  <option value="careLevel:asc">Care level asc</option>
                  <option value="careLevel:desc">Care level desc</option>
                  <option value="availableInstances:desc">Available desc</option>
                  <option value="availableInstances:asc">Available asc</option>
                </select>
              </div>

              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="pageSize" value={String(requestBody.pagination.pageSize)} />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Apply
                </button>
                <Link
                  href="/plant-store"
                  locale={locale}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm flex items-center"
                >
                  Reset
                </Link>
              </div>
            </form>
          </div>

          <div className="md:col-span-4">
            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
              <p>
                Found <span className="font-semibold text-gray-900">{plantsPayload.totalCount}</span> plants
              </p>
              <p>
                Page {plantsPayload.pageNumber}/{Math.max(1, plantsPayload.totalPages)}
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
                <p className="text-lg text-gray-600 mb-4">No plants match your filters</p>
                <Link
                  href="/plant-store"
                  locale={locale}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href={prevHref}
                locale={locale}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  plantsPayload.hasPrevious
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    : 'pointer-events-none border-gray-200 bg-gray-100 text-gray-400'
                }`}
              >
                Previous
              </Link>
              <Link
                href={nextHref}
                locale={locale}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  plantsPayload.hasNext
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    : 'pointer-events-none border-gray-200 bg-gray-100 text-gray-400'
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
