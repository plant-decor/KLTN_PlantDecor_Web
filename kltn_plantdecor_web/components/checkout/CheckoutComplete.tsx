'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
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
import { useLocale, useTranslations } from 'next-intl';
import type { CheckoutData } from '@/types/cart.types';

interface CheckoutCompleteProps {
  checkoutData: CheckoutData;
  userId: string;
  orderId?: string | number | null;
}

export default function CheckoutComplete({
  checkoutData,
  userId,
  orderId,
}: CheckoutCompleteProps) {
  const locale = useLocale();
  const router = useRouter();
  const tCheckout = useTranslations('checkout');
  const displayOrderId = orderId ?? tCheckout('completeDetails.notAvailable');

  useEffect(() => {
    // Auto-redirect to orders page after 3 seconds
    const timer = setTimeout(() => {
      router.push(`/${locale}/orders`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [locale, router]);

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
            {tCheckout('orderSuccess')}
          </Typography>
        </Alert>

        {/* Order Details Card */}
        <Card sx={{ boxShadow: 1, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {tCheckout('completeDetails.orderConfirmation')}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {tCheckout('completeDetails.orderId')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {displayOrderId}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#666' }}>
                {tCheckout('completeDetails.emailConfirmation')}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card sx={{ boxShadow: 1, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {tCheckout('completeDetails.shippingDetails')}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {checkoutData.shippingInfo ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>{tCheckout('fullName')}:</strong> {checkoutData.shippingInfo.fullName}
                </Typography>
                <Typography variant="body2">
                  <strong>{tCheckout('phone')}:</strong> {checkoutData.shippingInfo.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>{tCheckout('address')}:</strong> {checkoutData.shippingInfo.address}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#999' }}>
                {tCheckout('completeDetails.noShippingInfo')}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card sx={{ boxShadow: 1, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {tCheckout('orderSummary')}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{tCheckout('completeDetails.subtotal')}</Typography>
              <Typography variant="body2">
                {new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(checkoutData.subtotal)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">{tCheckout('completeDetails.shipping')}</Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                {tCheckout('completeDetails.free')}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {tCheckout('completeDetails.total')}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: '#4CAF50' }}
              >
                {new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(checkoutData.total)}
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
            {tCheckout('completeDetails.goToOrdersHistory')}
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
            {tCheckout('completeDetails.continueShopping')}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
