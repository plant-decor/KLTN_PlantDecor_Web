'use client';

import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ManagerNurseryOrderDetail } from '@/types/manager-sales-orders.types';
import { CustomLoading } from '@/components/CustomLoading';
import {
  formatCurrency,
  normalizeMultilineText,
  SALES_ORDER_STATUS_CHIP_COLOR,
  SALES_ORDER_STATUS_LABELS,
} from './managerSalesOrders.constants';

interface ManagerSalesOrderDetailDialogProps {
  open: boolean;
  loading: boolean;
  detailItem: ManagerNurseryOrderDetail | null;
  onClose: () => void;
}

const DetailLine = ({ label, value }: { label: string; value: string }) => (
  <Typography variant="body2">
    <strong>{label}:</strong> {value}
  </Typography>
);

export default function ManagerSalesOrderDetailDialog({
  open,
  loading,
  detailItem,
  onClose,
}: ManagerSalesOrderDetailDialogProps) {
  const typedStatus = detailItem?.status as keyof typeof SALES_ORDER_STATUS_LABELS | undefined;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {detailItem ? `Order Details #${detailItem.id}` : 'Order Details'}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
            <CustomLoading />
          </Box>
        ) : !detailItem ? (
          <Typography color="text.secondary">No detail data available.</Typography>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
              <Stack spacing={1}>
                <DetailLine label="Nursery Order ID" value={`#${detailItem.id}`} />
                <DetailLine label="Master Order ID" value={`#${detailItem.orderId}`} />
                <DetailLine label="Nursery" value={detailItem.nurseryName} />
                <Box>
                  <strong>Status:</strong>{' '}
                  <Chip
                    size="small"
                    color={
                      typedStatus != null
                        ? SALES_ORDER_STATUS_CHIP_COLOR[typedStatus] || 'default'
                        : 'default'
                    }
                    label={
                      typedStatus != null
                        ? SALES_ORDER_STATUS_LABELS[typedStatus] || detailItem.statusName
                        : detailItem.statusName
                    }
                  />
                </Box>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body2" textAlign={{ md: 'right' }}>
                  <strong>Subtotal:</strong> {formatCurrency(detailItem.subTotalAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign={{ md: 'right' }}>
                  Total items: {detailItem.items.length}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Customer Information
                </Typography>
                <Stack spacing={0.5}>
                  <DetailLine label="Name" value={detailItem.customerName} />
                  <DetailLine label="Email" value={detailItem.customerEmail || '-'} />
                  <DetailLine label="Phone" value={detailItem.customerPhone || '-'} />
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    <strong>Address:</strong> {normalizeMultilineText(detailItem.customerAddress)}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Shipper Information
                </Typography>
                <Stack spacing={0.5}>
                  <DetailLine label="Name" value={detailItem.shipperName || '-'} />
                  <DetailLine label="Email" value={detailItem.shipperEmail || '-'} />
                  <DetailLine label="Phone" value={detailItem.shipperPhone || '-'} />
                  <DetailLine label="Shipper note" value={detailItem.shipperNote || '-'} />
                  <DetailLine label="Delivery note" value={detailItem.deliveryNote || '-'} />
                </Stack>
              </Box>
            </Stack>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Product List
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Unit Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Quantity
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailItem.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">No products in this order.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    detailItem.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.itemName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.statusName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>

            <Divider />

            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              <strong>Order note:</strong> {normalizeMultilineText(detailItem.note)}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
