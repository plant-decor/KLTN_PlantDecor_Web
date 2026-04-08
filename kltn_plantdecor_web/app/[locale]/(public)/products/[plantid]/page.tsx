import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getPlantById, type PlantDetailResponse } from '@/lib/api/plantsService';
import {
  getShopPlantInstanceById,
  type ShopPlantInstanceDetail,
  type ShopPlantInstanceImage,
} from '@/lib/api/shopPlantsService';
import type { NurseryResponse } from '@/types/nursery.types';
import type { Plant } from '@/data/sampledata';
import { Category, Tag } from '@/data/storeCatalogData';
import ProductDetailPurchasePanel from '@/components/product/ProductDetailPurchasePanel';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import { getFengShuiColors, getFengShuiElementLabel } from '@/lib/utils/fengShui';
import { formatCurrency } from '@/lib/utils/formatUtil';
import { get } from '@/lib/api/apiService.server';
import { ResponseModel } from '@/types/api.types';

interface PageProps {
  params: Promise<{ plantid: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FALLBACK_IMAGE = '/img/background-login.jpg';

const getPayload = <T,>(response: { payload?: T; data?: T } | null | undefined): T | null => {
  if (!response) return null;
  return response.payload ?? response.data ?? null;
};

const toSingle = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const parsePositiveInt = (value: string | undefined): number | null => {
  if (!value) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
};

const toImageUrls = (images: PlantDetailResponse['images']): string[] => {
  if (!images || !Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      if (typeof image === 'string') return image;
      return image.imageUrl || '';
    })
    .filter(Boolean);
};

const toInstanceImageUrls = (images: ShopPlantInstanceImage[] | undefined): string[] => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => image.imageUrl || image.url || image.preview || '')
    .filter(Boolean);
};

const toCategoryNames = (categories: PlantDetailResponse['categories']): Category[] => {
  if (!Array.isArray(categories)) return [];

  return categories.map((category) => ({
    id: category.id,
    parentCategoryId: null,
    name: category.name,
    isActive: true,
    categoryType: 0,
    categoryTypeName: 'General',
    createdAt: '',
    updatedAt: '',
    description: '',
  }));
};

const toTagNames = (tags: PlantDetailResponse['tags']): Tag[] => {
  if (!Array.isArray(tags)) return [];
  return tags.map((tag) => ({
    id: tag.id,
    tagName: tag.tagName,
    tagType: tag.tagType ?? 0,
    tagTypeName: tag.tagTypeName ?? '',
  }));
};

const toNumber = (value: number | null | undefined): number => (typeof value === 'number' ? value : 0);

const getTotalAvailableStock = (plant: PlantDetailResponse): number => {
  const responseTotal = toNumber(plant.totalAvailableStock);
  if (responseTotal > 0) return responseTotal;

  return (
    toNumber(plant.availableInstances) +
    toNumber(plant.availableCommonQuantity) +
    toNumber(plant.availableComboQuantity) +
    toNumber(plant.availableMaterialQuantity)
  );
};

const mapPlantDetailToSamplePlant = (plant: PlantDetailResponse, imageUrl: string): Plant => {
  const totalAvailableStock = getTotalAvailableStock(plant);
  const availableInstances = toNumber(plant.availableInstances);
  const availableCommonQuantity = toNumber(plant.availableCommonQuantity);

  return {
    id: plant.id,
    name: plant.name,
    basePrice: plant.basePrice ?? 0,
    size: plant.size || 'Unknown',
    careLevel: plant.careLevel || 'Unknown',
    isActive: Boolean(plant.isActive),
    primaryImageUrl: imageUrl || null,
    totalInstances: plant.totalInstances ?? 0,
    availableInstances,
    availableCommonQuantity,
    totalAvailableStock,
    categoryNames: toCategoryNames(plant.categories),
    tagNames: toTagNames(plant.tags),
  };
};

