'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Button,
  CircularProgress,
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
        Chuyển caretaker cho phiên #{target?.id || '-'}
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
            Chọn caretaker mới đủ điều kiện (đúng chuyên môn, không trùng lịch) để thay thế cho phiên chăm sóc này.
          </Typography>

          {error && <Alert severity='error'>{error}</Alert>}

          {loading ? (
            <Stack direction='row' spacing={1} alignItems='center'>
              <CircularProgress size={22} />
              <Typography variant='body2'>Đang tải caretaker đủ điều kiện...</Typography>
            </Stack>
          ) : (
            <FormControl fullWidth size='small' disabled={submitting || caretakers.length === 0}>
              <InputLabel id='reassign-caretaker-label'>Caretaker mới</InputLabel>
              <Select
                labelId='reassign-caretaker-label'
                label='Caretaker mới'
                value={selectedCaretakerId || ''}
                onChange={(event) => onChangeCaretakerId(Number(event.target.value))}
              >
                {caretakers.map((caretaker) => (
                  <MenuItem key={caretaker.id} value={caretaker.id}>
                    {caretaker.username} - {caretaker.email || 'Không có email'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {!loading && caretakers.length === 0 && (
            <Alert severity='warning'>Không có caretaker phù hợp để chuyển cho phiên này.</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          variant='contained'
          onClick={onSubmit}
          disabled={loading || submitting || !selectedCaretakerId || caretakers.length === 0}
          className='bg-primary!'
        >
          {submitting ? 'Đang chuyển...' : 'Xác nhận chuyển'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
