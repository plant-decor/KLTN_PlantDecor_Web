'use client';

import {
  Box,
  Chip,
  CircularProgress,
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
        {detailItem ? `Chi tiết đơn hàng #${detailItem.id}` : 'Chi tiết đơn hàng'}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : !detailItem ? (
          <Typography color="text.secondary">Không có dữ liệu chi tiết.</Typography>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
              <Stack spacing={1}>
                <DetailLine label="Mã đơn vườn" value={`#${detailItem.id}`} />
                <DetailLine label="Mã đơn tổng" value={`#${detailItem.orderId}`} />
                <DetailLine label="Vườn" value={detailItem.nurseryName} />
                <Box>
                  <strong>Trạng thái:</strong>{' '}
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
                  <strong>Tạm tính:</strong> {formatCurrency(detailItem.subTotalAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign={{ md: 'right' }}>
                  Tổng sản phẩm: {detailItem.items.length}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Thông tin khách hàng
                </Typography>
                <Stack spacing={0.5}>
                  <DetailLine label="Tên" value={detailItem.customerName} />
                  <DetailLine label="Email" value={detailItem.customerEmail || '-'} />
                  <DetailLine label="Số điện thoại" value={detailItem.customerPhone || '-'} />
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    <strong>Địa chỉ:</strong> {normalizeMultilineText(detailItem.customerAddress)}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Thông tin shipper
                </Typography>
                <Stack spacing={0.5}>
                  <DetailLine label="Tên" value={detailItem.shipperName || '-'} />
                  <DetailLine label="Email" value={detailItem.shipperEmail || '-'} />
                  <DetailLine label="Số điện thoại" value={detailItem.shipperPhone || '-'} />
                  <DetailLine label="Ghi chú shipper" value={detailItem.shipperNote || '-'} />
                  <DetailLine label="Ghi chú giao hàng" value={detailItem.deliveryNote || '-'} />
                </Stack>
              </Box>
            </Stack>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Danh sách sản phẩm
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tên sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Đơn giá
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Số lượng
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Thành tiền
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailItem.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">Không có sản phẩm trong đơn.</Typography>
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
              <strong>Ghi chú đơn:</strong> {normalizeMultilineText(detailItem.note)}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
