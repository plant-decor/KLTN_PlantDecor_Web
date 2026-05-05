'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import type { CustomerDesignRegistrationDetail, CustomerDesignRegistrationListItem } from '@/types/design-registration.types';

interface DesignOrderCancelDialogProps {
  open: boolean;
  target: CustomerDesignRegistrationDetail | CustomerDesignRegistrationListItem | null;
  reason: string;
  submitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DesignOrderCancelDialog({
  open,
  target,
  reason,
  submitting,
  onReasonChange,
  onClose,
  onConfirm,
}: DesignOrderCancelDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{target ? `Cancel design order #${target.id}` : 'Cancel design order'}</DialogTitle>
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
          Close
        </Button>
        <Button
          onClick={onConfirm}
          disabled={submitting || reason.trim().length === 0}
          variant="contained"
          color="error"
        >
          {submitting ? 'Processing...' : 'Confirm cancellation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
