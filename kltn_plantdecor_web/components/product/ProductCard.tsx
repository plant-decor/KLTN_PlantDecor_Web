'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import { Button } from '@mui/material';
import { DeleteOutline as DeleteOutlineIcon, Star as StarIcon } from '@mui/icons-material';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { addPlantToCart, removePlantFromWishlist } from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import AddToWishlistButton from './AddToWishlistButton';
import { ShopPlantListItem } from '@/lib/api/shopPlantsService';

interface ProductCardProps {
  plant: ShopPlantListItem;
  showAddToWishlistButton?: boolean;
  showAddToCartButton?: boolean;
  showRemoveFromWishlistButton?: boolean;
  onRemoveFromWishlist?: (plantId: number) => void;
}

export default function ProductCard({
  plant,
  showAddToWishlistButton = true,
  showAddToCartButton = plant.availableInstances <= 0 ? true : false, 
  showRemoveFromWishlistButton = false,
  onRemoveFromWishlist,
}: ProductCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const tProducts = useTranslations('products');
  const tWishlist = useTranslations('wishlist');
  const { user } = useAuthStore();
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isWishlistRemoving, setIsWishlistRemoving] = useState(false);

  const handleAddToCart = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      setIsCartLoading(true);
      await addPlantToCart(plant.id, 1);
      notifyCartUpdated();
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleCreateOrder = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleRemoveFromWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      setIsWishlistRemoving(true);
      await removePlantFromWishlist(plant.id);
      onRemoveFromWishlist?.(plant.id);
    } catch (error) {
      console.error('Remove from wishlist error:', error);
    } finally {
      setIsWishlistRemoving(false);
    }
  };

  const isActionDisabled = isCartLoading || isWishlistRemoving;
  const isOutOfStock = plant.availableCommonQuantity <= 0 && plant.availableInstances <= 0 && plant.totalAvailableStock <= 0;
  const numberLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <Link
      href={`/products/${plant.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative w-full h-48">
        <Image
          src={plant.primaryImageUrl || '/img/background-login.jpg'}
          alt={plant.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        {plant.tagNames.some(tag => tag.tagName.includes('new')) && (
          <span className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 text-xs rounded">
            {tProducts('new')}
          </span>
        )}
        {plant.basePrice && (
          <span className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 text-xs rounded">
            {tProducts('sale')}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{plant.name}</h3>
       <p className="text-gray-600 text-sm mb-4 line-clamp-2">
  {[
    `Care level: ${plant.careLevel || 'N/A'}`,
    `Size: ${plant.size || 'N/A'}`,
    plant.categoryNames?.length > 0 ? `Categories: ${plant.categoryNames.map(c => c.name).join(', ')}` : ''
  ].filter(Boolean).join(' • ')}
</p>

        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <StarIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
            <span className="ml-1 text-sm text-gray-600">
              {/* {plant.rating} ({plant.reviewCount}) */}
              4.5 (120)
            </span>
          </div>
        </div>

        <div className="mb-4">
          {plant.basePrice ? (
            <div className="flex flex-col">
              <span className="text-gray-400 line-through text-sm">
                {plant.basePrice.toLocaleString()} VND
              </span>
              <span className="text-green-600 font-bold text-lg">{plant.basePrice.toLocaleString()} VND</span>
            </div>
          ) : (
            <span className="text-green-600 font-bold text-lg">
              {/* {plant.basePrice?.toLocaleString(numberLocale)}  */}
              Liên hệ 
              {/* VND */}
              </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch sm:gap-2">
          {showAddToWishlistButton && (
            <div className="sm:flex-1">
              <AddToWishlistButton
                plant={plant}
                label={tWishlist('addToWishlistCompact')}
                fullWidth
                size="medium"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              />
            </div>
          )}

          {showRemoveFromWishlistButton && (
            <div className="sm:flex-1">
              <Button
                onClick={handleRemoveFromWishlist}
                variant="outlined"
                size="medium"
                fullWidth
                color="error"
                disabled={isActionDisabled}
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

          {showAddToCartButton ? (
            <div className="sm:flex-1">
              <Button
                onClick={handleAddToCart}
                variant="contained"
                size="medium"
                fullWidth
                disabled={isActionDisabled || isOutOfStock}
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
                {isOutOfStock ? tProducts('outOfStock') : tProducts('addToCartCompact')}
              </Button>
            </div>
          ): (
            <div className="sm:flex-1">
              <Button
                onClick={handleCreateOrder}
                variant="contained"
                size="medium"
                fullWidth
                disabled={isActionDisabled}
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
                {tProducts('createOrder')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
