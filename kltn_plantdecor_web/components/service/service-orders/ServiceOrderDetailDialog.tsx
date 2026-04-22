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
import type { ManagerServiceRegistration } from '@/types/care-service.types';
import {
  canApproveOrReject,
  canAssignCaretaker,
  canManagerCancel,
  canReschedule,
  formatCurrency,
  formatDate,
  getStatusChipColor,
} from './managerServiceOrders.constants';

interface ServiceOrderDetailDialogProps {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  detailItem: ManagerServiceRegistration | null;
  statusLabels: Record<number, string>;
  onClose: () => void;
  onApprove: (item: ManagerServiceRegistration) => void;
  onReject: (item: ManagerServiceRegistration) => void;
  onCancel: (item: ManagerServiceRegistration) => void;
  onAssignCaretaker: (item: ManagerServiceRegistration) => void;
  onReschedule: (item: ManagerServiceRegistration) => void;
}

export default function ServiceOrderDetailDialog({
  open,
  loading,
  submitting,
  detailItem,
  statusLabels,
  onClose,
  onApprove,
  onReject,
  onCancel,
  onAssignCaretaker,
  onReschedule,
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
        {detailItem ? `Service Order Details #${detailItem.id}` : 'Service Order Details'}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : !detailItem ? (
          <Typography color="text.secondary">No detail data available.</Typography>
        ) : (
          <Stack spacing={1.5}>
            <Box>
              <strong>Status:</strong>{' '}
              <Chip
                size="small"
                color={getStatusChipColor(detailItem.status)}
                label={
                  statusLabels[detailItem.status] ||
                  detailItem.statusName ||
                  `#${detailItem.status}`
                }
              />
            </Box>
            <Typography>
              <strong>Customer:</strong> {detailItem.customer?.fullName || '-'} ({detailItem.customer?.email || '-'})
            </Typography>
            <Typography>
              <strong>Phone:</strong> {detailItem.phone || '-'}
            </Typography>
            <Typography>
              <strong>Address:</strong> {detailItem.address || '-'}
            </Typography>
            <Typography>
              <strong>Service date:</strong> {formatDate(detailItem.serviceDate)}
            </Typography>
            <Typography>
              <strong>Preferred shift:</strong>{' '}
              {detailItem.prefferedShift
                ? `${detailItem.prefferedShift.shiftName} (${detailItem.prefferedShift.startTime} - ${detailItem.prefferedShift.endTime})`
                : '-'}
            </Typography>
            <Typography>
              <strong>Service package:</strong> {detailItem.nurseryCareService.careServicePackage.name}
            </Typography>
            <Typography>
              <strong>Unit price:</strong> {formatCurrency(detailItem.nurseryCareService.careServicePackage.unitPrice)}
            </Typography>
            <Typography>
              <strong>Total sessions:</strong> {detailItem.totalSessions}
            </Typography>
            <Typography>
              <strong>Order ID:</strong> {detailItem.orderId ? `#${detailItem.orderId}` : '-'}
            </Typography>
            <Typography>
              <strong>Primary caretaker:</strong> {detailItem.mainCaretaker?.fullName || '-'}
            </Typography>
            <Typography>
              <strong>Note:</strong> {detailItem.note || '-'}
            </Typography>
            {detailItem.cancelReason ? (
              <Typography>
                <strong>Reject/Cancel reason:</strong> {detailItem.cancelReason}
              </Typography>
            ) : null}
            <Typography>
              <strong>Created at:</strong> {formatDate(detailItem.createdAt)}
            </Typography>
            <Typography>
              <strong>Approved at:</strong> {formatDate(detailItem.approvedAt)}
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
              className='bg-primary!'
            >
              Approve Order
            </Button>
          )}
          {detailItem && canApproveOrReject(detailItem.status) && (
            <Button
              variant="outlined"
              color="error"
              className='bg-error!'
              onClick={() => onReject(detailItem)}
              disabled={submitting}
            >
              Reject
            </Button>
          )}
          {detailItem && canManagerCancel(detailItem.status) && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => onCancel(detailItem)}
              disabled={submitting}
              className='bg-error!'
            >
              Cancel Order
            </Button>
          )}
          {detailItem && canAssignCaretaker(detailItem.status) && (
            <Button
              variant="outlined"
              onClick={() => onAssignCaretaker(detailItem)}
              disabled={submitting}
              className='bg-blue-400!'
            >
              Assign caretaker
            </Button>
          )}
          {detailItem && canReschedule(detailItem.status) && (
            <Button variant="outlined" onClick={() => onReschedule(detailItem)} disabled={submitting} className='bg-warning!'>
              Reschedule
            </Button>
          )}
        </Stack>
        <Button onClick={onClose} disabled={submitting || loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
