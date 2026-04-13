'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import type { ManagerServiceRegistration } from '@/types/care-service.types';

interface ServiceOrderRejectDialogProps {
  open: boolean;
  target: ManagerServiceRegistration | null;
  reason: string;
  submitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ServiceOrderRejectDialog({
  open,
  target,
  reason,
  submitting,
  onReasonChange,
  onClose,
  onConfirm,
}: ServiceOrderRejectDialogProps) {
  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{target ? `Từ chối đơn dịch vụ #${target.id}` : 'Từ chối đơn dịch vụ'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Lý do từ chối"
          fullWidth
          multiline
          minRows={3}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          disabled={submitting}
          placeholder="Nhập lý do từ chối"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button onClick={onConfirm} disabled={submitting} variant="contained" color="error">
          {submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
