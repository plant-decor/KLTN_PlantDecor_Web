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
  Divider,
  Grid,
  Button,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import type { CheckoutData } from '@/types/cart.types';
import type { OrderCreatePayload } from '@/types/order.types';

interface CheckoutReviewProps {
  checkoutData: CheckoutData;
  userId: string;
  cartId: string;
  createdOrder?: OrderCreatePayload | null;
}

export default function CheckoutReview({
  checkoutData,
  userId,
  cartId,
  createdOrder,
}: CheckoutReviewProps) {
  const paymentMethodLabel = getPaymentMethodLabel(
    checkoutData.paymentMethod || ''
  );

  const reviewItems =
    createdOrder?.items?.map((item) => ({
      id: item.id,
      name: item.itemName,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.quantity * item.price,
    })) ??
    checkoutData.items.map((item) => ({
      id: item.id,
      name: item.productName,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.quantity * item.price,
    }));

  const reviewTotal =
    createdOrder?.totalAmount ??
    checkoutData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
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
                  {reviewItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2">{item.name}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{item.quantity}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {item.price.toLocaleString('vi-VN')} VND
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {item.lineTotal.toLocaleString('vi-VN')} VND
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

      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Order Summary
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">Items ({reviewItems.length})</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {reviewTotal.toLocaleString('vi-VN')} VND
              </Typography>
            </Box>

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
                {reviewTotal.toLocaleString('vi-VN')} VND
              </Typography>
            </Box>

            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#666' }}>
                User ID: {userId}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                Cart ID: {cartId}
              </Typography>
              {createdOrder && (
                <>
                  <Typography variant="caption" sx={{ display: 'block', color: '#666', mt: 1 }}>
                    Order ID: {createdOrder.id}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                    Status: {createdOrder.statusName}
                  </Typography>
                </>
              )}
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
