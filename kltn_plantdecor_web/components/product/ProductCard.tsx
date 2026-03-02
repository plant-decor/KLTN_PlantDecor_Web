  'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent } from 'react';
  import { Button } from '@mui/material';
import { DeleteOutline as DeleteOutlineIcon, Star as StarIcon } from '@mui/icons-material';
  import { useLocale, useTranslations } from 'next-intl';
import type { SamplePlant } from '@/data/sampledata';
  import AddToWishlistButton from './AddToWishlistButton';

interface ProductCardProps {
  plant: SamplePlant;
  showAddToWishlistButton?: boolean;
  showAddToCartButton?: boolean;
  showRemoveFromWishlistButton?: boolean;
  onRemoveFromWishlist?: (plantId: number) => void;
}

export default function ProductCard({
  plant,
  showAddToWishlistButton = true,
  showAddToCartButton = true,
  showRemoveFromWishlistButton = false,
  onRemoveFromWishlist,
}: ProductCardProps) {
  const locale = useLocale();
  const tProducts = useTranslations('products');
  const tWishlist = useTranslations('wishlist');

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // TODO: Add to cart functionality
    console.log('Adding to cart:', plant.name);
  };

  const handleRemoveFromWishlist = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onRemoveFromWishlist?.(plant.id);
  };

  const priceLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

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
            {tProducts('new')}
          </span>
        )}
        {plant.originalPrice && (
          <span className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 text-xs rounded">
            {tProducts('sale')}
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
        <div className="mb-4">
          {plant.originalPrice ? (
            <div className="flex flex-col">
              <span className="text-gray-400 line-through text-sm">
                {plant.originalPrice.toLocaleString(priceLocale)}đ
              </span>
              <span className="text-green-600 font-bold text-lg">
                {plant.price.toLocaleString(priceLocale)}đ
              </span>
            </div>
          ) : (
            <span className="text-green-600 font-bold text-lg">
              {plant.price.toLocaleString(priceLocale)}đ
            </span>
          )}
        </div>

        <div className="flex items-stretch gap-2">
          {showAddToWishlistButton && (
            <div className="flex-1">
              <AddToWishlistButton
                plant={plant}
                label={tWishlist('addToWishlistCompact')}
                fullWidth
                size="medium"
                onClick={(event) => {
                  event.preventDefault();
                }}
              />
            </div>
          )}
          {showRemoveFromWishlistButton && (
            <div className="flex-1">
              <Button
                onClick={handleRemoveFromWishlist}
                variant="outlined"
                size="medium"
                fullWidth
                color="error"
                startIcon={<DeleteOutlineIcon fontSize="small" />}
                sx={{
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  minHeight: 44,
                  px: 1.5,
                  fontSize: '0.95rem',
                  lineHeight: 1.2,
                }}
              >
                {tWishlist('removeItem')}
              </Button>
            </div>
          )}
          {showAddToCartButton && (
            <div className="flex-1">
              <Button
                onClick={handleAddToCart}
                variant="contained"
                size="medium"
                fullWidth
                sx={{
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  minHeight: 44,
                  px: 1.5,
                  fontSize: '0.95rem',
                  lineHeight: 1.2,
                  bgcolor: 'var(--primary)',
                  '&:hover': { bgcolor: '#45a049' },
                }}
              >
                {tProducts('addToCartCompact')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
