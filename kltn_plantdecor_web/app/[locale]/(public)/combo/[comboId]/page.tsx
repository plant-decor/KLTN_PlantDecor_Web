import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getPlantComboNurseries, getRoomDesignEnums } from '@/lib/api/shopPlantsService';
import {
  getShopComboById,
  searchShopUnified,
  type ShopUnifiedComboItem,
} from '@/lib/api/shopUnifiedService';
import type { PlantCombo } from '@/types/store-management.types';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import ComboDetailPurchasePanel from '@/components/product/ComboDetailPurchasePanel';
import RichTextDisplay from '@/components/store-management/RichTextDisplay';
import { formatCurrency } from '@/lib/utils/formatUtil';
import { localizeRoomDesignEnumLabel } from '@/lib/utils/roomDesignEnumI18n';

interface ComboDetailPageProps {
  params: Promise<{ locale: string; comboId: string }>;
}

const FALLBACK_IMAGE = '/img/fallbackplant.avif';
const DEFAULT_OG_IMAGE = '/img/landingPageImage(1).jpg';
const SITE_NAME = 'PlantDecor';
const PRICE_CURRENCY = 'VND';

const getPayload = <T,>(response: { payload?: T; data?: T } | null | undefined): T | null => {
  if (!response) return null;
  return response.payload ?? response.data ?? null;
};

const getRoomDesignLabelMaps = (
  rawEnums: unknown,
  tRoomDesignEnum: (key: string) => string
) => {
  const lightRequirementById = new Map<number, string>();
  const roomTypeById = new Map<number, string>();

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

      if (candidate.enumName === 'LightRequirement') {
        lightRequirementById.set(
          value,
          localizeRoomDesignEnumLabel(option.name, tRoomDesignEnum, 'LightRequirement')
        );
      }

      if (candidate.enumName === 'RoomType') {
        roomTypeById.set(value, localizeRoomDesignEnumLabel(option.name, tRoomDesignEnum, 'RoomType'));
      }
    });
  });

  return { lightRequirementById, roomTypeById };
};

const serializeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');

const getFallbackCombo = async (comboId: number): Promise<ShopUnifiedComboItem | null> => {
  const response = await searchShopUnified(
    {
      pagination: { pageNumber: 1, pageSize: 100 },
      includePlants: false,
      includeMaterials: false,
      includeCombos: true,
      sortBy: 'CreatedAt',
      sortDirection: 'Desc',
    },
    true,
    false
  ).catch(() => null);

  const payload = getPayload(response);
  if (!payload) return null;

  return payload.items.items.find((item) => item.type === 'Combo' && item.combo?.id === comboId)?.combo ?? null;
};

const buildComboTitle = (comboName: string, suitableSpaceLabel: string, locale: string): string => {
  if (locale === 'en') {
    return `Combo ${comboName} - Green Solution for ${suitableSpaceLabel || 'Your Space'} | ${SITE_NAME}`;
  }

  return `Combo ${comboName} - Giải pháp xanh cho ${suitableSpaceLabel || 'không gian của bạn'} | ${SITE_NAME}`;
};

const buildComboDescription = (
  comboDescription: string,
  comboName: string,
  locale: string
): string => {
  if (comboDescription.trim()) return comboDescription.trim();

  if (locale === 'en') {
    return `Discover combo ${comboName} at ${SITE_NAME} for AI-powered green space design and plant care.`;
  }

  return `Khám phá combo ${comboName} tại ${SITE_NAME} cho thiết kế không gian xanh bằng AI và chăm sóc cây chuyên nghiệp.`;
};

