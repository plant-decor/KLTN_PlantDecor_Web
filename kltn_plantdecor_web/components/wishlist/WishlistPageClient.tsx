'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import ProductCard from '@/components/product/ProductCard';
import CartEmptyState from '@/components/cart/CartEmptyState';
import { useTranslations } from 'next-intl';
import {
  checkWishlistPlantInStock,
  fetchWishlistItems,
  type WishlistApiItem,
} from '@/lib/api/cartWishlistService';
import { ShopPlantListItem } from '@/lib/api/shopPlantsService';

interface WishlistPageClientProps {
  userid: string;
}


export default function WishlistPageClient({ userid }: WishlistPageClientProps) {
  const tWishlist = useTranslations('wishlist');
  const [wishlistItems, setWishlistItems] = useState<ShopPlantListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toShopPlantListItem = (item: WishlistApiItem): ShopPlantListItem => ({
    id: item.plantId,
    name: item.name,
    basePrice: item.price,
    size: item.size,
    careLevel: item.careLevel,
    isActive: true,
    primaryImageUrl: item.imageUrl,
    totalInstances: item.stock,
    availableInstances: item.stock,
    availableCommonQuantity: item.stock,
    totalAvailableStock: item.stock,
    categoryNames: [],
    tagNames: [],
  });

  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await fetchWishlistItems();
      const stockChecks = await Promise.allSettled(
        items.map((item) => checkWishlistPlantInStock(item.plantId))
      );
      const checkedItems = items.map((item, index) => {
        const checkResult = stockChecks[index];
        const isInStock = checkResult?.status === 'fulfilled' ? checkResult.value : true;

        return {
          ...item,
          stock: isInStock ? Math.max(1, item.stock) : 0,
        };
      });
      console.log('Checked wishlist items:', checkedItems);
      setWishlistItems(checkedItems.map(toShopPlantListItem));
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist, userid]);

  const handleRemoveFromWishlist = (plantId: number) => {
    setWishlistItems((currentItems) => currentItems.filter((plant) => plant.id !== plantId));
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 20 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

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
