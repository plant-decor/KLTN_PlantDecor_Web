'use client';

import { useState } from 'react';
import type { SamplePlant } from '@/data/sampledata';

interface AddToCartButtonProps {
  plant: SamplePlant;
}

export default function AddToCartButton({ plant }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // TODO: Add to cart functionality
    console.log('Adding to cart:', plant.name, 'Quantity:', quantity);
    alert(`Đã thêm ${quantity} ${plant.name} vào giỏ hàng!`);
  };

  const incrementQuantity = () => {
    if (quantity < plant.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
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
        <span className="px-6 py-2 border-x border-gray-300 min-w-[60px] text-center">
          {quantity}
        </span>
        <button
          onClick={incrementQuantity}
          className="px-4 py-2 hover:bg-gray-100 transition-colors"
          disabled={quantity >= plant.stock}
        >
          +
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={plant.stock === 0}
        className={`flex-1 px-8 py-3 rounded-lg font-semibold transition-colors ${
          plant.stock > 0
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {plant.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
      </button>
    </div>
  );
}
