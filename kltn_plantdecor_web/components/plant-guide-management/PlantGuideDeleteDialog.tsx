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
      <DialogTitle>Xác nhận xóa Plant Guide</DialogTitle>
      <DialogContent>
        <Typography>
          {guide
            ? `Bạn có chắc muốn xóa Plant Guide của "${guide.plantName}" không?`
            : 'Bạn có chắc muốn xóa Plant Guide này không?'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isLoading}>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}
