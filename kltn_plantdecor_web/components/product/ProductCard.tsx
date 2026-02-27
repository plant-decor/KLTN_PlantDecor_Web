  'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star as StarIcon } from '@mui/icons-material';
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
            <StarIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
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
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 hover:font-semibold transition-colors"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </Link>
  );
}
