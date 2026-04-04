'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Plant } from '@/data/sampledata';
import { useAuthStore } from '@/lib/store/authStore';
import { addItemToCart, addPlantToCart } from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';

interface CartItemTarget {
  commonPlantId?: number | null;
  nurseryPlantComboId?: number | null;
  nurseryMaterialId?: number | null;
}

interface CartDisplayItem {
  id: number;
  name?: string;
  productName?: string;
  totalAvailableStock?: number;
  availableCommonQuantity?: number;
  availableInstances?: number;
}

interface AddToCartButtonProps {
  plant?: Plant;
  item?: CartDisplayItem;
  maxQuantity?: number | null;
  cartItemTarget?: CartItemTarget;
  assumeInStock?: boolean;
  disabled?: boolean;
  onAdded?: () => void;
}

export default function AddToCartButton({
  plant,
  item,
  maxQuantity,
  cartItemTarget,
  assumeInStock = false,
  disabled = false,
  onAdded,
}: AddToCartButtonProps) {
  const tProducts = useTranslations('products');
  const tCart = useTranslations('cart');
  const [quantity, setQuantity] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const currentItem = item ?? plant;

  const itemId = currentItem?.id ?? 0;

  const plantStock = Math.max(
    0,
    currentItem?.totalAvailableStock || currentItem?.availableCommonQuantity || currentItem?.availableInstances || 0
  );

  const hasMaxQuantity = typeof maxQuantity === 'number';
  const normalizedMaxQuantity = hasMaxQuantity ? Math.max(0, Math.floor(maxQuantity!)) : 0;
  const availableStock = hasMaxQuantity ? normalizedMaxQuantity : plantStock;
  const maxAllowedQuantity = hasMaxQuantity
    ? normalizedMaxQuantity
    : assumeInStock
    ? Number.MAX_SAFE_INTEGER
    : availableStock;
  const isOutOfStock = hasMaxQuantity ? normalizedMaxQuantity <= 0 : !assumeInStock && availableStock <= 0;

  useEffect(() => {
    if (quantity > maxAllowedQuantity) {
      setQuantity(Math.max(1, maxAllowedQuantity));
    }
  }, [maxAllowedQuantity, quantity]);

  const handleAddToCart = async () => {
    if (!user?.id) {
      setError('Vui long dang nhap de them san pham vao gio hang');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (isOutOfStock) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      if (cartItemTarget && (cartItemTarget.commonPlantId || cartItemTarget.nurseryPlantComboId || cartItemTarget.nurseryMaterialId)) {
        await addItemToCart({
          quantity,
          commonPlantId: cartItemTarget.commonPlantId ?? null,
          nurseryPlantComboId: cartItemTarget.nurseryPlantComboId ?? null,
          nurseryMaterialId: cartItemTarget.nurseryMaterialId ?? null,
        });
      } else {
        await addPlantToCart(itemId, quantity);
      }

      notifyCartUpdated();
      const productDisplayName = currentItem?.name ?? currentItem?.productName ?? `#${itemId}`;
      setFeedbackMessage(tCart('addedSuccess', { quantity, name: productDisplayName }));
      setQuantity(1);
      onAdded?.();
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      console.error('Add to cart error:', err);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxAllowedQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const isButtonDisabled = disabled || isLoading || isOutOfStock;

  if (!currentItem || itemId <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={decrementQuantity}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
            disabled={quantity <= 1 || disabled}
          >
            -
          </button>
          <span className="px-6 py-2 border-x border-gray-300 min-w-15 text-center">{quantity}</span>
          <button
            onClick={incrementQuantity}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
            disabled={disabled || quantity >= maxAllowedQuantity}
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isButtonDisabled}
          className={`flex-1 px-8 py-3 rounded-lg font-semibold transition-colors ${
            !isButtonDisabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? tCart('processing') : isOutOfStock ? tProducts('outOfStock') : tProducts('addToCart')}
        </button>
      </div>

      {feedbackMessage && (
        <div className="px-4 py-3 bg-green-100 text-green-800 rounded-lg text-sm font-medium">{feedbackMessage}</div>
      )}

      {error && <div className="px-4 py-3 bg-red-100 text-red-800 rounded-lg text-sm font-medium">{error}</div>}
    </div>
  );
}
