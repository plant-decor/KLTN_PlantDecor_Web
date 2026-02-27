'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import type { CheckoutData } from '@/types/cart.types';

interface CheckoutCompleteProps {
  checkoutData: CheckoutData;
  userId: string;
}

export default function CheckoutComplete({
  checkoutData,
  userId,
}: CheckoutCompleteProps) {
  const orderId = `ORD-${Date.now()}`;

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid size={{ xs: 12, md: 8 }}>
        {/* Success Alert */}
        <Alert
          icon={<CheckCircleIcon sx={{ fontSize: 40, color: '#4CAF50' }} />}
          sx={{
            backgroundColor: '#f1f8f4',
            border: '1px solid #4CAF50',
            mb: 3,
            py: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
            Order Placed Successfully!
          </Typography>
        </Alert>

        {/* Order Details Card */}
        <Card sx={{ boxShadow: 1, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Order Confirmation
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Order ID
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {orderId}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#666' }}>
                You will receive an email confirmation shortly.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card sx={{ boxShadow: 1, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Shipping Details
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {checkoutData.shippingInfo ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {checkoutData.shippingInfo.fullName}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {checkoutData.shippingInfo.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {checkoutData.shippingInfo.address}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#999' }}>
                No shipping information provided
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card sx={{ boxShadow: 1, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Order Summary
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">
                {checkoutData.subtotal.toLocaleString('vi-VN')}₫
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">Shipping</Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                Free
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: '#4CAF50' }}
              >
                {checkoutData.total.toLocaleString('vi-VN')}₫
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            component={Link}
            href={`/orders/${userId}`}
            startIcon={<HomeIcon />}
            sx={{
              backgroundColor: '#4CAF50',
              textTransform: 'none',
              fontSize: '1rem',
              py: 1.5,
              '&:hover': {
                backgroundColor: '#45a049',
              },
            }}
          >
            Go to Orders History
          </Button>

          <Button
            fullWidth
            variant="outlined"
            component={Link}
            href="/plant-store"
            startIcon={<ShoppingCartIcon />}
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
        </Box>
      </Grid>
    </Grid>
  );
}
