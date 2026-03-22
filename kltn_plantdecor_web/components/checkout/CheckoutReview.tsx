'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Grid,
  Button,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import type { CheckoutData } from '@/types/cart.types';

interface CheckoutReviewProps {
  checkoutData: CheckoutData;
  userId: string;
  cartId: string;
}

export default function CheckoutReview({
  checkoutData,
  userId,
  cartId,
}: CheckoutReviewProps) {
  const paymentMethodLabel = getPaymentMethodLabel(
    checkoutData.paymentMethod || ''
  );

  return (
    <Grid container spacing={3}>
      {/* Left Side - Review Details */}
      <Grid size={{ xs: 12, md: 8 }}>
        {/* Shipping Details */}
        <Card sx={{ boxShadow: 1, mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Shipping Details
              </Typography>
              <Button
                size="small"
                startIcon={<EditIcon />}
                sx={{ textTransform: 'none', color: '#4CAF50' }}
              >
                Edit
              </Button>
            </Box>

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
                {checkoutData.shippingInfo.notes && (
                  <Typography variant="body2">
                    <strong>Notes:</strong> {checkoutData.shippingInfo.notes}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#999' }}>
                No shipping information provided
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card sx={{ boxShadow: 1, mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Payment Method
              </Typography>
              <Button
                size="small"
                startIcon={<EditIcon />}
                sx={{ textTransform: 'none', color: '#4CAF50' }}
              >
                Edit
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2">
              {paymentMethodLabel || 'Not selected'}
            </Typography>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card sx={{ boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Order Items
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Qty
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      Price
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checkoutData.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {item.plant.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{item.quantity}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {parseFloat(item.plant.basePrice).toLocaleString('vi-VN')}₫
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {(parseFloat(item.plant.basePrice) * item.quantity).toLocaleString(
                            'vi-VN'
                          )}
                          ₫
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Right Side - Order Summary */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Order Summary
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Items */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">
                Items ({checkoutData.items.length})
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {checkoutData.subtotal.toLocaleString('vi-VN')}₫
              </Typography>
            </Box>

            {/* Shipping */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">Shipping</Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: '#4CAF50' }}
              >
                Free
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: '#333',
                }}
              >
                Total
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: '#4CAF50',
                }}
              >
                {checkoutData.total.toLocaleString('vi-VN')}₫
              </Typography>
            </Box>

            {/* Order ID Info */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#666' }}>
                User ID: {userId}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                Cart ID: {cartId}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function getPaymentMethodLabel(method: string): string {
  const methods: Record<string, string> = {
    credit_debit: 'Credit / Debit Card',
    bank_transfer: 'Bank Transfer',
    cod: 'Cash on Delivery (COD)',
    ewallet: 'MoMo E-Wallet',
  };
  return methods[method] || 'Unknown';
}
