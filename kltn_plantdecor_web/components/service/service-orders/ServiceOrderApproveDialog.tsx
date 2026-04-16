'use client';

import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import type { ManagerServiceRegistration } from '@/types/care-service.types';

interface ServiceOrderApproveDialogProps {
  open: boolean;
  target: ManagerServiceRegistration | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ServiceOrderApproveDialog({
  open,
  submitting,
  onClose,
  onConfirm,
}: ServiceOrderApproveDialogProps) {
  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Xác nhận duyệt đơn</DialogTitle>
      <DialogContent dividers>
        Bạn có chắc chắn muốn phê duyệt đơn dịch vụ?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button onClick={onConfirm} disabled={submitting} variant="contained" sx={{backgroundColor: 'var(--primary)'}}>
          {submitting ? 'Đang xử lý...' : 'Phê duyệt'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