export async function generateMetadata({ params }: ComboDetailPageProps): Promise<Metadata> {
  const { locale, comboId } = await params;
  const tRoomDesignEnum = await getTranslations({ locale, namespace: 'roomDesignEnums' });
  const numericComboId = Number(comboId);

  if (!Number.isFinite(numericComboId) || numericComboId <= 0) {
    return {
      title: locale === 'en' ? `Combo Not Found | ${SITE_NAME}` : `Không tìm thấy combo | ${SITE_NAME}`,
    };
  }

  const [comboResponse, fallbackCombo] = await Promise.all([
    getShopComboById(numericComboId, true, false).catch(() => null),
    getFallbackCombo(numericComboId),
  ]);
  console.log('comboResponse',comboResponse);
  const roomDesignEnumsResponse = await getRoomDesignEnums(true, false).catch(() => null);

  const combo = getPayload<PlantCombo>(comboResponse);
  const roomDesignEnums = getPayload(roomDesignEnumsResponse) ?? [];
  const { lightRequirementById } = getRoomDesignLabelMaps(roomDesignEnums, tRoomDesignEnum);
  const comboName = combo?.comboName || fallbackCombo?.name || `Combo #${comboId}`;
  const comboDescription = combo?.description || fallbackCombo?.description || '';
  const suitableSpaceLabel = lightRequirementById.get(Number(combo?.suitableSpace)) || '';
  const title = buildComboTitle(comboName, suitableSpaceLabel, locale);
  const description = buildComboDescription(comboDescription, comboName, locale);

  const imageUrls = [
    combo?.primaryImageUrl,
    ...(combo?.images?.map((image) => image.imageUrl) ?? []),
    fallbackCombo?.primaryImageUrl,
  ].filter((url): url is string => Boolean(url));

  const ogImage = imageUrls[0] || FALLBACK_IMAGE || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: [{ url: ogImage, alt: comboName }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ComboDetailPage({ params }: ComboDetailPageProps) {
  const { locale, comboId } = await params;
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const t = await getTranslations({ locale, namespace: 'productDetail' });
  const tProducts = await getTranslations({ locale, namespace: 'products' });
  const tCombo = await getTranslations({ locale, namespace: 'combo' });
  const tRoomDesignEnum = await getTranslations({ locale, namespace: 'roomDesignEnums' });
  const numericComboId = Number(comboId);

  if (!Number.isFinite(numericComboId) || numericComboId <= 0) {
    notFound();
  }

  const [comboResponse, nurseriesResponse, fallbackCombo] = await Promise.all([
    getShopComboById(numericComboId, true, false).catch(() => null),
    getPlantComboNurseries(numericComboId, true, false).catch(() => null),
    getFallbackCombo(numericComboId),
  ]);
  const roomDesignEnumsResponse = await getRoomDesignEnums(true, false).catch(() => null);

  const combo = getPayload<PlantCombo>(comboResponse);
  const roomDesignEnums = getPayload(roomDesignEnumsResponse) ?? [];
  const { roomTypeById } = getRoomDesignLabelMaps(roomDesignEnums, tRoomDesignEnum);
  const nurseries = getPayload(nurseriesResponse) ?? [];

  const comboName = combo?.comboName || fallbackCombo?.name || `Combo #${comboId}`;
  const comboDescription = combo?.description || fallbackCombo?.description || '';
  const comboTypeName = combo?.comboTypeName || fallbackCombo?.comboTypeName || '';
  const seasonName = combo?.seasonName || '';
  const themeName = combo?.themeName || '';
  const themeDescription = combo?.themeDescription || '';
  const suitableSpaceLabel = (combo?.suitableSpace) || '';
  const suitableRooms = Array.isArray(combo?.suitableRooms) ? combo.suitableRooms : [];
  const suitableRoomLabels = suitableRooms.map((roomId) => roomTypeById.get(Number(roomId)) || String(roomId));
  const comboPrice = combo?.comboPrice ?? fallbackCombo?.price ?? 0;

  const imageUrls = [
    combo?.primaryImageUrl,
    ...(combo?.images?.map((image) => image.imageUrl) ?? []),
    fallbackCombo?.primaryImageUrl,
  ].filter((url): url is string => Boolean(url));

  const displayImages = imageUrls.length > 0 ? [...new Set(imageUrls)] : [FALLBACK_IMAGE];

  const quantityByNurseryId: Record<number, number> = {};
  (fallbackCombo?.nurseries ?? []).forEach((item) => {
    quantityByNurseryId[item.nurseryId] = Math.max(0, Math.floor(item.quantity || 0));
  });
  const knownQuantities = Object.values(quantityByNurseryId);
  const hasKnownStockSignal = knownQuantities.length > 0;
  const totalKnownStock = knownQuantities.reduce((sum, quantity) => sum + quantity, 0);

  if (!combo && !fallbackCombo && nurseries.length === 0) {
    notFound();
  }

  const comboJsonLdBase = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: comboName,
    description: buildComboDescription(comboDescription, comboName, locale),
    image: displayImages,
    offers: {
      '@type': 'Offer',
      price: comboPrice,
      priceCurrency: PRICE_CURRENCY,
    },
  };

  const comboJsonLd = hasKnownStockSignal
    ? {
      ...comboJsonLdBase,
      offers: {
        ...comboJsonLdBase.offers,
        availability:
          totalKnownStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    }
    : comboJsonLdBase;

  return (
    <div className="py-4 bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(comboJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center text-sm text-gray-500">
        <Link href={`/${locale}`} className="hover:text-green-600">{t('home')}</Link>
        <span className="mx-2">/</span>
          <Link href={`/${locale}/plant-store`} className="hover:text-green-600">{t('store')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{comboName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-xl shadow-md p-8">
          <div>
            <ClickableImageViewer
              images={displayImages}
              alt={comboName}
              containerClassName="rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
              className="w-full aspect-square object-cover"
            />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Season</p>
                  <p className="font-semibold text-gray-900">{seasonName || tCommon('noData')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Theme</p>
                  <p className="font-semibold text-gray-900">{themeName || tCommon('noData')}</p>
                </div>
                {themeDescription ? (
                  <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tCombo("themeDescription")}</h3>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      <RichTextDisplay content={themeDescription} />
                    </div>
                  </div>
                ) : null}
                <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Suitable space</p>
                  <p className="font-semibold text-gray-900">{suitableSpaceLabel || tCommon('noData')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Suitable rooms</p>
                  <p className="font-semibold text-gray-900">
                    {suitableRoomLabels.length > 0 ? suitableRoomLabels.join(', ') : tCommon('noData')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-bold text-gray-900">{comboName}</h1>
              {comboTypeName ? <p className="text-sm text-gray-600 mt-2">Type: {comboTypeName}</p> : null}
              <div>
                <span className="text-3xl font-bold text-green-600">{formatCurrency(comboPrice, locale)}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{tProducts('nurseryDrawer.selectNursery')}</h3>
              <ComboDetailPurchasePanel
                comboId={numericComboId}
                comboName={comboName}
                comboPrice={comboPrice}
                nurseries={nurseries}
                quantityByNurseryId={quantityByNurseryId}
              />
            </div>

            <div className="mt-8 w-full col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {locale === 'en' ? 'Plants in this combo' : 'Các cây trong combo'}
              </h3>
              {combo?.comboItems && combo.comboItems.length > 0 ? (
                <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                  {combo.comboItems.map((item, index) => (
                    <li key={`${item.plantId}-${index}`} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/${locale}/products/${item.plantId}`}
                          className="font-semibold text-gray-900 hover:text-green-700 hover:underline"
                        >
                          {item.plantName || `Plant #${item.plantId}`}
                        </Link>
                        {item.notes ? (
                          <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {locale === 'en' ? 'Quantity' : 'Số lượng'}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                          {Math.max(0, Math.floor(Number(item.quantity ?? 0)))}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">{tCommon('noData')}</p>
              )}
            </div>
            {comboDescription && (
              <div className="mb-6 w-full col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <div className="w-full overflow-hidden text-gray-600">
                  <RichTextDisplay content={comboDescription} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      );
}
