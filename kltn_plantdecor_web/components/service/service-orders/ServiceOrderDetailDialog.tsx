'use client';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import type { ManagerServiceRegistration, ServiceRegistrationStatusEnum } from '@/types/care-service.types';
import {
  STATUS_CHIP_COLOR,
  STATUS_LABELS,
  canApproveOrReject,
  canAssignCaretaker,
  canManagerCancel,
  formatCurrency,
  formatDate,
} from './managerServiceOrders.constants';

interface ServiceOrderDetailDialogProps {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  detailItem: ManagerServiceRegistration | null;
  onClose: () => void;
  onApprove: (item: ManagerServiceRegistration) => void;
  onReject: (item: ManagerServiceRegistration) => void;
  onCancel: (item: ManagerServiceRegistration) => void;
  onAssignCaretaker: (item: ManagerServiceRegistration) => void;
}

export default function ServiceOrderDetailDialog({
  open,
  loading,
  submitting,
  detailItem,
  onClose,
  onApprove,
  onReject,
  onCancel,
  onAssignCaretaker,
}: ServiceOrderDetailDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (loading || submitting) {
          return;
        }
        onClose();
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {detailItem ? `Chi tiết đơn dịch vụ #${detailItem.id}` : 'Chi tiết đơn dịch vụ'}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : !detailItem ? (
          <Typography color="text.secondary">Không có dữ liệu chi tiết.</Typography>
        ) : (
          <Stack spacing={1.5}>
            <Box>
              <strong>Trạng thái:</strong>{' '}
              <Chip
                size="small"
                color={STATUS_CHIP_COLOR[detailItem.status as ServiceRegistrationStatusEnum] || 'default'}
                label={
                  STATUS_LABELS[detailItem.status as ServiceRegistrationStatusEnum] ||
                  detailItem.statusName ||
                  `#${detailItem.status}`
                }
              />
            </Box>
            <Typography>
              <strong>Khách hàng:</strong> {detailItem.customer?.fullName || '-'} ({detailItem.customer?.email || '-'})
            </Typography>
            <Typography>
              <strong>Số điện thoại:</strong> {detailItem.phone || '-'}
            </Typography>
            <Typography>
              <strong>Địa chỉ:</strong> {detailItem.address || '-'}
            </Typography>
            <Typography>
              <strong>Ngày dịch vụ:</strong> {formatDate(detailItem.serviceDate)}
            </Typography>
            <Typography>
              <strong>Ca mong muốn:</strong>{' '}
              {detailItem.prefferedShift
                ? `${detailItem.prefferedShift.shiftName} (${detailItem.prefferedShift.startTime} - ${detailItem.prefferedShift.endTime})`
                : '-'}
            </Typography>
            <Typography>
              <strong>Gói dịch vụ:</strong> {detailItem.nurseryCareService.careServicePackage.name}
            </Typography>
            <Typography>
              <strong>Đơn giá:</strong> {formatCurrency(detailItem.nurseryCareService.careServicePackage.unitPrice)}
            </Typography>
            <Typography>
              <strong>Số buổi:</strong> {detailItem.totalSessions}
            </Typography>
            <Typography>
              <strong>Order ID:</strong> {detailItem.orderId ? `#${detailItem.orderId}` : '-'}
            </Typography>
            <Typography>
              <strong>Caretaker chính:</strong> {detailItem.mainCaretaker?.fullName || '-'}
            </Typography>
            <Typography>
              <strong>Ghi chú:</strong> {detailItem.note || '-'}
            </Typography>
            {detailItem.cancelReason ? (
              <Typography>
                <strong>Lý do từ chối/hủy:</strong> {detailItem.cancelReason}
              </Typography>
            ) : null}
            <Typography>
              <strong>Tạo lúc:</strong> {formatDate(detailItem.createdAt)}
            </Typography>
            <Typography>
              <strong>Duyệt lúc:</strong> {formatDate(detailItem.approvedAt)}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {detailItem && canApproveOrReject(detailItem.status) && (
            <Button
              variant="contained"
              color="success"
              onClick={() => onApprove(detailItem)}
              disabled={submitting}
            >
              Duyệt đơn
            </Button>
          )}
          {detailItem && canApproveOrReject(detailItem.status) && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => onReject(detailItem)}
              disabled={submitting}
            >
              Từ chối
            </Button>
          )}
          {detailItem && canManagerCancel(detailItem.status) && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => onCancel(detailItem)}
              disabled={submitting}
            >
              Hủy đơn
            </Button>
          )}
          {detailItem && canAssignCaretaker(detailItem.status) && (
            <Button
              variant="outlined"
              onClick={() => onAssignCaretaker(detailItem)}
              disabled={submitting}
            >
              Giao caretaker
            </Button>
          )}
        </Stack>
        <Button onClick={onClose} disabled={submitting || loading}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
