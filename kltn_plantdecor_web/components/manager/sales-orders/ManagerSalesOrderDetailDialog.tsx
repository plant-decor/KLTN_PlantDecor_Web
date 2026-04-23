'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import type { ManagerNurseryOrderDetail, ManagerNurseryOrderShipper } from '@/types/manager-sales-orders.types';
import { CustomLoading } from '@/components/CustomLoading';
import FullscreenImageModal from '@/components/image-view/FullscreenImageModal';
import {
  getManagerNurseryOrderShippers,
  updateManagerNurseryOrderShipper,
} from '@/lib/api/managerSalesOrdersService';
import {
  formatCurrency,
  normalizeMultilineText,
  SALES_ORDER_STATUS_CHIP_COLOR,
  SALES_ORDER_STATUS_LABELS,
  getErrorMessage,
} from './managerSalesOrders.constants';

interface ManagerSalesOrderDetailDialogProps {
  open: boolean;
  loading: boolean;
  detailItem: ManagerNurseryOrderDetail | null;
  onClose: () => void;
  focusShipperSelector?: boolean;
  onShipperUpdated?: (updated: ManagerNurseryOrderDetail) => void;
}

const DetailLine = ({ label, value }: { label: string; value: string }) => (
  <Typography variant="body2">
    <strong>{label}:</strong> {value}
  </Typography>
);

const ASSIGNABLE_STATUSES = new Set([1, 2, 3]);

const getPaidAmount = (order: ManagerNurseryOrderDetail): number | undefined => {
  const candidate = order.paymentAmount ?? order.paidAmount ?? order.amountPaid;
  return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : undefined;
};

export default function ManagerSalesOrderDetailDialog({
  open,
  loading,
  detailItem,
  onClose,
  focusShipperSelector = false,
  onShipperUpdated,
}: ManagerSalesOrderDetailDialogProps) {
  const typedStatus = detailItem?.status as keyof typeof SALES_ORDER_STATUS_LABELS | undefined;
  const canAssignShipper = detailItem ? ASSIGNABLE_STATUSES.has(detailItem.status) : false;

  const [shipperOptions, setShipperOptions] = useState<ManagerNurseryOrderShipper[]>([]);
  const [shippersLoading, setShippersLoading] = useState(false);
  const [selectedShipperId, setSelectedShipperId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [deliveryImageOpen, setDeliveryImageOpen] = useState(false);

  const paidAmount = useMemo(() => (detailItem ? getPaidAmount(detailItem) : undefined), [detailItem]);
  const deliveryImages = useMemo(
    () => (detailItem?.deliveryImageUrl ? [detailItem.deliveryImageUrl] : []),
    [detailItem?.deliveryImageUrl],
  );

  useEffect(() => {
    if (!open || !detailItem) {
      return;
    }

    setSelectedShipperId(detailItem.shipperId ?? '');
  }, [detailItem, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const load = async () => {
      try {
        setShippersLoading(true);
        const payload = await getManagerNurseryOrderShippers(false);
        setShipperOptions(payload);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load shippers'));
        setShipperOptions([]);
      } finally {
        setShippersLoading(false);
      }
    };

    void load();
  }, [open]);

  const handleSaveShipper = async () => {
    if (!detailItem || typeof selectedShipperId !== 'number') {
      return;
    }

    try {
      setSaving(true);
      const updated = await updateManagerNurseryOrderShipper(detailItem.id, selectedShipperId, false);
      toast.success('Updated shipper successfully');
      onShipperUpdated?.(updated);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update shipper'));
    } finally {
      setSaving(false);
    }
  };

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
                <DetailLine label="ID" value={`#${detailItem.id}`} />
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
                <Typography variant="body2" textAlign={{ md: 'right' }}>
                  <strong>Total:</strong> {formatCurrency(detailItem.totalAmount ?? undefined)}
                </Typography>
                <Typography variant="body2" textAlign={{ md: 'right' }}>
                  <strong>Payment:</strong> {paidAmount != null ? formatCurrency(paidAmount) : '-'}
                </Typography>
                <Typography variant="body2" textAlign={{ md: 'right' }}>
                  <strong>Deposit:</strong> {formatCurrency(detailItem.depositAmount ?? undefined)}
                </Typography>
                <Typography variant="body2" textAlign={{ md: 'right' }}>
                  <strong>Remaining:</strong> {formatCurrency(detailItem.remainingAmount ?? undefined)}
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
                  <FormControl size="small" fullWidth disabled={!canAssignShipper || shippersLoading || saving}>
                    <InputLabel id="manager-sales-order-shipper-label">Shipper</InputLabel>
                    <Select
                      labelId="manager-sales-order-shipper-label"
                      label="Shipper"
                      value={selectedShipperId}
                      autoFocus={focusShipperSelector && canAssignShipper}
                      onChange={(event) => {
                        const raw = event.target.value as unknown as string | number;
                        if (raw === '') {
                          setSelectedShipperId('');
                          return;
                        }

                        const parsed = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
                        setSelectedShipperId(Number.isFinite(parsed) ? parsed : '');
                      }}
                    >
                      <MenuItem value="">
                        <em>Unassigned</em>
                      </MenuItem>
                      {shipperOptions.map((shipper) => (
                        <MenuItem key={shipper.id} value={shipper.id}>
                          {shipper.username} ({shipper.totalOrdersInDay})
                        </MenuItem>
                      ))}
                    </Select>
                    {!canAssignShipper ? (
                      <FormHelperText>Only editable when status is DepositPaid / Paid / Assigned.</FormHelperText>
                    ) : (
                      <FormHelperText>
                        Total orders today shown in parentheses.
                      </FormHelperText>
                    )}
                  </FormControl>

                  <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                    <Button
                      variant="contained"
                      disabled={!canAssignShipper || typeof selectedShipperId !== 'number' || saving}
                      onClick={handleSaveShipper}
                    >
                      Save
                    </Button>
                  </Stack>

                  <DetailLine label="Name" value={detailItem.shipperName || '-'} />
                  <DetailLine label="Email" value={detailItem.shipperEmail || '-'} />
                  <DetailLine label="Phone" value={detailItem.shipperPhone || '-'} />
                  <DetailLine label="Shipper note" value={detailItem.shipperNote || '-'} />
                  <DetailLine label="Delivery note" value={detailItem.deliveryNote || '-'} />
                  {detailItem.deliveryImageUrl ? (
                    <Box sx={{ pt: 0.5 }}>
                      <Button variant="outlined" size="small" onClick={() => setDeliveryImageOpen(true)}>
                        View image
                      </Button>
                    </Box>
                  ) : null}
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
            {deliveryImages.length && (
              <FullscreenImageModal
                images={deliveryImages}
                initialIndex={0}
                isOpen={deliveryImageOpen}
                onClose={() => setDeliveryImageOpen(false)}
                alt={`Delivery image for order #${detailItem.id}`}
              />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
