'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface RedeliveryConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RedeliveryConfirmationModal({
  open,
  onClose,
  onConfirm,
}: RedeliveryConfirmationModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Redelivery</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to mark this order for redelivery?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} sx={{backgroundColor: 'var(--primary)'}} variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}