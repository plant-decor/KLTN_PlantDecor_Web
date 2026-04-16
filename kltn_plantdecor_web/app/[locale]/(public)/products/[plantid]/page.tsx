import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getPlantById, type PlantDetailResponse } from '@/lib/api/plantsService';
import {
  getRoomDesignEnums,
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
import { localizeRoomDesignEnumLabel } from '@/lib/utils/roomDesignEnumI18n';
import { get } from '@/lib/api/apiService.server';
import { ResponseModel } from '@/types/api.types';

interface PageProps {
  params: Promise<{ plantid: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FALLBACK_IMAGE = '/img/fallbackplant.avif';
const DEFAULT_OG_IMAGE = '/img/landingPageImage(1).jpg';
const SITE_NAME = 'PlantDecor';
const PRICE_CURRENCY = 'VND';

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

const serializeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');

const getRoomDesignLabelMaps = (
  rawEnums: unknown,
  tRoomDesignEnum: (key: string) => string
) => {
  const roomTypeById = new Map<number, string>();
  const roomStyleById = new Map<number, string>();

  const groups = Array.isArray(rawEnums) ? rawEnums : [];
  groups.forEach((group) => {
    if (!group || typeof group !== 'object') {
      return;
    }

    const candidate = group as { enumName?: unknown; values?: unknown };
    if (typeof candidate.enumName !== 'string' || !Array.isArray(candidate.values)) {
      return;
    }

    candidate.values.forEach((valueItem) => {
      if (!valueItem || typeof valueItem !== 'object') {
        return;
      }

      const option = valueItem as { value?: unknown; name?: unknown };
      const value = Number(option.value);
      if (!Number.isInteger(value) || typeof option.name !== 'string') {
        return;
      }

      if (candidate.enumName === 'RoomType') {
        roomTypeById.set(value, localizeRoomDesignEnumLabel(option.name, tRoomDesignEnum, 'RoomType'));
      }

      if (candidate.enumName === 'RoomStyle') {
        roomStyleById.set(value, localizeRoomDesignEnumLabel(option.name, tRoomDesignEnum, 'RoomStyle'));
      }
    });
  });

  return { roomTypeById, roomStyleById };
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

const buildProductTitle = (plant: PlantDetailResponse, locale: string): string => {
  if (locale === 'en') {
    return `${plant.name} - ${plant.size || 'Unknown size'} - Care ${plant.careLevel || 'Unknown'} | ${SITE_NAME}`;
  }

  return `${plant.name} - ${plant.size || 'Kích thước chưa rõ'} - Chăm sóc ${plant.careLevel || 'chưa rõ'} | ${SITE_NAME}`;
};

const buildProductDescription = (plant: PlantDetailResponse, locale: string): string => {
  if (plant.description?.trim()) return plant.description.trim();

  if (locale === 'en') {
    return `Discover ${plant.name} at ${SITE_NAME} with AI-powered green space consultation and professional plant care.`;
  }

  return `Khám phá ${plant.name} tại ${SITE_NAME} cùng tư vấn không gian xanh bằng AI và dịch vụ chăm sóc cây chuyên nghiệp.`;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ plantid, locale }, query] = await Promise.all([params, searchParams]);
  const plantId = Number(plantid);

  if (!Number.isFinite(plantId) || plantId <= 0) {
    return {
      title: locale === 'en' ? `Product Not Found | ${SITE_NAME}` : `Không tìm thấy sản phẩm | ${SITE_NAME}`,
    };
  }

  const selectedInstanceId = parsePositiveInt(toSingle(query.instanceId));
  const response = await getPlantById(plantId, true, false).catch(() => null);
  const plant = getPayload<PlantDetailResponse>(response);

  if (!plant) {
    return {
      title: locale === 'en' ? `Product Not Found | ${SITE_NAME}` : `Không tìm thấy sản phẩm | ${SITE_NAME}`,
    };
  }

  let selectedInstanceDetail: ShopPlantInstanceDetail | null = null;
  if (selectedInstanceId && plant.totalInstances > 0) {
    const selectedInstanceResponse = await getShopPlantInstanceById(selectedInstanceId, true, false).catch(() => null);
    const payload = getPayload<ShopPlantInstanceDetail>(selectedInstanceResponse);
    if (payload && payload.plantId === plant.id) {
      selectedInstanceDetail = payload;
    }
  }

  const plantImages = toImageUrls(plant.images);
  const instanceImages = toInstanceImageUrls(selectedInstanceDetail?.images);
  const displayImages =
    instanceImages.length > 0 ? instanceImages : plantImages.length > 0 ? plantImages : [FALLBACK_IMAGE];
  const ogImage = displayImages[0] || DEFAULT_OG_IMAGE;
  const title = buildProductTitle(plant, locale);
  const description = buildProductDescription(plant, locale);

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: [{ url: ogImage, alt: plant.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

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
  const tRoomDesignEnum = await getTranslations({ locale, namespace: 'roomDesignEnums' });
  const booleanLabel = (value: boolean | null | undefined) => (value ? t('yes') : t('no'));

  const plantId = Number(plantid);
  if (!Number.isFinite(plantId) || plantId <= 0) {
    notFound();
  }

  const selectedInstanceId = parsePositiveInt(toSingle(query.instanceId));

  const [response, roomDesignEnumsResponse] = await Promise.all([
    getPlantById(plantId, true, false),
    getRoomDesignEnums(true, false).catch(() => null),
  ]);
  const plant = getPayload<PlantDetailResponse>(response);
  if (!plant) {
    notFound();
  }
  const roomDesignEnums = getPayload(roomDesignEnumsResponse) ?? [];
  const { roomTypeById, roomStyleById } = getRoomDesignLabelMaps(roomDesignEnums, tRoomDesignEnum);

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
  const totalAvailableStock = getTotalAvailableStock(plant);
  const roomTypeLabels = (plant.roomType ?? []).map((item) => roomTypeById.get(Number(item)) || String(item));
  const roomStyleLabels = (plant.roomStyle ?? []).map((item) => roomStyleById.get(Number(item)) || String(item));
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plant.name,
    description: buildProductDescription(plant, locale),
    image: displayImages,
    offers: {
      '@type': 'Offer',
      price: plant.basePrice,
      priceCurrency: PRICE_CURRENCY,
      availability:
        totalAvailableStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="py-4 bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
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
              <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                <p className="text-sm text-gray-500 mb-1">{t('roomType')}</p>
                <p className="font-semibold text-gray-900">
                  {roomTypeLabels.length > 0 ? roomTypeLabels.join(', ') : t('notAvailable')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                <p className="text-sm text-gray-500 mb-1">{t('roomStyle')}</p>
                <p className="font-semibold text-gray-900">
                  {roomStyleLabels.length > 0 ? roomStyleLabels.join(', ') : t('notAvailable')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
