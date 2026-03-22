'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Plant } from '@/data/sampledata';
import { useAuthStore } from '@/lib/store/authStore';
import { addPlantToCart } from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';

interface AddToCartButtonProps {
  plant: Plant;
}

export default function AddToCartButton({ plant }: AddToCartButtonProps) {
  const tProducts = useTranslations('products');
  const tCart = useTranslations('cart');
  const [quantity, setQuantity] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();

  const handleAddToCart = async () => {
    if (!user?.id) {
      setError('Vui long dang nhap de them san pham vao gio hang');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      await addPlantToCart(plant.id, quantity);
      notifyCartUpdated();
      setFeedbackMessage(
        tCart('addedSuccess', { quantity, name: plant.name }),
      );
      setQuantity(1);
      
      // Clear message after 3 seconds
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      console.error('Add to cart error:', err);
      
      // Clear error after 3 seconds
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < plant.availableCommonQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={decrementQuantity}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="px-6 py-2 border-x border-gray-300 min-w-15 text-center">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
            disabled={quantity >= plant.availableCommonQuantity || quantity >= plant.availableInstances || quantity >= plant.totalAvailableStock}
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={plant.availableCommonQuantity === 0 || isLoading}
          className={`flex-1 px-8 py-3 rounded-lg font-semibold transition-colors ${
            plant.availableCommonQuantity > 0 && !isLoading
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading
            ? tCart('processing')
            : plant.availableCommonQuantity > 0
            ? tProducts('addToCart')
            : tProducts('outOfStock')}
        </button>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="px-4 py-3 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
          {feedbackMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
