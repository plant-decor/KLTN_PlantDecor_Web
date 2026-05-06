'use client';

import {
  Box,
  Alert,
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
import type {
  CustomerDesignRegistrationDetail,
  CustomerDesignRegistrationListItem,
  DesignEligibleCaretaker,
  DesignEligibleCaretakerAvailability,
} from '@/types/design-registration.types';

interface DesignCaretakerAssignDialogProps {
  open: boolean;
  registration: CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail | null;
  caretakers: DesignEligibleCaretaker[];
  availabilityByStaffId: Record<number, DesignEligibleCaretakerAvailability>;
  startDate: string;
  loading: boolean;
  submitting: boolean;
  selectedCaretakerId: number;
  onClose: () => void;
  onStartDateChange: (value: string) => void;
  onSelectedCaretakerIdChange: (value: number) => void;
  onConfirm: () => void;
}

export default function DesignCaretakerAssignDialog({
  open,
  registration,
  caretakers,
  availabilityByStaffId,
  startDate,
  loading,
  submitting,
  selectedCaretakerId,
  onClose,
  onStartDateChange,
  onSelectedCaretakerIdChange,
  onConfirm,
}: DesignCaretakerAssignDialogProps) {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minStartDate = today.toISOString().slice(0, 10);

  const parsedStartDate = startDate ? new Date(`${startDate}T00:00`) : null;
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const isStartDatePast = parsedStartDate ? parsedStartDate < todayMidnight : false;
  const isStartDateSunday = parsedStartDate ? parsedStartDate.getDay() === 0 : false;
  const startDateErrorText = startDate
    ? isStartDatePast
      ? 'Start date cannot be in the past.'
      : isStartDateSunday
        ? 'Start date cannot be Sunday.'
        : ''
    : '';
  const isStartDateInvalid = Boolean(startDate && (isStartDatePast || isStartDateSunday));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Assign Caretaker to Design Registration</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Registration Info */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px solid var(--card-border)',
            }}
          >
            {/* <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Registration ID
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {registration?.id || '-'}
              </Typography>
            </Stack> */}
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Customer
              </Typography>
              <Typography variant="body2">
                {registration && 'customer' in registration && registration.customer
                  ? registration.customer.fullName
                  : '-'}
              </Typography>
            </Stack>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Design Template
              </Typography>
              <Typography variant="body2">
                {registration?.designTemplateTier.designTemplate.name || '-'}
              </Typography>
            </Stack>
          </Box>

          {/* Start Date Picker */}
          <TextField
            label="Caretaker Start Date"
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minStartDate }}
            error={isStartDateInvalid}
            helperText={startDateErrorText}
            disabled={submitting || loading}
            fullWidth
            required
          />

          {/* Caretaker Selection */}
          {loading ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
              <Typography>Loading eligible caretakers...</Typography>
            </Box>
          ) : caretakers.length === 0 ? (
            <Alert severity="warning">No eligible caretakers found for this design registration.</Alert>
          ) : (
            <FormControl fullWidth>
              <InputLabel id="design-caretaker-label">Eligible Caretaker</InputLabel>
              <Select
                labelId="design-caretaker-label"
                label="Eligible Caretaker"
                value={selectedCaretakerId || ''}
                onChange={(event) => onSelectedCaretakerIdChange(Number(event.target.value))}
                disabled={submitting}
              >
                <MenuItem value="">
                  <em>Select a caretaker</em>
                </MenuItem>
                {caretakers.map((caretaker) => {
                  const availability = availabilityByStaffId[caretaker.id];
                  const statusText = availability
                    ? availability.isAvailable
                      ? 'Available'
                      : `Conflicts: ${availability.conflictDates.join(', ') || 'yes'}`
                    : '';

                  return (
                    <MenuItem key={caretaker.id} value={caretaker.id}>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {caretaker.username} - {caretaker.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {caretaker.phoneNumber || '-'}{statusText ? ` · ${statusText}` : ''}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}

          <Typography variant="body2" color="text.secondary">
            Select a caretaker and start date. Availability is based on the selected start date.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting || loading}>
          Close
        </Button>
        <Button
          onClick={onConfirm}
          disabled={
            submitting ||
            loading ||
            caretakers.length === 0 ||
            !selectedCaretakerId ||
            !startDate ||
            isStartDateInvalid
          }
          variant="contained"
        >
          {submitting ? 'Processing...' : 'Assign Caretaker'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
