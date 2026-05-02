import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import MaterialPurchasePanel from '@/components/product/MaterialPurchasePanel';
import RichTextDisplay from '@/components/store-management/RichTextDisplay';
import {
  getMaterialById,
  getMaterialNurseries,
  type MaterialDetailResponse,
  type MaterialNursery,
} from '@/lib/api/shopMaterialsService';
import { formatCurrency } from '@/lib/utils/formatUtil';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
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

const buildMaterialTitle = (name: string, locale: string): string => {
  if (locale === 'en') {
    return `${name} - Plant Care Supply | ${SITE_NAME}`;
  }

  return `${name} - Phụ kiện chăm sóc cây cảnh | ${SITE_NAME}`;
};

const buildMaterialDescription = (material: MaterialDetailResponse, locale: string): string => {
  if (material.description?.trim()) return material.description.trim();

  if (locale === 'en') {
    return `Explore ${material.name} at ${SITE_NAME} for indoor plant care and green living solutions.`;
  }

  return `Khám phá ${material.name} tại ${SITE_NAME} cho nhu cầu chăm sóc cây nội thất và không gian sống xanh.`;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const materialId = Number(id);

  if (!Number.isFinite(materialId) || materialId <= 0) {
    return {
      title: locale === 'en' ? `Material Not Found | ${SITE_NAME}` : `Không tìm thấy vật tư | ${SITE_NAME}`,
    };
  }

  const materialRes = await getMaterialById(materialId, true, false).catch(() => null);
  const material = getPayload<MaterialDetailResponse>(materialRes);

  if (!material) {
    return {
      title: locale === 'en' ? `Material Not Found | ${SITE_NAME}` : `Không tìm thấy vật tư | ${SITE_NAME}`,
    };
  }

  const imageUrls = material.images?.map((img) => img.imageUrl).filter(Boolean) ?? [];
  const ogImage = imageUrls[0] || FALLBACK_IMAGE || DEFAULT_OG_IMAGE;
  const title = buildMaterialTitle(material.name, locale);
  const description = buildMaterialDescription(material, locale);

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: [{ url: ogImage, alt: material.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const materialId = Number(id);
  const t = await getTranslations({ locale, namespace: 'productDetail' });

  if (!Number.isFinite(materialId) || materialId <= 0) {
    notFound();
  }

  const [materialRes, nurseriesRes] = await Promise.allSettled([
    getMaterialById(materialId, true, false),
    getMaterialNurseries(materialId, true, false),
  ]);

  const material = getPayload<MaterialDetailResponse>(
    materialRes.status === 'fulfilled' ? materialRes.value : null
  );
  const nurseries =
    getPayload<MaterialNursery[]>(nurseriesRes.status === 'fulfilled' ? nurseriesRes.value : null) ?? [];

  if (!material) {
    notFound();
  }

  const imageUrls = material.images?.map((img) => img.imageUrl).filter(Boolean) ?? [];
  const displayImages = imageUrls.length > 0 ? imageUrls : [FALLBACK_IMAGE];
  const materialJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: material.name,
    description: buildMaterialDescription(material, locale),
    image: displayImages,
    sku: material.materialCode,
    offers: {
      '@type': 'Offer',
      price: material.basePrice,
      priceCurrency: PRICE_CURRENCY,
    },
  };

  return (
    <div className="py-4 bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(materialJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center text-sm text-gray-500">
        <Link href={`/${locale}`} className="hover:text-green-600">{t('home')}</Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/plant-store?tab=materials`} className="hover:text-green-600">
          {t('store')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{material.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-xl shadow-md p-8">
          <div>
            <ClickableImageViewer
              images={displayImages}
              alt={material.name}
              containerClassName="rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
              className="w-full aspect-square object-cover"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Brand</p>
                <p className="font-semibold text-gray-900">{material.brand || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Unit</p>
                <p className="font-semibold text-gray-900">{material.unit || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Expiry</p>
                <p className="font-semibold text-gray-900">
                  {typeof material.expiryMonths === 'number' ? `${material.expiryMonths} months` : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-semibold text-gray-900">{material.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{material.name}</h1>
              {/* <p className="text-sm text-gray-500 mt-2">Code: {material.materialCode}</p> */}
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {material.categories?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {material.categories.map((category) => (
                      <span
                        key={category.id}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {material.tags?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {material.tags.map((tag) => (
                      <span key={tag.id} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {tag.tagName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <span className="text-3xl font-bold text-green-600">
                {formatCurrency(material.basePrice, locale)}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select nursery to buy</h3>
              <MaterialPurchasePanel material={material} nurseries={nurseries} />
            </div>
          </div>
          {material.description && (
              <div className="mb-6 w-full col-span-2"> {/* Thêm w-full */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                {/* Loại bỏ prose ở div này, chỉ để bên trong RichTextDisplay xử lý */}
                <div className="w-full overflow-hidden text-gray-600">
                  <RichTextDisplay content={material.description} />
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
