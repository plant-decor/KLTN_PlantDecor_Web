'use client';

import { Box, Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import type { CustomerDesignRegistrationDetail, CustomerDesignRegistrationListItem, DesignEligibleCaretaker, DesignEligibleCaretakerAvailability, DesignRegistrationTask } from '@/types/design-registration.types';

interface DesignTaskAssignDialogProps {
  open: boolean;
  target: DesignRegistrationTask | null;
  registration: CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail | null;
  caretakers: DesignEligibleCaretaker[];
  availabilityByStaffId: Record<number, DesignEligibleCaretakerAvailability>;
  scheduledDate: string;
  loading: boolean;
  submitting: boolean;
  selectedCaretakerId: number;
  onClose: () => void;
  onScheduledDateChange: (value: string) => void;
  onSelectedCaretakerIdChange: (value: number) => void;
  onConfirm: () => void;
  getDesignTaskTypeLabel: (task: DesignRegistrationTask) => string;
}

export default function DesignTaskAssignDialog({
  open,
  target,
  // registration: _registration,
  caretakers,
  availabilityByStaffId,
  scheduledDate,
  loading,
  submitting,
  selectedCaretakerId,
  onClose,
  onScheduledDateChange,
  onSelectedCaretakerIdChange,
  onConfirm,
  getDesignTaskTypeLabel,
}: DesignTaskAssignDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Assign {target ? getDesignTaskTypeLabel(target) : 'design task'}
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

          {loading ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
              <Typography>Loading available caretakers...</Typography>
            </Box>
          ) : caretakers.length === 0 ? (
            <Alert severity="warning">No eligible caretakers found for this design task.</Alert>
          ) : (
            <FormControl fullWidth>
              <InputLabel id="design-task-caretaker-label">Eligible Staff</InputLabel>
              <Select
                labelId="design-task-caretaker-label"
                label="Eligible Staff"
                value={selectedCaretakerId || ''}
                onChange={(event) => onSelectedCaretakerIdChange(Number(event.target.value))}
              >
                <MenuItem value="">
                  <em>Select a staff member</em>
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
            Availability is checked against the selected date when the API returns conflict information.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting || loading}>
          Close
        </Button>
        <Button
          onClick={onConfirm}
          disabled={submitting || loading || caretakers.length === 0 || !selectedCaretakerId}
          variant="contained"
        >
          {submitting ? 'Processing...' : 'Confirm assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
