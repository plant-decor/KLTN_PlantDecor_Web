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

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  loading: boolean;
  error: string;
  retryLoadingOrderId: number | null;
  cancelLoadingOrderId: number | null;
  onRetryPayment: (orderId: number) => Promise<void>;
  onCancelOrder: (orderId: number) => Promise<void>;
  onClose: () => void;
}

export default function OrderDetailModal({
  open,
  order,
  loading,
  error,
  retryLoadingOrderId,
  cancelLoadingOrderId,
  onRetryPayment,
  onCancelOrder,
  onClose,
}: OrderDetailModalProps) {
  const tOrderHistory = useTranslations('orderHistory');
  const statusInfo = order ? getStatusInfo(order.statusName) : null;
  const retryOrderId = order?.statusName === 'Pending' ? order.id : null;
  const canCancelOrder = order?.statusName === 'Pending' || order?.statusName === 'DepositPaid';
  const isCancelling = !!order && cancelLoadingOrderId === order.id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Item details
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
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
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

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
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
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
                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                      Subtotal: {formatCurrency(nurseryOrder.subTotalAmount)}
                    </Typography>
                  </Card>
                ))}
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
                    {invoice.statusName === 'Pending' && retryOrderId !== null ? (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ mt: 1.5 }}
                        onClick={() => void onRetryPayment(retryOrderId)}
                        disabled={retryLoadingOrderId === retryOrderId || isCancelling}
                      >
                        {retryLoadingOrderId === retryOrderId
                          ? tOrderHistory('retryingPayment')
                          : tOrderHistory('retryPayment')}
                      </Button>
                    ) : null}
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
            {isCancelling ? 'Cancelling...' : 'Cancel order'}
          </Button>
        ) : null}
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

