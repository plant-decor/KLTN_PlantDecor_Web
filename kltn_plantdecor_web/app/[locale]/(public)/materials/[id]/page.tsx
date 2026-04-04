import { notFound } from 'next/navigation';
import Link from 'next/link';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import MaterialPurchasePanel from '@/components/product/MaterialPurchasePanel';
import {
  getMaterialById,
  getMaterialNurseries,
  type MaterialDetailResponse,
  type MaterialNursery,
} from '@/lib/api/shopMaterialsService';
import { formatCurrency } from '@/lib/utils/formatUtil';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

const FALLBACK_IMAGE = '/img/fallbackplant.avif';

const getPayload = <T,>(response: { payload?: T; data?: T } | null | undefined): T | null => {
  if (!response) return null;
  return response.payload ?? response.data ?? null;
};

export default async function MaterialDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const materialId = Number(id);

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

  return (
    <div className="py-4 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center text-sm text-gray-500">
          <Link href={`/${locale}`} className="hover:text-green-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/plant-store?tab=materials`} className="hover:text-green-600">
            Planting Supplies
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
          </div>

          <div className="space-y-5">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{material.name}</h1>
              <p className="text-sm text-gray-500 mt-2">Code: {material.materialCode}</p>
            </div>

            <div>
              <span className="text-3xl font-bold text-green-600">
                {formatCurrency(material.basePrice, locale)}
              </span>
            </div>

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

            {material.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{material.description}</p>
              </div>
            )}

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

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select nursery to buy</h3>
              <MaterialPurchasePanel material={material} nurseries={nurseries} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
