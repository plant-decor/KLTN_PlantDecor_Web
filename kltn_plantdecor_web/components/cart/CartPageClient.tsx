'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
import type { CartItem } from '@/types/cart.types';
import CartEmptyState from './CartEmptyState';
import CartTable from './CartTable';
import OrderSummary from './OrderSummary';
import DeleteItemDialog from './DeleteItemDialog';
import ClearCartDialog from './ClearCartDialog';
import {
  clearCartItems,
  deleteCartItem,
  fetchCartItems,
  updateCartItemQuantity,
  type CartApiItem,
} from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';

interface CartPageClientProps {
  userid: string;
}

// const toSamplePlant = (item: CartApiItem): Plant => ({
//   id: item.id,
//   productName: item.productName,
//   basePrice: item.price,
//   size: 'medium',
//   careLevel: 'easy',
//   isActive: true,
//   primaryImageUrl: item.imageUrl || null,
//   totalInstances: 999,
//   availableInstances: 999,
//   availableCommonQuantity: 999,
//   totalAvailableStock: 999,
//   categoryNames: [],
//   tagNames: [],
// });

const toCartItem = (item: CartApiItem): CartItem => ({
  id: item.id,
  cartId: item.cartId,
  commonPlantId: item.commonPlantId,
  quantity: item.quantity,
  productName: item.productName,
  price: item.price,
  imageUrl: item.imageUrl,
  subtotal: item.price * item.quantity,
});

export default function CartPageClient({ userid }: CartPageClientProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const items = await fetchCartItems();
      console.log('Fetched cart items:', items);
      if (items.payload) {
        setCartItems(items.payload.items.map(toCartItem));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cart';
      setError(errorMessage);
      console.error('Fetch cart error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart, userid]);

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      setIsUpdating(true);
      setError('');
      await updateCartItemQuantity(cartItemId, newQuantity);
      await loadCart();
      notifyCartUpdated();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity';
      setError(errorMessage);
      console.error('Update quantity error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveClick = (cartItemId: number) => {
    setDeleteItemId(cartItemId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteItemId === null) {
      return;
    }

    try {
      setIsUpdating(true);
      setError('');
      await deleteCartItem(deleteItemId);
      setDeleteDialogOpen(false);
      setDeleteItemId(null);
      await loadCart();
      notifyCartUpdated();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
      setError(errorMessage);
      console.error('Remove item error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCartClick = () => {
    setClearDialogOpen(true);
  };

  const handleConfirmClearCart = async () => {
    try {
      setIsUpdating(true);
      setError('');
      await clearCartItems();
      setClearDialogOpen(false);
      await loadCart();
      notifyCartUpdated();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      console.error('Clear cart error:', err);
    } finally {
      setIsUpdating(false);
    }
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

  if (cartItems.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 'bold',
          mb: 4,
        }}
      >
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CartTable
            items={cartItems}
            isUpdating={isUpdating}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveClick}
            onClearCart={handleClearCartClick}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <OrderSummary items={cartItems} isUpdating={isUpdating} userId={userid} />
        </Grid>
      </Grid>

      <DeleteItemDialog
        open={deleteDialogOpen}
        isUpdating={isUpdating}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <ClearCartDialog
        open={clearDialogOpen}
        isUpdating={isUpdating}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleConfirmClearCart}
      />
    </Container>
  );
}
