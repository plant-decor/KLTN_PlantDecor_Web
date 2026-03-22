'use client';

import { useState, type MouseEvent } from 'react';
import { Button } from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { Plant } from '@/data/sampledata';
import { useAuthStore } from '@/lib/store/authStore';
import {
  addPlantToWishlist,
  removePlantFromWishlist,
} from '@/lib/api/cartWishlistService';

interface AddToWishlistButtonProps {
  plant: Plant;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  onChange?: (isWishlisted: boolean) => void;
}

export default function AddToWishlistButton({
  plant,
  fullWidth = false,
  size = 'medium',
  variant = 'outlined',
  onClick,
  label,
  onChange,
}: AddToWishlistButtonProps) {
  const tWishlist = useTranslations('wishlist');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    event.preventDefault();
    event.stopPropagation();

    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      setIsLoading(true);
      const nextState = !isWishlisted;

      if (nextState) {
        await addPlantToWishlist(plant.id);
      } else {
        await removePlantFromWishlist(plant.id);
      }

      setIsWishlisted(nextState);
      onChange?.(nextState);
    } catch (error) {
      console.error('Toggle wishlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleWishlist}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      color={isWishlisted ? 'error' : 'inherit'}
      disabled={isLoading}
      sx={{
        textTransform: 'none',
        whiteSpace: 'nowrap',
        minHeight: 44,
        px: 1.5,
        fontSize: '0.95rem',
        lineHeight: 1.2,
        '& .MuiButton-startIcon': {
          marginRight: 0.75,
          marginLeft: 0,
        },
      }}
    >
      {label ?? tWishlist('addToWishlist')}
    </Button>
  );
}
