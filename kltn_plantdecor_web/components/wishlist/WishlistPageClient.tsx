'use client';

import { useMemo, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { SAMPLE_PLANTS, type SamplePlant } from '@/data/sampledata';
import ProductCard from '@/components/product/ProductCard';
import CartEmptyState from '@/components/cart/CartEmptyState';
import { useTranslations } from 'next-intl';

interface WishlistPageClientProps {
  userid: string;
}

export default function WishlistPageClient({ userid }: WishlistPageClientProps) {
  const tWishlist = useTranslations('wishlist');

  const initialMockItems = useMemo<SamplePlant[]>(() => {
    if (userid === 'empty') {
      return [];
    }
    return SAMPLE_PLANTS.slice(0, 6);
  }, [userid]);

  const [wishlistItems, setWishlistItems] = useState<SamplePlant[]>(initialMockItems);

  const handleRemoveFromWishlist = (plantId: number) => {
    setWishlistItems((currentItems) =>
      currentItems.filter((plant) => plant.id !== plantId),
    );
  };

  if (wishlistItems.length === 0) {
    return <CartEmptyState type="wishlist" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        {tWishlist('title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        {tWishlist('subtitle', { count: wishlistItems.length })}
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {wishlistItems.map((plant) => (
          <ProductCard
            key={plant.id}
            plant={plant}
            showAddToWishlistButton={false}
            showAddToCartButton
            showRemoveFromWishlistButton
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        ))}
      </div>
    </Container>
  );
}
