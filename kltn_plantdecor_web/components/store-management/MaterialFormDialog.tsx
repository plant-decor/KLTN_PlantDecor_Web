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
import RichTextEditor from './RichTextEditor';
import MaterialSpecificationsSection, {
  buildSpecificationsJson,
  defaultSpecs,
  parseEditingSpecsToForm,
  type MaterialSpecsFormSlice,
} from './MaterialSpecificationsSection';
import { uploadAdminMaterialImages } from '@/lib/api/adminMaterialsService';
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

type UnknownApiResponse = { payload?: unknown; data?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function readImageUrlFromUnknownPayload(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const images = payload.images;
  if (Array.isArray(images) && images.length > 0) {
    const last = images.at(-1);
    if (isRecord(last) && typeof last.imageUrl === 'string' && last.imageUrl.trim()) {
      return last.imageUrl;
    }
    const maybeLast = images[images.length - 1];
    if (isRecord(maybeLast) && typeof maybeLast.imageUrl === 'string' && maybeLast.imageUrl.trim()) {
      return maybeLast.imageUrl;
    }
  }

  if (typeof payload.imageUrl === 'string' && payload.imageUrl.trim()) {
    return payload.imageUrl;
  }

  return null;
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

type MaterialSpecFormValues = MaterialFormData & MaterialSpecsFormSlice;

export default function MaterialFormDialog({
  open,
  editingData,
  categories,
  tags,
  onClose,
  onSubmit,
  isLoading = false,
}: MaterialFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<MaterialSpecFormValues>({
    defaultValues: { ...defaultMaterial, ...defaultSpecs },
  });

  const [images, setImages] = useState<ImageUploadData[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Handle image upload for RichTextEditor
  const handleRichTextImageUpload = async (file: File): Promise<string> => {
    if (!editingData?.id) {
      throw new Error('Material must be created first before uploading images to description');
    }

    setUploadingImage(true);
    try {
      const response = await uploadAdminMaterialImages(editingData.id, [file], true);

      const candidate = response as UnknownApiResponse;
      const payload = candidate.payload ?? candidate.data;
      const imageUrl = readImageUrlFromUnknownPayload(payload);

      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      return imageUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingData) {
      const parsedSpecs = parseEditingSpecsToForm(editingData.specifications);
      reset({
        materialCode: editingData.materialCode,
        name: editingData.name,
        description: editingData.description || '',
        basePrice: editingData.basePrice,
        unit: editingData.unit,
        brand: editingData.brand,
        specifications: '',
        expiryMonths: editingData.expiryMonths ?? null,
        isActive: editingData.isActive,
        categoryIds: editingData.categories.map((item) => item.id),
        tagIds: editingData.tags.map((item) => item.id),
        ...parsedSpecs,
      });

      queueMicrotask(() => {
        setImages(
          editingData.images.map((image) => ({
            id: image.id,
            existingImageId: image.id,
            preview: image.imageUrl,
            url: image.imageUrl,
            isThumbnail: Boolean(image.isPrimary),
          }))
        );
      });
    } else {
      reset({ ...defaultMaterial, ...defaultSpecs });
      setImages([]);
    }
  }, [editingData, open, reset]);

  const handleFormSubmit = (data: MaterialSpecFormValues) => {
    const specifications = buildSpecificationsJson(data);
    onSubmit(
      {
        ...data,
        specifications,
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
                  render={({ field }) => (
                    <RichTextEditor
                      {...field}
                      label="Description"
                      placeholder="Enter material description with rich formatting..."
                      minHeight={200}
                      onUploadImage={editingData?.id ? handleRichTextImageUpload : undefined}
                      uploading={uploadingImage}
                    />
                  )}
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

          <MaterialSpecificationsSection control={control} />

          <Divider />

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
