'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { ManagerServiceRegistration, PublicShift } from '@/types/care-service.types';
import { CustomLoading } from '@/components/CustomLoading';

export interface ServiceOrderRescheduleValues {
  serviceDate: string;
  preferredShiftId: number;
}

interface ServiceOrderRescheduleDialogProps {
  open: boolean;
  target: ManagerServiceRegistration | null;
  shifts: PublicShift[];
  shiftsLoading: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (values: ServiceOrderRescheduleValues) => void;
}

const PERIODIC_SERVICE_TYPE = 2;
const DAY_OF_WEEK_SUNDAY = 0;

const getLocalDateInputValue = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const extractIsoDate = (value?: string | null): string => {
  if (!value) {
    return '';
  }
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : value;
};

export default function ServiceOrderRescheduleDialog({
  open,
  target,
  shifts,
  shiftsLoading,
  submitting,
  onClose,
  onConfirm,
}: ServiceOrderRescheduleDialogProps) {
  const today = useMemo(() => getLocalDateInputValue(), []);
  const isPeriodic = target?.nurseryCareService?.careServicePackage?.serviceType === PERIODIC_SERVICE_TYPE;

  const [serviceDate, setServiceDate] = useState('');
  const [preferredShiftId, setPreferredShiftId] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleDialogEntered = () => {
    setError(null);
    setServiceDate(extractIsoDate(target?.serviceDate) || today);
    setPreferredShiftId(target?.prefferedShift?.id || shifts[0]?.id || 0);
  };

  const handleConfirm = () => {
    const trimmedDate = serviceDate.trim();
    if (!trimmedDate) {
      setError('Please select a service date');
      return;
    }

    if (trimmedDate < today) {
      setError('Service date must be today or later');
      return;
    }

    if (!preferredShiftId) {
      setError('Please select a preferred shift');
      return;
    }

    const dayOfWeek = new Date(`${trimmedDate}T00:00:00`).getDay();
    if (dayOfWeek === DAY_OF_WEEK_SUNDAY) {
      setError('Sunday is not allowed as service date');
      return;
    }

    setError(null);
    onConfirm({ serviceDate: trimmedDate, preferredShiftId });
  };

  return (
    <Dialog
      open={open}
      onClose={submitting || shiftsLoading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      TransitionProps={{ onEntered: handleDialogEntered }}
    >
      <DialogTitle>Reschedule order #{target?.id}</DialogTitle>
      <DialogContent dividers>
        {shiftsLoading ? (
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
            <CustomLoading />
          </Box>
        ) : (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Service date"
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              inputProps={{ min: today }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={submitting}
            />

            <FormControl fullWidth disabled={submitting || shiftsLoading}>
              <InputLabel id="preferred-shift-select">Preferred shift</InputLabel>
              <Select
                labelId="preferred-shift-select"
                label="Preferred shift"
                value={preferredShiftId || ''}
                onChange={(event) => setPreferredShiftId(Number(event.target.value))}
              >
                {shifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.shiftName} ({shift.startTime} - {shift.endTime})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isPeriodic ? (
              <Typography variant="body2" color="text.secondary">
                Note: This is a periodic service package.
              </Typography>
            ) : null}
            <Typography variant="body2" color="text.secondary">
              Note: Sunday is not allowed as the service start date.
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting || shiftsLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={submitting || shiftsLoading || shifts.length === 0}
          variant="contained"
          sx={{ backgroundColor: 'var(--primary)' }}
        >
          {submitting ? 'Processing...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

