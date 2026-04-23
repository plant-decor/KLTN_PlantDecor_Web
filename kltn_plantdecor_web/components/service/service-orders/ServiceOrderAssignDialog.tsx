'use client';

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
  Typography,
} from '@mui/material';
import type { EligibleCaretaker, ManagerServiceRegistration } from '@/types/care-service.types';
import { CustomLoading } from '@/components/CustomLoading';

interface ServiceOrderAssignDialogProps {
  open: boolean;
  target: ManagerServiceRegistration | null;
  selectedCaretakerId: number;
  eligibleCaretakers: EligibleCaretaker[];
  loading: boolean;
  submitting: boolean;
  onSelectedCaretakerIdChange: (value: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ServiceOrderAssignDialog({
  open,
  target,
  selectedCaretakerId,
  eligibleCaretakers,
  loading,
  submitting,
  onSelectedCaretakerIdChange,
  onClose,
  onConfirm,
}: ServiceOrderAssignDialogProps) {
  return (
    <Dialog open={open} onClose={submitting || loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Assign caretaker to order #{target?.id}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
            <CustomLoading />
          </Box>
        ) : eligibleCaretakers.length === 0 ? (
          <Alert severity="warning">No eligible caretakers found for this order.</Alert>
        ) : (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="eligible-caretaker-select">Eligible Caretaker</InputLabel>
              <Select
                labelId="eligible-caretaker-select"
                label="Eligible Caretaker"
                value={selectedCaretakerId || ''}
                onChange={(event) => onSelectedCaretakerIdChange(Number(event.target.value))}
              >
                {eligibleCaretakers.map((caretaker) => (
                  <MenuItem key={caretaker.id} value={caretaker.id}>
                    {caretaker.username} - {caretaker.email} - {caretaker.phoneNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              The order will be assigned to a caretaker whose skills match the selected service package.
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting || loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={submitting || loading || eligibleCaretakers.length === 0 || !selectedCaretakerId}
          variant="contained"
        >
          {submitting ? 'Processing...' : 'Confirm assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
