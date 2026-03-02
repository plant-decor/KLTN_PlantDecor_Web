'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Box, Container, CircularProgress, Grid, Typography } from '@mui/material';
import type { CartItem } from '@/types/cart.types';
import { useAuthStore } from '@/store/authStore';
import { ACTIVE_SAMPLE_USER_ID } from '@/data/sampledata';
import CartEmptyState from './CartEmptyState';
import CartTable from './CartTable';
import OrderSummary from './OrderSummary';
import DeleteItemDialog from './DeleteItemDialog';
import ClearCartDialog from './ClearCartDialog';

interface CartPageClientProps {
  userid: string;
}

export default function CartPageClient({ userid }: CartPageClientProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const { user } = useAuthStore();

  // Use auth user if available, otherwise use sample user
  const userId = user?.id?.toString() || String(ACTIVE_SAMPLE_USER_ID);

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await fetch(`/api/cart/get?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        setCartItems(data.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load cart';
        setError(errorMessage);
        console.error('Fetch cart error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  const handleQuantityChange = async (plantId: number, newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      setIsUpdating(true);
      setError('');
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          plantId,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      const data = await response.json();
      setCartItems(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity';
      setError(errorMessage);
      console.error('Update quantity error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveClick = (plantId: number) => {
    setDeleteItemId(plantId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteItemId === null) return;

    try {
      setIsUpdating(true);
      setError('');
      const response = await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          plantId: deleteItemId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      const data = await response.json();
      setCartItems(data.data || []);
      setDeleteDialogOpen(false);
      setDeleteItemId(null);
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
      const response = await fetch('/api/cart/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      const data = await response.json();
      setCartItems(data.data || []);
      setClearDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      console.error('Clear cart error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const isEmptyCart = cartItems.length === 0;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 20 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isEmptyCart) {
    return <CartEmptyState />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error Alert */}
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
        {/* Main Cart Table */}
        <Grid size={{ xs: 12, md: 8 }}>
          <CartTable
            items={cartItems}
            isUpdating={isUpdating}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveClick}
            onClearCart={handleClearCartClick}
          />
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <OrderSummary items={cartItems} isUpdating={isUpdating} userId={userId} />
        </Grid>
      </Grid>

      {/* Dialogs */}
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
