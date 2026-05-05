'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import type { CustomerDesignRegistrationDetail, CustomerDesignRegistrationListItem } from '@/types/design-registration.types';

interface DesignOrderRejectDialogProps {
  open: boolean;
  target: CustomerDesignRegistrationDetail | CustomerDesignRegistrationListItem | null;
  reason: string;
  submitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DesignOrderRejectDialog({
  open,
  target,
  reason,
  submitting,
  onReasonChange,
  onClose,
  onConfirm,
}: DesignOrderRejectDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{target ? `Reject design order #${target.id}` : 'Reject design order'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Rejection reason"
          fullWidth
          multiline
          minRows={3}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          disabled={submitting}
          placeholder="Enter rejection reason"
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
          {submitting ? 'Processing...' : 'Confirm rejection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
