'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useAuthStore } from '@/lib/store/authStore';
import {
  addItemToCart,
  addMaterialToWishlist,
  checkWishlistItem,
  removeItemFromWishlist,
} from '@/lib/api/cartWishlistService';
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
  const tProducts = useTranslations('products');
  const tWishlist = useTranslations('wishlist');

  const [selectedNurseryMaterialId, setSelectedNurseryMaterialId] = useState<number | null>(
    nurseries[0]?.nurseryMaterialId ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const selectedNursery = useMemo(
    () => nurseries.find((item) => item.nurseryMaterialId === selectedNurseryMaterialId) ?? null,
    [nurseries, selectedNurseryMaterialId]
  );

  useEffect(() => {
    if (!user?.id || !material?.id) {
      setIsWishlisted(false);
      return;
    }

    let isMounted = true;

    const loadWishlistState = async () => {
      try {
        const exists = await checkWishlistItem('Material', material.id, false, false);
        if (isMounted) {
          setIsWishlisted(Boolean(exists));
        }
      } catch (wishlistError) {
        console.error('Check material wishlist error:', wishlistError);
      }
    };

    void loadWishlistState();

    return () => {
      isMounted = false;
    };
  }, [material?.id, user?.id]);

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

  const handleBuyNow = () => {
    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!selectedNursery || !material.isActive || material.basePrice <= 0) {
      return;
    }

    const query = new URLSearchParams({
      orderType: '3',
      paymentStrategy: '1',
      buyNowItemId: String(selectedNursery.nurseryMaterialId),
      buyNowItemType: '3',
      buyNowQuantity: String(Math.max(1, quantity)),
      buyNowItemName: material.name,
      buyNowItemPrice: String(material.basePrice),
    });

    router.push(`/${locale}/checkout/${user.id}/0?${query.toString()}`);
  };

  const handleToggleWishlist = async () => {
    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      setIsWishlistLoading(true);
      if (isWishlisted) {
        await removeItemFromWishlist('Material', material.id);
      } else {
        await addMaterialToWishlist(material.id);
      }
      setIsWishlisted((prev) => !prev);
    } catch (wishlistError) {
      console.error('Toggle material wishlist error:', wishlistError);
      setError(wishlistError instanceof Error ? wishlistError.message : 'Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
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
              className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedNurseryMaterialId === nursery.nurseryMaterialId
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
      <div className='flex center gap-4'>
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
          className={`w-full rounded-lg border px-6 py-3 font-semibold transition-colors ${selectedNursery && material.isActive && !isSubmitting
            ? 'border-green-600 text-green-700 hover:bg-green-50'
            : 'cursor-not-allowed border-gray-300 text-gray-500'
            }`}
        >
          {isSubmitting ? 'Processing...' : tProducts('addToCart')}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!selectedNursery || isSubmitting || !material.isActive}
          className={`rounded-lg px-6 py-3 font-semibold transition-colors ${selectedNursery && material.isActive && !isSubmitting
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
        >
          {tProducts('buyNow')}
        </button>

        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          className={`flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-colors ${isWishlisted
            ? 'border-red-500 text-red-600 hover:bg-red-50'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          {isWishlisted ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          <span>{isWishlisted ? tWishlist('removeItem') : tWishlist('addToWishlist')}</span>
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
