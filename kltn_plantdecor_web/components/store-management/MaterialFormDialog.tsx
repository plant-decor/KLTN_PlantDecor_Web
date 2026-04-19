'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import type {
  MaterialDetail,
  MaterialFormData,
  ImageUploadData,
} from '@/types/store-management.types';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';

interface OptionItem {
  id: number;
  name: string;
}

interface MaterialFormDialogProps {
  open: boolean;
  editingData?: MaterialDetail;
  categories: OptionItem[];
  tags: OptionItem[];
  onClose: () => void;
  onSubmit: (data: MaterialFormData, images: ImageUploadData[]) => void;
  isLoading?: boolean;
}

const defaultMaterial: MaterialFormData = {
  materialCode: '',
  name: '',
  description: '',
  basePrice: 0,
  unit: '',
  brand: '',
  specifications: '',
  expiryMonths: null,
  isActive: true,
  categoryIds: [],
  tagIds: [],
};

export default function MaterialFormDialog({
  open,
  editingData,
  categories,
  tags,
  onClose,
  onSubmit,
  isLoading = false,
}: MaterialFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<MaterialFormData>({
    defaultValues: defaultMaterial,
  });

  const [images, setImages] = useState<ImageUploadData[]>([]);
  const [specsError, setSpecsError] = useState<string>('');

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingData) {
      reset({
        materialCode: editingData.materialCode,
        name: editingData.name,
        description: editingData.description || '',
        basePrice: editingData.basePrice,
        unit: editingData.unit,
        brand: editingData.brand,
        specifications: editingData.specifications
          ? JSON.stringify(editingData.specifications, null, 2)
          : '',
        expiryMonths: editingData.expiryMonths ?? null,
        isActive: editingData.isActive,
        categoryIds: editingData.categories.map((item) => item.id),
        tagIds: editingData.tags.map((item) => item.id),
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImages(
        editingData.images.map((image) => ({
          id: image.id,
          existingImageId: image.id,
          preview: image.imageUrl,
          url: image.imageUrl,
          isThumbnail: Boolean(image.isPrimary),
        }))
      );
    } else {
      reset(defaultMaterial);
      setImages([]);
    }

    setSpecsError('');
  }, [editingData, open, reset]);

  const handleFormSubmit = (data: MaterialFormData) => {
    const rawSpecs = data.specifications ?? '';
    const normalizedSpecs = rawSpecs.trim();

    if (normalizedSpecs) {
      try {
        JSON.parse(normalizedSpecs);
      } catch {
        setSpecsError('Invalid JSON format');
        return;
      }
    }

    setSpecsError('');
    onSubmit(
      {
        ...data,
        specifications: normalizedSpecs,
      },
      images
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingData ? 'Edit Material' : 'Create Material'}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Basic information
            </Typography>
            <Grid container spacing={2}>
              {/* <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="materialCode"
                  control={control}
                  rules={editingData ? undefined : { required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Material code"
                      fullWidth
                      required={!editingData}
                      InputProps={{ readOnly: Boolean(editingData) }}
                    />
                  )}
                />
              </Grid> */}
              <Grid size={{ xs: 24, sm: 12 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <TextField {...field} label="Material name" fullWidth required />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="brand"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Brand" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Unit" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Description" fullWidth multiline rows={3} />}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Price and expiry
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="basePrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={formatCurrencyInput(field.value ?? 0, 'vi')}
                      label="Base price"
                      fullWidth
                      type="text"
                      inputProps={{ inputMode: 'numeric' }}
                      onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="expiryMonths"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      value={field.value ?? ''}
                      label="Expiry months"
                      fullWidth
                      type="number"
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? null : Number(value));
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Categories and tags
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="categoryIds"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Categories</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Categories"
                        value={field.value || []}
                        onChange={(event) => {
                          const raw = event.target.value as number[] | string[];
                          field.onChange(raw.map((item) => Number(item)));
                        }}
                        renderValue={(selected) => (
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                            {(selected as number[]).map((id) => {
                              const item = categories.find((category) => category.id === id);
                              return <Chip key={id} label={item?.name ?? id} size="small" />;
                            })}
                          </Stack>
                        )}
                      >
                        {categories.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="tagIds"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Tags</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Tags"
                        value={field.value || []}
                        onChange={(event) => {
                          const raw = event.target.value as number[] | string[];
                          field.onChange(raw.map((item) => Number(item)));
                        }}
                        renderValue={(selected) => (
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                            {(selected as number[]).map((id) => {
                              const item = tags.find((tag) => tag.id === id);
                              return <Chip key={id} label={item?.name ?? id} size="small" />;
                            })}
                          </Stack>
                        )}
                      >
                        {tags.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Specifications (JSON)
            </Typography>
            <Controller
              name="specifications"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Specifications"
                  fullWidth
                  multiline
                  rows={6}
                  placeholder='{"color": "gray", "weight": "5kg"}'
                  error={Boolean(specsError)}
                  helperText={specsError}
                />
              )}
            />
          </Box> */}

          {/* <Divider /> */}

          <ImageUpload images={images} onImagesChange={setImages} label="Material images" maxImages={10} />

          <Box>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                  }
                  label="Active"
                />
              )}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" disabled={isLoading} className='bg-primary'>
          {isLoading ? 'Processing...' : 'Add Material'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
