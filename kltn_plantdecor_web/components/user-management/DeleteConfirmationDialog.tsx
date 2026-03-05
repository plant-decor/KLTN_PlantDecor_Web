'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { SampleUser } from '@/data/sampledata';

interface DeleteConfirmationDialogProps {
  open: boolean;
  user: SampleUser | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationDialog({
  open,
  user,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <Typography>
          Are you sure you want to delete <strong>{user?.userName}</strong>? This action
          cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
