'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import type { ManagerServiceRegistration } from '@/types/care-service.types';

interface ServiceOrderCancelDialogProps {
  open: boolean;
  target: ManagerServiceRegistration | null;
  reason: string;
  submitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ServiceOrderCancelDialog({
  open,
  target,
  reason,
  submitting,
  onReasonChange,
  onClose,
  onConfirm,
}: ServiceOrderCancelDialogProps) {
  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{target ? `Cancel service order #${target.id}` : 'Cancel service order'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Cancellation reason"
          fullWidth
          multiline
          minRows={3}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          disabled={submitting}
          placeholder="Enter cancellation reason"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={submitting} variant="contained" color="error">
          {submitting ? 'Processing...' : 'Confirm cancellation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
