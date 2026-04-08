'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import CartEmptyState from '@/components/cart/CartEmptyState';
import WishlistPlantCard from '@/components/wishlist/WishlistPlantCard';
import {
  fetchWishlistItems,
  removeItemFromWishlist,
  type WishlistItemType,
  type WishlistListItem,
  type WishlistPagedPayload,
} from '@/lib/api/cartWishlistService';

interface WishlistPageClientProps {
  userid: string;
  initialPayload?: WishlistPagedPayload | null;
}

const buildWishlistKey = (itemType: WishlistItemType, itemId: number): string =>
  `${itemType}:${itemId}`;

export default function WishlistPageClient({ userid, initialPayload }: WishlistPageClientProps) {
  const tWishlist = useTranslations('wishlist');
  const tCommon = useTranslations('common');

  const [items, setItems] = useState<WishlistListItem[]>(initialPayload?.items ?? []);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(Math.max(1, initialPayload?.totalPages ?? 1));
  const [totalCount, setTotalCount] = useState(initialPayload?.totalCount ?? 0);
  const [isLoading, setIsLoading] = useState(!initialPayload);
  const [skipInitialClientLoad, setSkipInitialClientLoad] = useState(Boolean(initialPayload));
  const [isRemovingKey, setIsRemovingKey] = useState<string | null>(null);

  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const payload = await fetchWishlistItems({ pageNumber, pageSize });
      setItems(payload.items ?? []);
      setTotalCount(payload.totalCount ?? 0);
      setTotalPages(Math.max(1, payload.totalPages ?? 1));
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      setItems([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    if (skipInitialClientLoad) {
      setSkipInitialClientLoad(false);
      return;
    }
    void loadWishlist();
  }, [loadWishlist, skipInitialClientLoad, userid]);

  const handleRemoveFromWishlist = async (itemType: WishlistItemType, itemId: number) => {
    const targetKey = buildWishlistKey(itemType, itemId);

    try {
      setIsRemovingKey(targetKey);
      const nextItemsSnapshot = items.filter(
        (item) => !(item.itemType === itemType && item.itemId === itemId)
      );
      setItems(nextItemsSnapshot);

      await removeItemFromWishlist(itemType, itemId);
      setTotalCount((current) => Math.max(0, current - 1));

      if (nextItemsSnapshot.length === 0 && pageNumber > 1) {
        setPageNumber((current) => Math.max(1, current - 1));
      } else {
        await loadWishlist();
      }
    } catch (error) {
      console.error('Remove wishlist item error:', error);
      await loadWishlist();
    } finally {
      setIsRemovingKey(null);
    }
  };

  const handlePreviousPage = () => {
    setPageNumber((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    setPageNumber((current) => Math.min(totalPages, current + 1));
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

  if (totalCount === 0) {
    return <CartEmptyState type="wishlist" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        {tWishlist('title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
        {tWishlist('subtitle', { count: totalCount })}
      </Typography>

      {items.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ py: 6 }}>
          {tWishlist('noItemsOnPage', { page: pageNumber })}
        </Typography>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {items.map((item) => {
            const stockKey = buildWishlistKey(item.itemType, item.itemId);
            const isRemoving = isRemovingKey === stockKey;

            return (
              <WishlistPlantCard
                key={stockKey}
                item={item}
                isRemoving={isRemoving}
                onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            );
          })}
        </div>
      )}

      <Box
        sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Button variant="outlined" onClick={handlePreviousPage} disabled={pageNumber <= 1 || isLoading}>
          {tCommon('previous')}
        </Button>
        <Typography variant="body2" color="text.secondary">
          {tWishlist('pageIndicator', { current: pageNumber, total: Math.max(1, totalPages) })}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={pageNumber >= Math.max(1, totalPages) || isLoading}
        >
          {tCommon('next')}
        </Button>
      </Box>
    </Container>
  );
}
