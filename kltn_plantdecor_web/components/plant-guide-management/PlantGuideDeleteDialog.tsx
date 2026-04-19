'use client';

import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import type { AdminPlantGuideDetail } from '@/types/admin-plant-guide.types';

interface PlantGuideDeleteDialogProps {
  open: boolean;
  guide?: AdminPlantGuideDetail | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function PlantGuideDeleteDialog({
  open,
  guide,
  onClose,
  onConfirm,
  isLoading = false,
}: PlantGuideDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete Plant Guide</DialogTitle>
      <DialogContent>
        <Typography>
          {guide
            ? `Are you sure you want to delete the Plant Guide for "${guide.plantName}"?`
            : 'Are you sure you want to delete this Plant Guide?'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isLoading}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
