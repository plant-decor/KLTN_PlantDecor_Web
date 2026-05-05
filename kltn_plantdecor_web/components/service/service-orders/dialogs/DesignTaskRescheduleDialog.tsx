'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import type { DesignRegistrationTask } from '@/types/design-registration.types';

interface DesignTaskRescheduleDialogProps {
  open: boolean;
  target: DesignRegistrationTask | null;
  scheduledDate: string;
  submitting: boolean;
  onScheduledDateChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  getDesignTaskTypeLabel: (task: DesignRegistrationTask) => string;
}

export default function DesignTaskRescheduleDialog({
  open,
  target,
  scheduledDate,
  submitting,
  onScheduledDateChange,
  onClose,
  onConfirm,
  getDesignTaskTypeLabel,
}: DesignTaskRescheduleDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Reschedule {target ? getDesignTaskTypeLabel(target) : 'design task'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Scheduled date"
            type="date"
            value={scheduledDate}
            onChange={(event) => onScheduledDateChange(event.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={submitting}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
        <Button onClick={onConfirm} disabled={submitting || !scheduledDate} variant="contained">
          {submitting ? 'Processing...' : 'Confirm reschedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

