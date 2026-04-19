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
      <DialogTitle>Confirm Order Approval</DialogTitle>
      <DialogContent dividers>
        Are you sure you want to approve this service order?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={submitting} variant="contained" sx={{ backgroundColor: 'var(--primary)' }}>
          {submitting ? 'Processing...' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
