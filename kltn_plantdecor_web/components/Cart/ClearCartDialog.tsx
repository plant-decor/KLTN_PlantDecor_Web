'use client';

import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

interface ClearCartDialogProps {
  open: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ClearCartDialog({
  open,
  isUpdating,
  onClose,
  onConfirm,
}: ClearCartDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Clear Shopping Cart</DialogTitle>
      <DialogContent>
        <Typography sx={{ mt: 2 }}>
          Are you sure you want to clear your entire shopping cart? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#666' }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isUpdating}
          variant="contained"
          sx={{ backgroundColor: '#d32f2f', color: '#fff' }}
        >
          {isUpdating ? <CircularProgress size={32} /> : 'Clear Cart'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
