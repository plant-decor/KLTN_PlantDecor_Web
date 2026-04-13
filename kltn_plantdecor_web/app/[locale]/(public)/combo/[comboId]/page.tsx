import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getPlantComboNurseries } from '@/lib/api/shopPlantsService';
import {
  getShopComboById,
  searchShopUnified,
  type ShopUnifiedComboItem,
} from '@/lib/api/shopUnifiedService';
import type { PlantCombo } from '@/types/store-management.types';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import ComboDetailPurchasePanel from '@/components/product/ComboDetailPurchasePanel';
import { formatCurrency } from '@/lib/utils/formatUtil';

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

const buildComboTitle = (comboName: string, suitableSpace: string, locale: string): string => {
  if (locale === 'en') {
    return `Combo ${comboName} - Green Solution for ${suitableSpace || 'Your Space'} | ${SITE_NAME}`;
  }

  return `Combo ${comboName} - Giải pháp xanh cho ${suitableSpace || 'không gian của bạn'} | ${SITE_NAME}`;
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

  const combo = getPayload<PlantCombo>(comboResponse);
  const comboName = combo?.comboName || fallbackCombo?.name || `Combo #${comboId}`;
  const comboDescription = combo?.description || fallbackCombo?.description || '';
  const suitableSpace = combo?.suitableSpace || '';
  const title = buildComboTitle(comboName, suitableSpace, locale);
  const description = buildComboDescription(comboDescription, comboName, locale);

  const imageUrls = [
    combo?.primaryImageUrl,
    ...(combo?.images?.map((image) => image.imageUrl) ?? []),
    fallbackCombo?.imageUrl,
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
  const tProducts = await getTranslations({ locale, namespace: 'products' });
  const tCombo = await getTranslations({ locale, namespace: 'combo' });
  const numericComboId = Number(comboId);

  if (!Number.isFinite(numericComboId) || numericComboId <= 0) {
    notFound();
  }

  const [comboResponse, nurseriesResponse, fallbackCombo] = await Promise.all([
    getShopComboById(numericComboId, true, false).catch(() => null),
    getPlantComboNurseries(numericComboId, true, false).catch(() => null),
    getFallbackCombo(numericComboId),
  ]);

  const combo = getPayload<PlantCombo>(comboResponse);
  const nurseries = getPayload(nurseriesResponse) ?? [];

  const comboName = combo?.comboName || fallbackCombo?.name || `Combo #${comboId}`;
  const comboDescription = combo?.description || fallbackCombo?.description || '';
  const comboTypeName = combo?.comboTypeName || fallbackCombo?.comboTypeName || '';
  const seasonName = combo?.seasonName || '';
  const themeName = combo?.themeName || '';
  const themeDescription = combo?.themeDescription || '';
  const suitableSpace = combo?.suitableSpace || '';
  const suitableRooms = Array.isArray(combo?.suitableRooms) ? combo?.suitableRooms : [];
  const comboPrice = combo?.comboPrice ?? fallbackCombo?.price ?? 0;

  const imageUrls = [
    combo?.primaryImageUrl,
    ...(combo?.images?.map((image) => image.imageUrl) ?? []),
    fallbackCombo?.imageUrl,
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
          <Link href={`/${locale}`} className="hover:text-green-600">{tCommon('menu')}</Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/plant-store`} className="hover:text-green-600">{tCommon('search')}</Link>
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
          </div>

          <div className="space-y-5">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{comboName}</h1>
              {comboTypeName ? <p className="text-sm text-gray-600 mt-2">Type: {comboTypeName}</p> : null}
            </div>

            <div>
              <span className="text-3xl font-bold text-green-600">{formatCurrency(comboPrice, locale)}</span>
            </div>

            {comboDescription ? (
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{comboDescription}</p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Season</p>
                <p className="font-semibold text-gray-900">{seasonName || tCommon('noData')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Theme</p>
                <p className="font-semibold text-gray-900">{themeName || tCommon('noData')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                <p className="text-sm text-gray-500 mb-1">Suitable space</p>
                <p className="font-semibold text-gray-900">{suitableSpace || tCommon('noData')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                <p className="text-sm text-gray-500 mb-1">Suitable rooms</p>
                <p className="font-semibold text-gray-900">
                  {suitableRooms.length > 0 ? suitableRooms.join(', ') : tCommon('noData')}
                </p>
              </div>
            </div>

            {themeDescription ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tCombo("description")}</h3>
                <p className="text-gray-600 leading-relaxed">{themeDescription}</p>
              </div>
            ) : null}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{tProducts('nurseryDrawer.selectNursery')}</h3>
              <ComboDetailPurchasePanel
                comboId={numericComboId}
                comboName={comboName}
                nurseries={nurseries}
                quantityByNurseryId={quantityByNurseryId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