const getNurseryCommonOrInstance = async (plant: PlantDetailResponse): Promise<NurseryResponse[]> => {
  try {
    if (plant.totalInstances === 0) {
      const nurseriesCommon = await get<ResponseModel<NurseryResponse[]>>(
        `/shop/plants/${plant.id}/common-nurseries`,
        undefined
      );
      return getPayload<NurseryResponse[]>(nurseriesCommon) ?? [];
    }

    const nurseryInstance = await get<ResponseModel<NurseryResponse[]>>(`/plants/${plant.id}/nurseries`, undefined);
    return getPayload<NurseryResponse[]>(nurseryInstance) ?? [];
  } catch (error) {
    console.error('Fetch nurseries error:', error);
    return [];
  }
};

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const [{ plantid, locale }, query] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: 'productDetail' });
  const booleanLabel = (value: boolean | null | undefined) => (value ? t('yes') : t('no'));

  const plantId = Number(plantid);
  if (!Number.isFinite(plantId) || plantId <= 0) {
    notFound();
  }

  const selectedInstanceId = parsePositiveInt(toSingle(query.instanceId));

  const response = await getPlantById(plantId, true, false);
  const plant = getPayload<PlantDetailResponse>(response);
  if (!plant) {
    notFound();
  }

  let selectedInstanceDetail: ShopPlantInstanceDetail | null = null;
  if (selectedInstanceId && plant.totalInstances > 0) {
    try {
      const selectedInstanceResponse = await getShopPlantInstanceById(selectedInstanceId, true, false);
      const payload = getPayload<ShopPlantInstanceDetail>(selectedInstanceResponse);

      if (payload && payload.plantId === plant.id) {
        selectedInstanceDetail = payload;
      }
    } catch {
      selectedInstanceDetail = null;
    }
  }

  const plantImages = toImageUrls(plant.images);
  const instanceImages = toInstanceImageUrls(selectedInstanceDetail?.images);
  const displayImages =
    instanceImages.length > 0 ? instanceImages : plantImages.length > 0 ? plantImages : [FALLBACK_IMAGE];

  const mainImage = displayImages[0] || FALLBACK_IMAGE;
  const plantForActions = mapPlantDetailToSamplePlant(plant, mainImage);
  const isNurseryAvailable = await getNurseryCommonOrInstance(plant);

  return (
    <div className="py-4 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center text-sm text-gray-500">
          <Link href={`/${locale}`} className="hover:text-green-600">{t('home')}</Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/plant-store`} className="hover:text-green-600">{t('store')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{plant.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-xl shadow-md p-8">
          <div>
            <ClickableImageViewer
              images={displayImages}
              alt={plant.name}
              containerClassName="rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
              className="w-full aspect-square object-cover"
            />

            {(plant.fengShuiElement || plant.fengShuiMeaning) && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('fengShui.title')}</h3>
                {plant.fengShuiElement && (() => {
                  const fengShuiColors = getFengShuiColors(plant.fengShuiElement);
                  const fengShuiLabel = getFengShuiElementLabel(plant.fengShuiElement);

                  return (
                    <p className="text-sm text-gray-700 mb-2">
                      {t('fengShui.element')}:{' '}
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: fengShuiColors.bg,
                          color: fengShuiColors.text,
                          borderColor: fengShuiColors.border,
                        }}
                      >
                        {fengShuiLabel}
                      </span>
                    </p>
                  );
                })()}
                {plant.fengShuiMeaning && <p className="text-sm text-gray-700">{plant.fengShuiMeaning}</p>}
              </div>
            )}

            {Array.isArray(plant.categories) && plant.categories.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('categories')}</h3>
                <div className="flex flex-wrap gap-2">
                  {plant.categories.map((category, index) => (
                    <span
                      key={`${category.name || 'category'}-${index}`}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      {category.name || t('categoryFallback', { index: index + 1 })}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(plant.tags) && plant.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {plant.tags.map((tag, index) => (
                    <span
                      key={`${tag.tagName || 'tag'}-${index}`}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag.tagName || t('tagFallback', { index: index + 1 })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-6 space-y-3 border-t border-gray-100 pt-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{plant.name}</h1>
              {plant.specificName && <p className="text-xl text-gray-600 italic mb-6">{plant.specificName}</p>}

              <div className="mb-6">
                <span className="text-3xl font-bold text-green-600">{formatCurrency(plant.basePrice, locale)}</span>
              </div>

              <ProductDetailPurchasePanel
                plant={plantForActions}
                nurseries={isNurseryAvailable}
                initialSelectedInstanceId={selectedInstanceDetail?.id ?? selectedInstanceId}
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('safetyAndTraits')}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded-lg px-3 py-2">{t('traits.toxicity')}: {booleanLabel(plant.toxicity)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">{t('traits.airPurifying')}: {booleanLabel(plant.airPurifying)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">{t('traits.hasFlower')}: {booleanLabel(plant.hasFlower)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">{t('traits.petSafe')}: {booleanLabel(plant.petSafe)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">{t('traits.childSafe')}: {booleanLabel(plant.childSafe)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">{t('traits.potIncluded')}: {booleanLabel(plant.potIncluded)}</div>
              </div>
            </div>

            {plant.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('description')}</h3>
                <p className="text-gray-600 leading-relaxed">{plant.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('origin')}</p>
                <p className="font-semibold text-gray-900">{plant.origin || t('notAvailable')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('placement')}</p>
                <p className="font-semibold text-gray-900">{plant.placementTypeName || t('notAvailable')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('size')}</p>
                <p className="font-semibold text-gray-900">{plant.size || t('notAvailable')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('careLevel')}</p>
                <p className="font-semibold text-gray-900">{plant.careLevel || t('notAvailable')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('growthRate')}</p>
                <p className="font-semibold text-gray-900">{plant.growthRate || t('notAvailable')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('uniqueInstance')}</p>
                <p className="font-semibold text-gray-900">{booleanLabel(plant.isUniqueInstance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
