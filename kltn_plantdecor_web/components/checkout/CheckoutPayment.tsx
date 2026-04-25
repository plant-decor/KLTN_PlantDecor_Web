'use client';

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import type { CheckoutData } from '@/types/cart.types';
import type { OrderInvoice, OrderCreatePayload } from '@/types/order.types';
import { createPaymentUrl } from '@/lib/api/orderService';
import Image from 'next/image';

interface CheckoutPaymentProps {
  checkoutData: CheckoutData;
  onDataChange: (data: Partial<CheckoutData>) => void;
  createdOrder: OrderCreatePayload;
  invoices: OrderInvoice[];
}

const PAYMENT_METHODS = [
  {
    id: 'credit_debit',
    icon: <Image src="/logo/vnpay_icon.svg" alt="VNPay" width={100} height={100} />,
  },
] as const;

const DEFAULT_PAYMENT_METHOD_ID = PAYMENT_METHODS[0]!.id;

function selectPayableInvoice(invoices: OrderInvoice[]): OrderInvoice | null {
  if (invoices.length === 0) return null;
  return (
    invoices.find((inv) => inv.statusName.toLowerCase() === 'pending') ?? invoices[0] ?? null
  );
}

export default function CheckoutPayment({
  checkoutData,
  onDataChange,
  createdOrder,
  invoices,
}: CheckoutPaymentProps) {
  const locale = useLocale();
  const tCheckout = useTranslations('checkout');
  const [selectedMethod, setSelectedMethod] = useState(() => {
    const fromCheckout = checkoutData.paymentMethod;
    if (
      fromCheckout &&
      PAYMENT_METHODS.some((m) => m.id === fromCheckout)
    ) {
      return fromCheckout;
    }
    return DEFAULT_PAYMENT_METHOD_ID;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const selectedInvoice = useMemo(
    () => selectPayableInvoice(invoices),
    [invoices]
  );

  const reviewItems = createdOrder.items.map((item) => ({
    id: item.id,
    imageUrl: item.imageUrl,
    name: item.itemName,
    quantity: item.quantity,
    price: item.price,
    lineTotal: item.quantity * item.price,
  }));

  const money = (n: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(n);

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMethod = e.target.value;
    setSelectedMethod(newMethod);
    onDataChange({
      paymentMethod: newMethod,
    });
  };

  const handlePay = async () => {
    if (!selectedInvoice) {
      setPaymentError(tCheckout('errors.noInvoice'));
      return;
    }
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setPaymentError('');
      const paymentUrl = await createPaymentUrl(selectedInvoice.id);
      window.location.assign(paymentUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : tCheckout('errors.paymentUrlFailed');
      setPaymentError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container spacing={3} alignItems="flex-start">
      <Grid size={{ xs: 12, md: 7 }}>
        {createdOrder && (
          <Card sx={{ boxShadow: 1, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {tCheckout('completeDetails.shippingDetails')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>{tCheckout('fullName')}:</strong> {createdOrder.customerName}
                </Typography>
                <Typography variant="body2">
                  <strong>{tCheckout('phone')}:</strong> {createdOrder.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>{tCheckout('address')}:</strong> {createdOrder.address}
                </Typography>
                {createdOrder.note ? (
                  <Typography variant="body2">
                    <strong>{tCheckout('notesLabel')}:</strong> {createdOrder.note}
                  </Typography>
                ) : null}
              </Box>
            </CardContent>
          </Card>
        )}

        <Card sx={{ boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {tCheckout('orderSummary')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead >
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 700 }}>{tCheckout('itemsTable.product')}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 64 }}>
                      {tCheckout('itemsTable.qty')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {tCheckout('itemsTable.price')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {tCheckout('itemsTable.lineTotal')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviewItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box className='w-full flex items-center gap-2!'>
                        {item.imageUrl && (
                          <Image src={item.imageUrl || '/img/fallbackplant.avif'} alt={item.name} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
                        )}
                        <Typography variant="body2">{item.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{item.quantity}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {money(item.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {money(item.lineTotal)}
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

      <Grid size={{ xs: 12, md: 5 }}>
        {selectedInvoice && (
          <Card
            variant="outlined"
            sx={{
              mb: 3,
              borderColor: 'var(--primary)',
              borderWidth: 2,
              boxShadow: 1,
              bgcolor: 'action.hover',
            }}
          >
            <CardContent sx={{ py: 2.5, borderRadius: 8 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
                {tCheckout('paymentBreakdownTitle')}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                {tCheckout('orderIdLabel')} #{createdOrder.id}
              </Typography>

              <TableContainer
                component={Box}
                sx={{
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Table size="small" aria-label={tCheckout('paymentBreakdownTitle')}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 700, py: 1.5, width: '60%' }}>
                        {tCheckout('breakdownTable.description')}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, py: 1.5, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {tCheckout('breakdownTable.amount')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2">{tCheckout('orderTotalValue')}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                        >
                          {money(createdOrder.totalAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {createdOrder.depositAmount != null && createdOrder.depositAmount > 0 && (
                      <TableRow>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {tCheckout('depositInfo')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {money(createdOrder.depositAmount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {createdOrder.remainingAmount != null && createdOrder.remainingAmount > 0 && (
                      <TableRow>
                        <TableCell sx={{ py: 1.5, borderBottom: 0 }}>
                          <Typography variant="body2" color="text.secondary">
                            {tCheckout('remainingInfo')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: 0 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {money(createdOrder.remainingAmount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow
                    className='border-primary! bg-primary! text-primary-contrastText border-bottom-0 py-4! font-bold!'
                    >
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {tCheckout('amountDueThisPayment')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="h6"
                          component="p"
                          sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}
                        >
                          {money(selectedInvoice.totalAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        <Card sx={{ boxShadow: 1, position: { md: 'sticky' }, top: { md: 16 } }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {tCheckout('paymentMethod')}
            </Typography>
            {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}> */}
              {/* {tCheckout('paymentMethodHint')} */}
            {/* </Typography> */}

            <RadioGroup
              className="w-full!"
              value={selectedMethod}
              onChange={handlePaymentMethodChange}
            >
              {PAYMENT_METHODS.map((method) => (
                <FormControlLabel
                  key={method.id}
                  value={method.id}
                  control={<Radio />}
                  label={
                    <Box
                      className="w-full!"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        pl: 0.5,
                        py: 1.5,
                        pr: 2,
                        width: '100%',
                        border: '2px solid',
                        borderColor:
                          selectedMethod === method.id ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        bgcolor:
                          selectedMethod === method.id ? 'action.selected' : 'background.paper',
                      }}
                    >
                      {method.icon}
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
                />
              ))}
            </RadioGroup>

            {paymentError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {paymentError}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => void handlePay()}
              disabled={isSubmitting || !selectedInvoice}
              sx={{
                mt: 3,
                py: 1.5,
                backgroundColor: 'var(--primary)',
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#45a049' },
              }}
            >
              {isSubmitting ? tCheckout('actions.creatingPayment') : tCheckout('actions.payWithVnPay')}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
