import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getPlantById, type PlantDetailResponse } from '@/lib/api/plantsService';
import AddToCartButton from '@/components/cart/AddToCartButton';
import AddToWishlistButton from '@/components/product/AddToWishlistButton';
import type { Plant } from '@/data/sampledata';
import { Category, Tag } from '@/data/storeCatalogData';

interface PageProps {
  params: Promise<{ plantid: string; locale: string }>;
}

const FALLBACK_IMAGE = '/img/background-login.jpg';

const getPayload = <T,>(response: { payload?: T; data?: T } | null | undefined): T | null => {
  if (!response) return null;
  return response.payload ?? response.data ?? null;
};

const toImageUrls = (images: PlantDetailResponse['images']): string[] => {
  if (!images || !Array.isArray(images)) {
    return [];
  }

  const urls = images
    .map((image) => {
      if (typeof image === 'string') return image;
      return image.imageUrl || '';
    })
    .filter(Boolean);

  return urls;
};

const formatCurrency = (price: number, locale: string) => {
  const numberLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  return `${price.toLocaleString(numberLocale)}đ`;
};

const booleanLabel = (value: boolean | null | undefined) => (value ? 'Yes' : 'No');

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

const mapPlantDetailToSamplePlant = (
  plant: PlantDetailResponse,
  imageUrl: string
): Plant => ({
  id: plant.id,
  name: plant.name,
  basePrice: String(plant.basePrice ?? 0),
  size: plant.size || 'Unknown',
  careLevel: plant.careLevel || 'Unknown',
  isActive: Boolean(plant.isActive),
  primaryImageUrl: imageUrl || null,
  totalInstances: plant.totalInstances ?? 0,
  availableInstances: plant.availableInstances ?? 0,
  availableCommonQuantity: plant.availableInstances ?? 0,
  totalAvailableStock: plant.totalInstances ?? 0,
  categoryNames: toCategoryNames(plant.categories),
  tagNames: toTagNames(plant.tags),
});

export default async function ProductDetailPage({ params }: PageProps) {
  const { plantid, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'productDetail' });

  const id = Number(plantid);
  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const response = await getPlantById(id, true, false);
  const plant = getPayload<PlantDetailResponse>(response);

  if (!plant) {
    notFound();
  }

  const images = toImageUrls(plant.images);
  const mainImage = images[0] || FALLBACK_IMAGE;
  const plantForActions = mapPlantDetailToSamplePlant(plant, mainImage);

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" locale={locale} className="hover:text-green-600">{t('home')}</Link>
          <span className="mx-2">/</span>
          <Link href="/plant-store" locale={locale} className="hover:text-green-600">{t('store')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{plant.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-xl shadow-md p-8">
          <div>
            <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img src={mainImage} alt={plant.name} className="w-full aspect-square object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.slice(0, 8).map((image, index) => (
                  <div key={`${image}-${index}`} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={image} alt={`${plant.name}-${index + 1}`} className="w-full h-24 object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{plant.name}</h1>
            {plant.specificName && (
              <p className="text-xl text-gray-600 italic mb-6">{plant.specificName}</p>
            )}

            <div className="mb-6">
              <span className="text-3xl font-bold text-green-600">
                {formatCurrency(plant.basePrice, locale)}
              </span>
            </div>

            <div className="mb-6">
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  plant.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {plant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {plant.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('description')}</h3>
                <p className="text-gray-600 leading-relaxed">{plant.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Origin</p>
                <p className="font-semibold text-gray-900">{plant.origin || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Placement</p>
                <p className="font-semibold text-gray-900">{plant.placementTypeName || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('size')}</p>
                <p className="font-semibold text-gray-900">{plant.size || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('careLevel')}</p>
                <p className="font-semibold text-gray-900">{plant.careLevel || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Growth rate</p>
                <p className="font-semibold text-gray-900">{plant.growthRate || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Unique instance</p>
                <p className="font-semibold text-gray-900">{booleanLabel(plant.isUniqueInstance)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety and traits</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded-lg px-3 py-2">Toxicity: {booleanLabel(plant.toxicity)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">Air purifying: {booleanLabel(plant.airPurifying)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">Has flower: {booleanLabel(plant.hasFlower)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">Pet safe: {booleanLabel(plant.petSafe)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">Child safe: {booleanLabel(plant.childSafe)}</div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">Pot included: {booleanLabel(plant.potIncluded)}</div>
              </div>
            </div>

            {(plant.fengShuiElement || plant.fengShuiMeaning) && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Feng Shui</h3>
                {plant.fengShuiElement && (
                  <p className="text-sm text-gray-700 mb-1">Element: <span className="font-medium">{plant.fengShuiElement}</span></p>
                )}
                {plant.fengShuiMeaning && (
                  <p className="text-sm text-gray-700">{plant.fengShuiMeaning}</p>
                )}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory</h3>
              <p className="text-gray-700">
                Available: <span className="font-semibold">{plant.availableInstances ?? 0}</span> / Total:{' '}
                <span className="font-semibold">{plant.totalInstances ?? 0}</span>
              </p>
            </div>

            <div className="mb-6 space-y-3 border-t border-gray-100 pt-6">
              <AddToCartButton plant={plantForActions} />
              <AddToWishlistButton
                plant={plantForActions}
                fullWidth
                variant="outlined"
              />
            </div>

            {Array.isArray(plant.categories) && plant.categories.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {plant.categories.map((category, index) => (
                    <span key={`${category.name || 'category'}-${index}`} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {category.name || `Category ${index + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(plant.tags) && plant.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {plant.tags.map((tag, index) => (
                    <span key={`${tag.tagName || 'tag'}-${index}`} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {tag.tagName || `Tag ${index + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
