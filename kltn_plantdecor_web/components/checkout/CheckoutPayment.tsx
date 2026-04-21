'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import type { CheckoutData } from '@/types/cart.types';
import type { OrderInvoice, OrderCreatePayload } from '@/types/order.types';
import { createPaymentUrl, getInvoicesByOrderId, createOrder } from '@/lib/api/orderService';
import { clearCartItems } from '@/lib/api/cartWishlistService';
import type { OrderCreateRequest } from '@/types/order.types';
import Image from 'next/image';

interface CheckoutPaymentProps {
  checkoutData: CheckoutData;
  onDataChange: (data: Partial<CheckoutData>) => void;
  orderId?: number;
  onPaymentCompleted: () => void;
}

const PAYMENT_METHODS = [
  {
    id: 'credit_debit',
    icon: <Image src="/logo/vnpay_icon.svg" alt="VNPay" width={100} height={100} />,
  },
];

export default function CheckoutPayment({
  checkoutData,
  onDataChange,
  orderId,
  onPaymentCompleted,
}: CheckoutPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState(
    checkoutData.paymentMethod || 'credit_debit'
  );
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [invoices, setInvoices] = useState<OrderInvoice[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | undefined>(orderId);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [shouldAutoPayAfterOrderCreation, setShouldAutoPayAfterOrderCreation] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInvoices() {
      if (!createdOrderId) {
        setIsLoadingInvoice(false);
        return;
      }

      setIsLoadingInvoice(true);
      setInvoiceError('');

      try {
        const response = await getInvoicesByOrderId(createdOrderId);
        if (!isMounted) return;

        if (response.length === 0) {
          setInvoiceError('No invoice found for this order. Please try again later.');
          setInvoices([]);
          setShouldAutoPayAfterOrderCreation(false);
          return;
        }

        setInvoices(response);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load invoice data.';
        setInvoiceError(message);
        setShouldAutoPayAfterOrderCreation(false);
      } finally {
        if (!isMounted) return;
        setIsLoadingInvoice(false);
      }
    }

    void loadInvoices();
    return () => {
      isMounted = false;
    };
  }, [createdOrderId]);

  const selectedInvoice = useMemo(() => {
    if (invoices.length === 0) return null;
    return (
      invoices.find((invoice) => invoice.statusName.toLowerCase() === 'pending') ??
      invoices[0]
    );
  }, [invoices]);

  // Auto-proceed to payment after invoices are loaded
  useEffect(() => {
    const proceedToPayment = async () => {
      if (!shouldAutoPayAfterOrderCreation || isLoadingInvoice || !selectedInvoice) {
        return;
      }

      try {
        setShouldAutoPayAfterOrderCreation(false);
        setIsSubmitting(true);
        setInvoiceError('');
        const paymentUrl = await createPaymentUrl(selectedInvoice.id);
        onPaymentCompleted();
        window.location.assign(paymentUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create payment URL.';
        setInvoiceError(message);
        setIsSubmitting(false);
      }
    };

    void proceedToPayment();
  }, [shouldAutoPayAfterOrderCreation, isLoadingInvoice, selectedInvoice, onPaymentCompleted]);

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newMethod = e.target.value;
    setSelectedMethod(newMethod);
    onDataChange({
      paymentMethod: newMethod,
    });
  };

  const handleCreateOrderAndPay = async () => {
    if (isCreatingOrder || isSubmitting) return;

    try {
      setIsCreatingOrder(true);
      setOrderError('');

      if (!checkoutData.shippingInfo) {
        setOrderError('Shipping information is missing.');
        return;
      }

      const { fullName, phone, address, notes } = checkoutData.shippingInfo;

      const basePayload = {
        address,
        phone,
        customerName: fullName,
        note: notes ?? '',
        paymentStrategy: checkoutData.orderType === 2 ? (checkoutData.paymentStrategy ?? 1) : 1,
      };

      let payload: OrderCreateRequest;
      if (checkoutData.orderType === 2) {
        payload = {
          ...basePayload,
          orderType: 2,
          plantInstanceId: checkoutData.plantInstanceId ?? 0,
        };
      } else if (checkoutData.orderType === 3) {
        payload = {
          ...basePayload,
          orderType: 3,
          buyNowItemId: checkoutData.buyNowItemId ?? checkoutData.items[0]?.id ?? 0,
          buyNowItemType: (checkoutData.buyNowItemType ?? 1) as 1 | 2 | 3,
          buyNowQuantity: checkoutData.buyNowQuantity ?? checkoutData.items[0]?.quantity ?? 1,
        };
      } else {
        payload = {
          ...basePayload,
          orderType: 1,
          cartItemIds: checkoutData.items.map((item) => item.id),
        };
      }

      // Create order
      const created: OrderCreatePayload = await createOrder(payload);
      setCreatedOrderId(created.id);

      // Clear cart after successful order creation
      try {
        await clearCartItems();
      } catch (cartErr) {
        console.warn('Failed to clear cart:', cartErr);
        // Don't block payment if cart clear fails
      }

      // Set flag to auto-proceed to payment once invoices are loaded
      setShouldAutoPayAfterOrderCreation(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create order.';
      setOrderError(errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // const handleCreatePayment = async (orderIdToUse: number) => {
  //   if (!selectedInvoice && !isLoadingInvoice) {
  //     setInvoiceError('Invoice is unavailable for payment.');
  //     return;
  //   }

  //   // If we're still loading invoices, wait for the selectedInvoice to be available
  //   if (isLoadingInvoice) {
  //     // This function will be called again once invoices are loaded
  //     return;
  //   }

  //   if (!selectedInvoice) {
  //     setInvoiceError('Invoice is unavailable for payment.');
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);
  //     setInvoiceError('');
  //     const paymentUrl = await createPaymentUrl(selectedInvoice.id);
  //     onPaymentCompleted();
  //     window.location.assign(paymentUrl);
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : 'Failed to create payment URL.';
  //     setInvoiceError(message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
    <Card sx={{ boxShadow: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Payment Method
        </Typography>

        <RadioGroup value={selectedMethod} onChange={handlePaymentMethodChange}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {PAYMENT_METHODS.map((method) => (
              <Box key={method.id}>
                <FormControlLabel
                  value={method.id}
                  control={<Radio />}
                  label={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        ml: 1,
                      }}
                    >
                      {method.icon}
                      {/* <Typography variant="body1">{method.label}</Typography> */}
                    </Box>
                  }
                  sx={{
                    border: '1px solid',
                    borderColor:
                      selectedMethod === method.id ? '#4CAF50' : '#ddd',
                    borderRadius: 1,
                    p: 2,
                    width: '100%',
                    m: 0,
                    backgroundColor:
                      selectedMethod === method.id ? '#f1f8f4' : 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#4CAF50',
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </RadioGroup>

        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Selected Payment Method
          </Typography>
          <Typography variant="body2">
            {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.icon}
          </Typography>
        </Box>

        {orderError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {orderError}
          </Alert>
        )}

        {invoiceError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {invoiceError}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={() => void handleCreateOrderAndPay()}
          disabled={isLoadingInvoice || isSubmitting || isCreatingOrder}
          sx={{ mt: 3, backgroundColor: 'var(--primary)', fontWeight: 'bold', fontSize: '16px', '&:hover': { backgroundColor: '#45a049' } }}
        >
          {isCreatingOrder ? 'Creating order...' : isSubmitting ? 'Creating payment...' : `Thanh toán thông qua VNPay`}
        </Button>
      </CardContent>
    </Card>
  );
}
