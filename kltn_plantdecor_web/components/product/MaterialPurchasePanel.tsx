'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { addItemToCart } from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import type { MaterialDetailResponse, MaterialNursery } from '@/lib/api/shopMaterialsService';

interface MaterialPurchasePanelProps {
  material: MaterialDetailResponse;
  nurseries: MaterialNursery[];
}

export default function MaterialPurchasePanel({ material, nurseries }: MaterialPurchasePanelProps) {
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuthStore();

  const [selectedNurseryMaterialId, setSelectedNurseryMaterialId] = useState<number | null>(
    nurseries[0]?.nurseryMaterialId ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedNursery = useMemo(
    () => nurseries.find((item) => item.nurseryMaterialId === selectedNurseryMaterialId) ?? null,
    [nurseries, selectedNurseryMaterialId]
  );

  const handleAddToCart = async () => {
    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!selectedNursery) return;

    try {
      setIsSubmitting(true);
      setError('');
      await addItemToCart({
        quantity: Math.max(1, quantity),
        nurseryMaterialId: selectedNursery.nurseryMaterialId,
      });
      notifyCartUpdated();
    } catch (err) {
      console.error('Add material to cart error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {nurseries.length === 0 ? (
        <p className="text-sm text-gray-500">No nursery is selling this material currently.</p>
      ) : (
        <div className="space-y-2">
          {nurseries.map((nursery) => (
            <button
              key={nursery.nurseryMaterialId}
              type="button"
              onClick={() => setSelectedNurseryMaterialId(nursery.nurseryMaterialId)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                selectedNurseryMaterialId === nursery.nurseryMaterialId
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{nursery.name}</p>
              <p className="text-sm text-gray-600">{nursery.address}</p>
              <p className="text-sm text-gray-600">{nursery.phone}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-6 py-2 border-x border-gray-300 min-w-14 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedNursery || isSubmitting || !material.isActive}
          className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-colors ${
            selectedNursery && material.isActive && !isSubmitting
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'cursor-not-allowed bg-gray-300 text-gray-500'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Add to cart'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
