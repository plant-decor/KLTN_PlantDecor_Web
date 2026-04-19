'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Stack,
  Divider,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import type { PlantInstance, ImageUploadData } from '@/types/store-management.types';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';

interface PlantInstanceFormDialogProps {
  open: boolean;
  editingData?: PlantInstance;
  onClose: () => void;
  onSubmit: (data: PlantInstance, images: ImageUploadData[]) => void;
  isLoading?: boolean;
}

const defaultInstance: PlantInstance = {
  id: 0,
  plantId: 0,
  currentNurseryId: 0,
  sku: '',
  specificPrice: 0,
  height: 0,
  trunkDiameter: 0,
  healthStatus: '',
  age: 0,
  description: '',
  status: 1,
};

export default function PlantInstanceFormDialog({
  open,
  editingData,
  onClose,
  onSubmit,
  isLoading = false,
}: PlantInstanceFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<PlantInstance>({
    defaultValues: defaultInstance,
  });

  const [images, setImages] = useState<ImageUploadData[]>([]);

  useEffect(() => {
    if (editingData) {
      reset(editingData);
      const existingImages = editingData.images;
      if (existingImages) {
        queueMicrotask(() => {
          setImages(
            existingImages.map((img) => ({
              ...img,
              file: new File([], ''),
              preview: img.preview || img.url || '',
            }))
          );
        });
      }
    } else {
      reset(defaultInstance);
      queueMicrotask(() => {
        setImages([]);
      });
    }
  }, [editingData, open, reset]);

  const handleFormSubmit = (data: PlantInstance) => {
    const submitData = {
      ...data,
      images: undefined,
    };
    onSubmit(submitData, images);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingData ? 'Edit Plant Instance' : 'Add New Plant Instance'}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="plantId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Plant ID"
                      fullWidth
                      type="number"
                      required
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="SKU" fullWidth required />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="currentNurseryId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nursery ID"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Status (1=Available, 2=Sold, etc.)"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Description" fullWidth multiline rows={2} />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Physical Specifications */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Physical Specifications
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="height"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Height (cm)"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="trunkDiameter"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Trunk Diameter (cm)"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="age"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Age (years)"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="healthStatus"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Health Status" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Pricing */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Price
            </Typography>
            <Controller
              name="specificPrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={formatCurrencyInput(field.value ?? 0, 'vi')}
                  label="Specific Price (VND)"
                  fullWidth
                  type="text"
                  inputProps={{ inputMode: 'numeric' }}
                  onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                />
              )}
            />
          </Box>

          <Divider />

          {/* Images */}
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            label="Plant Sample Images"
            maxImages={10}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
