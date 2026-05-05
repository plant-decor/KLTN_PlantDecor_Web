'use client';

import { useMemo } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import type { DesignRegistrationTask } from '@/types/design-registration.types';

const getLocalDateInputValue = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSunday = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).getDay() === 0;
};

const getScheduledDateError = (value: string, today: string) => {
  if (!value) {
    return null;
  }

  if (value < today) {
    return 'Scheduled date cannot be in the past';
  }

  if (isSunday(value)) {
    return 'Scheduled date cannot be Sunday';
  }

  return null;
};

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
  const today = useMemo(() => getLocalDateInputValue(), []);
  const dateError = useMemo(() => getScheduledDateError(scheduledDate, today), [scheduledDate, today]);

  const handleScheduledDateChange = (value: string) => {
    onScheduledDateChange(value);
  };

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
            onChange={(event) => handleScheduledDateChange(event.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
            error={Boolean(dateError)}
            helperText={dateError || 'Select a weekday from today onward'}
            disabled={submitting}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
        <Button onClick={onConfirm} disabled={submitting || !scheduledDate || Boolean(dateError)} variant="contained">
          {submitting ? 'Processing...' : 'Confirm reschedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

