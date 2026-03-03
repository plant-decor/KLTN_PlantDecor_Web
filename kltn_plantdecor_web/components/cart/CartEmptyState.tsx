'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface CartEmptyStateProps {
  type?: 'cart' | 'wishlist';
}

export default function CartEmptyState({ type = 'cart' }: CartEmptyStateProps) {
  const tCart = useTranslations('cart');
  const tWishlist = useTranslations('wishlist');

  const title = type === 'wishlist' ? tWishlist('empty') : tCart('empty');

  return (
    <Container maxWidth="lg" sx={{ py: 20 }} className=''>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <ShoppingCartIcon sx={{ fontSize: 80, color: 'var(--primary)', mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 3 }}>
          {title}
        </Typography>
        <Button
          component={Link}
          href="/plant-store"
          variant="contained"
          sx={{
            backgroundColor: 'var(--primary)',
            '&:hover': { backgroundColor: '#45a049' },
            textTransform: 'none',
            fontSize: '1rem',
            px: 4,
            py: 1.5,
          }}
        >
          {tCart('continueShopping')}
        </Button>
      </Box>
    </Container>
  );
}
