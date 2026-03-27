'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  LocalAtm as CashIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import type { CheckoutData } from '@/types/cart.types';
import type { OrderInvoice } from '@/types/order.types';
import { createPaymentUrl, getInvoicesByOrderId } from '@/lib/api/orderService';

interface CheckoutPaymentProps {
  checkoutData: CheckoutData;
  onDataChange: (data: Partial<CheckoutData>) => void;
  orderId: number;
  onPaymentCompleted: () => void;
}

const PAYMENT_METHODS = [
  {
    id: 'credit_debit',
    label: 'Credit / Debit Card',
    icon: <CreditCardIcon />,
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    icon: <BankIcon />,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery (COD)',
    icon: <CashIcon />,
  },
  {
    id: 'ewallet',
    label: 'MoMo E-Wallet',
    icon: <WalletIcon />,
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
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(true);
  const [invoiceError, setInvoiceError] = useState('');
  const [invoices, setInvoices] = useState<OrderInvoice[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInvoices() {
      setIsLoadingInvoice(true);
      setInvoiceError('');

      try {
        const response = await getInvoicesByOrderId(orderId);
        if (!isMounted) return;

        if (response.length === 0) {
          setInvoiceError('No invoice found for this order. Please try again later.');
          setInvoices([]);
          return;
        }

        setInvoices(response);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load invoice data.';
        setInvoiceError(message);
      } finally {
        if (!isMounted) return;
        setIsLoadingInvoice(false);
      }
    }

    void loadInvoices();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const selectedInvoice = useMemo(() => {
    if (invoices.length === 0) return null;
    return (
      invoices.find((invoice) => invoice.statusName.toLowerCase() === 'pending') ??
      invoices[0]
    );
  }, [invoices]);

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newMethod = e.target.value;
    setSelectedMethod(newMethod);
    onDataChange({
      paymentMethod: newMethod,
    });
  };

  const handleCreatePayment = async () => {
    if (!selectedInvoice) {
      setInvoiceError('Invoice is unavailable for payment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setInvoiceError('');
      const paymentUrl = await createPaymentUrl(selectedInvoice.id);
      onPaymentCompleted();
      window.location.assign(paymentUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create payment URL.';
      setInvoiceError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                      <Typography variant="body1">{method.label}</Typography>
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
            {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}
          </Typography>
        </Box>

        <Box sx={{ mt: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Invoice Summary
          </Typography>

          {isLoadingInvoice && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">Loading invoice...</Typography>
            </Box>
          )}

          {!isLoadingInvoice && selectedInvoice && (
            <Box>
              <Typography variant="body2">Invoice ID: {selectedInvoice.id}</Typography>
              <Typography variant="body2">Order ID: {selectedInvoice.orderId}</Typography>
              <Typography variant="body2">Status: {selectedInvoice.statusName}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                Total: {selectedInvoice.totalAmount.toLocaleString('vi-VN')} VND
              </Typography>
            </Box>
          )}

          {!isLoadingInvoice && !selectedInvoice && !invoiceError && (
            <Typography variant="body2">No invoice available.</Typography>
          )}
        </Box>

        {invoiceError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {invoiceError}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={() => void handleCreatePayment()}
          disabled={isLoadingInvoice || isSubmitting || !selectedInvoice}
          sx={{ mt: 3, backgroundColor: '#4CAF50' }}
        >
          {isSubmitting ? 'Creating payment...' : 'Pay with VNPay'}
        </Button>
      </CardContent>
    </Card>
  );
}
