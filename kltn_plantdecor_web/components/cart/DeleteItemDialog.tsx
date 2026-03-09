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

interface DeleteItemDialogProps {
  open: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteItemDialog({
  open,
  isUpdating,
  onClose,
  onConfirm,
}: DeleteItemDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Remove Item from Cart</DialogTitle>
      <DialogContent>
        <Typography sx={{ mt: 2 }}>
          Are you sure you want to remove this item from your cart?
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
          sx={{ backgroundColor: '#d32f2f' }}
        >
          {isUpdating ? (
            <CircularProgress size={20} aria-label="Removing item" />
          ) : (
            'Remove'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
