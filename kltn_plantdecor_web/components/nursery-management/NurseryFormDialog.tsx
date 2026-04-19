'use client';

import React, { useEffect } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { AdminNursery, AdminNurseryFormData } from '@/types/admin-nursery.types';

interface NurseryFormDialogProps {
  open: boolean;
  editingData?: AdminNursery;
  onClose: () => void;
  onSubmit: (data: AdminNurseryFormData) => void;
  isLoading?: boolean;
}

const defaultValues: AdminNurseryFormData = {
  name: '',
  address: '',
  area: '',
  latitude: '',
  longitude: '',
  phone: '',
  isActive: true,
};

const numberInputProps = {
  inputMode: 'decimal' as const,
};

export default function NurseryFormDialog({
  open,
  editingData,
  onClose,
  onSubmit,
  isLoading = false,
}: NurseryFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<AdminNurseryFormData>({
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingData) {
      reset({
        name: editingData.name || '',
        address: editingData.address || '',
        area: editingData.area != null ? String(editingData.area) : '',
        latitude: editingData.latitude != null ? String(editingData.latitude) : '',
        longitude: editingData.longitude != null ? String(editingData.longitude) : '',
        phone: editingData.phone || '',
        isActive: editingData.isActive,
      });
      return;
    }

    reset(defaultValues);
  }, [editingData, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingData ? 'Update Nursery' : 'Create New Nursery'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Nursery Name" required fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="address"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Address" required fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="phone"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Phone Number" required fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Area (m2)" fullWidth type="number" inputProps={numberInputProps} />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="latitude"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Latitude" fullWidth type="number" inputProps={numberInputProps} />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="longitude"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Longitude" fullWidth type="number" inputProps={numberInputProps} />
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                }
                label="Active"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading}
          className="bg-primary!"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
