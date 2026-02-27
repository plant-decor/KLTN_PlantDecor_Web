'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';

export default function CartEmptyState() {
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
          Your cart is empty
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
          Browse Catalog
        </Button>
      </Box>
    </Container>
  );
}
