'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import type { CartItem } from '@/types/cart.types';
// import { useCartStore } from '@/lib/store/cartStore';
import { ACTIVE_SAMPLE_USER_ID } from '@/data/sampledata';
import { useLocale } from 'next-intl';

interface OrderSummaryProps {
  items: CartItem[];
  isUpdating: boolean;
  userId?: string;
}

export default function OrderSummary({ items, isUpdating, userId }: OrderSummaryProps) {
  const locale = useLocale();
  const router = useRouter();
  // const { setCheckoutData } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  // const shippingFee = 0; // Free shipping
  // + shippingFee;
  const total = subtotal;


  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    const nextCartId = items[0]?.cartId?.toString() ?? '0';
    const resolvedUserId = userId ?? ACTIVE_SAMPLE_USER_ID.toString();
    router.push(`/${locale}/checkout/${resolvedUserId}/${nextCartId}`);
  };

  return (
    <Card sx={{ boxShadow: 1, position: 'sticky', top: 20 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            color: '#333',
          }}
        >
          Order Summary
        </Typography>

        {/* Items Count */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
            pb: 2,
            borderBottom: '1px solid #eee',
          }}
        >
          <Typography sx={{ color: '#666' }}>Items ({itemCount})</Typography>
          <Typography sx={{ fontWeight: 500 }}>
            {subtotal.toLocaleString('vi-VN')}₫
          </Typography>
        </Box>

        {/* Shipping */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 3,
            pb: 3,
            borderBottom: '1px solid #eee',
          }}
        >
          <Typography sx={{ color: '#666' }}>Shipping</Typography>
          <Typography sx={{ fontWeight: 500, color: '#4CAF50' }}>Free</Typography>
        </Box>

        {/* Total */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 3,
            pb: 3,
            borderBottom: '2px solid #eee',
          }}
        >
          <Typography
            sx={{
              fontWeight: 'bold',
              fontSize: '1.05rem',
              color: '#333',
            }}
          >
            Total
          </Typography>
          <Typography
            sx={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#4CAF50',
            }}
          >
            {total.toLocaleString('vi-VN')}₫
          </Typography>
        </Box>

        {/* Proceed to Checkout */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleProceedToCheckout}
          disabled={isUpdating || items.length === 0}
          sx={{
            backgroundColor: '#4CAF50',
            textTransform: 'none',
            fontSize: '1rem',
            py: 1.5,
            fontWeight: 600,
            mb: 2,
            '&:hover': {
              backgroundColor: '#45a049',
            },
          }}
        >
          Proceed to Checkout
        </Button>

        {/* Continue Shopping */}
        <Button
          fullWidth
          variant="outlined"
          component={Link}
          href="/plant-store"
          sx={{
            textTransform: 'none',
            fontSize: '1rem',
            py: 1.5,
            borderColor: '#ddd',
            color: '#333',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f9f9f9',
            },
          }}
        >
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  );
}
