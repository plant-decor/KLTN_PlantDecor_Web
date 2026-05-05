'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { EligibleCaretaker, NurseryServiceScheduleItem } from '@/types/care-service.types';
import { CustomLoading } from '@/components/CustomLoading';

interface ServiceProgressReassignDialogProps {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  selectedCaretakerId: number;
  target: NurseryServiceScheduleItem | null;
  caretakers: EligibleCaretaker[];
  onChangeCaretakerId: (caretakerId: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ServiceProgressReassignDialog({
  open,
  loading,
  submitting,
  error,
  selectedCaretakerId,
  target,
  caretakers,
  onChangeCaretakerId,
  onClose,
  onSubmit,
}: ServiceProgressReassignDialogProps) {
  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Reassign Caretaker for Session #{target?.id || '-'}
        <IconButton
          aria-label='close'
          onClick={onClose}
          disabled={submitting}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant='body2' color='text.secondary'>
            Select a new caretaker to reassign this service session. The current caretaker will be notified of the change. Please ensure that the new caretaker is available during the scheduled time.
          </Typography>

          {error && <Alert severity='error'>{error}</Alert>}

          {loading ? (
            <Stack direction='row' spacing={1} alignItems='center'>
              <CustomLoading size={22} />
              <Typography variant='body2'>Loading eligible caretakers...</Typography>
            </Stack>
          ) : (
            <FormControl fullWidth size='small' disabled={submitting || caretakers.length === 0}>
              <InputLabel id='reassign-caretaker-label'>New Caretaker</InputLabel>
              <Select
                labelId='reassign-caretaker-label'
                label='New Caretaker'
                value={selectedCaretakerId || ''}
                onChange={(event) => onChangeCaretakerId(Number(event.target.value))}
              >
                {caretakers.map((caretaker) => (
                  <MenuItem key={caretaker.id} value={caretaker.id}>
                    {caretaker.username} - {caretaker.email || 'No email'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {!loading && caretakers.length === 0 && (
            <Alert severity='warning'>No eligible caretakers found.</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={onSubmit}
          disabled={loading || submitting || !selectedCaretakerId || caretakers.length === 0}
          className='bg-primary!'
        >
          {submitting ? 'Updating...' : 'Confirm Reassignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
