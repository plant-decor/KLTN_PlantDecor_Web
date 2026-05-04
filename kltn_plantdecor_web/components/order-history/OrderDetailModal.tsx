'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
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
  canUserCancelOrder,
  formatCurrency,
  getStatusInfo,
} from './orderHistoryUtils';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import Image from 'next/image';
import { canCreateReturnTicket } from './returnTicket.constants';
import { CustomLoading } from '@/components/CustomLoading';
import { formatDateTime } from '@/lib/utils/dateUtils';

const SERVICE_ORDER_TYPE = 4;

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  loading: boolean;
  error: string;
  retryLoadingOrderId: number | null;
  paymentLoadingInvoiceId: number | null;
  cancelLoadingOrderId: number | null;
  creatingReturnTicket: boolean;
  onPayInvoice: (invoiceId: number) => Promise<void>;
  onCancelOrder: (orderId: number) => Promise<void>;
  onCreateReturnTicket: (orderId: number) => void;
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
  creatingReturnTicket,
  onPayInvoice,
  onCancelOrder,
  onCreateReturnTicket,
  onClose,
}: OrderDetailModalProps) {
  const tOrderHistory = useTranslations('orderHistory');
  const statusInfo = order ? getStatusInfo(order.statusName) : null;
  const isServiceOrder = order?.orderType === SERVICE_ORDER_TYPE;
  const canCancelOrder = !!order && canUserCancelOrder(order.statusName);
  const canCreateReturn = !!order && !isServiceOrder && canCreateReturnTicket(order.statusName);
  const isCancelling = !!order && cancelLoadingOrderId === order.id;
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
            <CustomLoading />
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
                <Typography variant="body1">{formatDateTime(order.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Updated at
                </Typography>
                <Typography variant="body1">{formatDateTime(order.updatedAt)}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Customer information
            </Typography>
            <Box sx={{ mb: 3 }}>
              {order.customerName && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.customerName || '-'}
                  </Typography>
                </>
              )}
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

            {!isServiceOrder && order.nurseryOrders.length > 0 ? (
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
                  {isServiceOrder ? 'Service details' : 'Invoices'}
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
                      Type: {invoice.typeName} - Date: {formatDateTime(invoice.issuedDate)}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                      {formatCurrency(invoice.totalAmount)}
                    </Typography>

                    {isServiceOrder ? (
                      <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
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
                            {invoice.details.length > 0 ? (
                              invoice.details.map((detail) => (
                                <TableRow key={detail.id}>
                                  <TableCell>{detail.itemName}</TableCell>
                                  <TableCell align="center">{detail.quantity}</TableCell>
                                  <TableCell align="right">{formatCurrency(detail.unitPrice)}</TableCell>
                                  <TableCell align="right">{formatCurrency(detail.amount)}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  <Typography variant="body2" color="text.secondary">
                                    No service details available.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : null}
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
        {order && canCreateReturn ? (
          <Button
            variant="contained"
            onClick={() => onCreateReturnTicket(order.id)}
            disabled={creatingReturnTicket || isCancelling}
          >
            {creatingReturnTicket ? 'Opening return form...' : 'Create Return Ticket'}
          </Button>
        ) : null}
        {order && canCancelOrder ? (
          <Button
            variant="outlined"
            color="error"
            onClick={() => void onCancelOrder(order.id)}
            disabled={isCancelling || retryLoadingOrderId === order.id}
            className='bg-error!'
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

