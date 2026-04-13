'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
      <DialogTitle>Giao caretaker cho đơn #{target?.id}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : eligibleCaretakers.length === 0 ? (
          <Alert severity="warning">Không có caretaker đủ điều kiện cho đơn này.</Alert>
        ) : (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="eligible-caretaker-select">Caretaker phù hợp</InputLabel>
              <Select
                labelId="eligible-caretaker-select"
                label="Caretaker phù hợp"
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
              Đơn sẽ được giao cho caretaker đang có kỹ năng phù hợp với gói dịch vụ.
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting || loading}>
          Hủy
        </Button>
        <Button
          onClick={onConfirm}
          disabled={submitting || loading || eligibleCaretakers.length === 0 || !selectedCaretakerId}
          variant="contained"
        >
          {submitting ? 'Đang xử lý...' : 'Xác nhận giao'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
