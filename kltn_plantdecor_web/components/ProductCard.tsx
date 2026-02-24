'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { SamplePlant } from '@/data/sampledata';

interface ProductCardProps {
  plant: SamplePlant;
}

export default function ProductCard({ plant }: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Add to cart functionality
    console.log('Adding to cart:', plant.name);
  };

  return (
    <Link
      href={`/products/${plant.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative w-full h-48">
        <Image
          src={plant.imageUrl}
          alt={plant.name}
          fill
          className="object-cover"
        />
        {plant.isNewArrival && (
          <span className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 text-xs rounded">
            New
          </span>
        )}
        {plant.originalPrice && (
          <span className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 text-xs rounded">
            Sale
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{plant.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {plant.description}
        </p>
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm text-gray-600">
              {plant.rating} ({plant.reviewCount})
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          {plant.originalPrice ? (
            <div className="flex flex-col">
              <span className="text-gray-400 line-through text-sm">
                {plant.originalPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-green-600 font-bold text-lg">
                {plant.price.toLocaleString('vi-VN')}đ
              </span>
            </div>
          ) : (
            <span className="text-green-600 font-bold text-lg">
              {plant.price.toLocaleString('vi-VN')}đ
            </span>
          )}
          <button
            onClick={handleAddToCart}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </Link>
  );
}
