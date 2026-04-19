'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import type { Order } from '@/types/order.types';
import {
  formatCurrency,
  formatDate,
  getOrderSteps,
  getStatusInfo,
} from './orderHistoryUtils';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import Image from 'next/image';

// type OrderDisplayItem = {
//   id: number;
//   imageUrl: string | null;
//   itemName: string;
//   quantity: number;
//   price: number;
//   statusName: string;
// };

// function mapInvoiceDetailToDisplayItem(detail: OrderInvoiceDetail): OrderDisplayItem {
//   return {
//     id: detail.id,
//     imageUrl: detail.imageUrl,
//     itemName: detail.itemName,
//     quantity: detail.quantity,
//     price: detail.unitPrice,
//     statusName: detail.statusName,
//   };
// }

// function getDisplayItems(order: Order): OrderDisplayItem[] {
//   if (order.orderType !== 4) {
//     return order.items;
//   }

//   const invoiceWithDetails = order.invoices.find((invoice) => invoice.details.length > 0);
//   return invoiceWithDetails ? invoiceWithDetails.details.map(mapInvoiceDetailToDisplayItem) : [];
// }

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  loading: boolean;
  error: string;
  retryLoadingOrderId: number | null;
  paymentLoadingInvoiceId: number | null;
  cancelLoadingOrderId: number | null;
  onPayInvoice: (invoiceId: number) => Promise<void>;
  onCancelOrder: (orderId: number) => Promise<void>;
  onClose: () => void;
}

export default function OrderDetailModal({
  open,
  order,
  loading,
  error,
  retryLoadingOrderId,
  paymentLoadingInvoiceId,
  cancelLoadingOrderId,
  onPayInvoice,
  onCancelOrder,
  onClose,
}: OrderDetailModalProps) {
  const tOrderHistory = useTranslations('orderHistory');
  const statusInfo = order ? getStatusInfo(order.statusName) : null;
  const canCancelOrder = order?.statusName === 'Pending' || order?.statusName === 'DepositPaid' || order?.statusName === 'Paid';
  const isCancelling = !!order && cancelLoadingOrderId === order.id;
  // const displayItems = order ? getDisplayItems(order) : [];
  console.log('OrderDetailModal render - order:', order);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Order detail {order ? `#${order.id}` : ''}
          </Typography>
          {order && statusInfo ? (
            <Chip icon={statusInfo.icon} label={order.statusName} color={statusInfo.color} />
          ) : null}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !order ? (
          <Alert severity="error">Cannot load order detail.</Alert>
        ) : (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Order ID
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                #{order.id}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created at
                </Typography>
                <Typography variant="body1">{formatDate(order.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Updated at
                </Typography>
                <Typography variant="body1">{formatDate(order.updatedAt)}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {order.statusName !== 'Cancelled' ? (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Order progress
                </Typography>
                <Stepper activeStep={getOrderSteps(order.statusName).activeStep} alternativeLabel sx={{ mb: 3 }}>
                  {getOrderSteps(order.statusName).steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Divider sx={{ my: 3 }} />
              </>
            ) : null}

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Shipping information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Customer
              </Typography>
              <Typography variant="body1" gutterBottom>
                {order.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1" gutterBottom>
                {order.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1">{order.address}</Typography>
              {order.note ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Note
                  </Typography>
                  <Typography variant="body1">{order.note}</Typography>
                </>
              ) : null}
            </Box>

            <Divider sx={{ my: 3 }} />

            {order.nurseryOrders.length > 0 ? (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Nursery orders
                </Typography>
                {order.nurseryOrders.map((nurseryOrder) => (
                  <Card key={nurseryOrder.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {nurseryOrder.nurseryName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" component="span">
                        Status:
                      </Typography>
                      <Chip label={nurseryOrder.statusName} size="small" sx={{ ml: 0.5 }} />
                    </Box>
                    {nurseryOrder.shipperName ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Shipper: {nurseryOrder.shipperName}
                      </Typography>
                    ) : null}
                    <TableContainer component={Paper} elevation={0} sx={{ mb: 3 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>
                              <strong>Item</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Qty</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Unit price</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Amount</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {nurseryOrder.items.length > 0 ? (
                            nurseryOrder.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Box className='flex items-center'>
                                    <Image src={item.imageUrl || '/img/fallbackplant.avif'} alt={item.itemName} width={60} height={60}
                                      style={{ objectFit: 'cover', borderRadius: 4, marginRight: 16 }} />
                                    {item.itemName}
                                  </Box>
                                </TableCell>
                                <TableCell align="center">{item.quantity}</TableCell>
                                <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                                <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                <Typography variant="body2" color="text.secondary">
                                  No item details available.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }} align="right">
                      Subtotal: {formatCurrency(nurseryOrder.subTotalAmount)}
                    </Typography>
                  </Card>
                ))}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom align='right' sx={{ mt: 2, backgroundColor: 'var(--primary)', padding: 1, borderRadius: 1 }}>
                  Total: {formatCurrency(order.totalAmount)}
                </Typography>
                <Divider sx={{ my: 3 }} />
              </>
            ) : null}

            {order.invoices.length > 0 ? (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Invoices
                </Typography>
                {order.invoices.map((invoice) => (
                  <Card key={invoice.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Invoice #{invoice.id}
                      </Typography>
                      <Chip label={invoice.statusName} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Type: {invoice.typeName} - Date: {formatDate(invoice.issuedDate)}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                      {formatCurrency(invoice.totalAmount)}
                    </Typography>
                    <Box
                      className='w-full flex justify-end'> 
                    {invoice.statusName === 'Pending' ? (
                      <Button
                        variant="contained"
                        className='font-semibold!'
                        size="small"
                        sx={{ px: 2, py: 1, backgroundColor: 'var(--primary)', ...hoverLiftStyle }}
                        onClick={() => void onPayInvoice(invoice.id)}
                        disabled={paymentLoadingInvoiceId === invoice.id || isCancelling}
                      >
                        {paymentLoadingInvoiceId === invoice.id
                          ? tOrderHistory('retryingPayment')
                          : tOrderHistory('payNow')}
                      </Button>
                    ) : null}
                </Box>
                  </Card>
                ))}
              </>
            ) : null}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {order && canCancelOrder ? (
          <Button
            variant="outlined"
            color="error"
            onClick={() => void onCancelOrder(order.id)}
            disabled={isCancelling || retryLoadingOrderId === order.id}
          >
            {isCancelling ? tOrderHistory('cancelling') : tOrderHistory('cancelOrder')}
          </Button>
        ) : null}
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

