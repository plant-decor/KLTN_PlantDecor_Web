'use client';

import { useState, type MouseEvent } from 'react';
import { Button } from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import type { SamplePlant } from '@/data/sampledata';

interface AddToWishlistButtonProps {
  plant: SamplePlant;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
}

export default function AddToWishlistButton({
  plant,
  fullWidth = false,
  size = 'medium',
  variant = 'outlined',
  onClick,
  label,
}: AddToWishlistButtonProps) {
  const tWishlist = useTranslations('wishlist');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleToggleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    console.log(nextState ? 'Added to wishlist:' : 'Removed from wishlist:', plant.name);
  };

  return (
    <Button
      onClick={handleToggleWishlist}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      color={isWishlisted ? 'error' : 'inherit'}
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
