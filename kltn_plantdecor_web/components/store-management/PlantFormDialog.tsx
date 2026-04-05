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
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Alert,
  Chip,
} from '@mui/material';
import { Controller, useForm, useWatch } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import type {
  PlantDetail,
  PlantEnumPayload,
  PlantFormData,
  ImageUploadData,
} from '@/types/store-management.types';
import { FENG_SHUI_ELEMENT_OPTIONS } from '@/lib/utils/fengShui';

interface OptionItem {
  id: number;
  name: string;
}

interface PlantFormDialogProps {
  open: boolean;
  editingData?: PlantDetail;
  categories: OptionItem[];
  tags: OptionItem[];
  enums: PlantEnumPayload;
  enumLoading: boolean;
  enumError: string | null;
  onClose: () => void;
  onSubmit: (data: PlantFormData, images: ImageUploadData[]) => void;
  isLoading?: boolean;
}

const defaultPlant: PlantFormData = {
  name: '',
  specificName: '',
  origin: '',
  description: '',
  basePrice: 0,
  placementType: 0,
  size: 0,
  growthRate: '',
  toxicity: false,
  airPurifying: false,
  hasFlower: false,
  petSafe: false,
  childSafe: false,
  fengShuiElement: 0,
  fengShuiMeaning: '',
  potIncluded: false,
  potSize: '',
  careLevelType: 0,
  careLevel: '',
  isActive: true,
  isUniqueInstance: false,
  categoryIds: [],
  tagIds: [],
};

export default function PlantFormDialog({
  open,
  editingData,
  categories,
  tags,
  enums,
  enumLoading,
  enumError,
  onClose,
  onSubmit,
  isLoading = false,
}: PlantFormDialogProps) {
  const { control, handleSubmit, reset, setValue } = useForm<PlantFormData>({
    defaultValues: defaultPlant,
  });
  const potIncluded = useWatch({ control, name: 'potIncluded' });

  const [images, setImages] = useState<ImageUploadData[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingData) {
      reset({
        name: editingData.name,
        specificName: editingData.specificName || '',
        origin: editingData.origin || '',
        description: editingData.description || '',
        basePrice: editingData.basePrice,
        placementType: editingData.placementType,
        size: editingData.size,
        growthRate: editingData.growthRate || '',
        toxicity: editingData.toxicity,
        airPurifying: editingData.airPurifying,
        hasFlower: editingData.hasFlower,
        petSafe: editingData.petSafe,
        childSafe: editingData.childSafe,
        fengShuiElement: editingData.fengShuiElement ?? 0,
        fengShuiMeaning: editingData.fengShuiMeaning || '',
        potIncluded: editingData.potIncluded,
        potSize: editingData.potSize || '',
        careLevelType: editingData.careLevelType,
        careLevel: editingData.careLevel,
        isActive: editingData.isActive,
        isUniqueInstance: editingData.isUniqueInstance,
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
          isThumbnail: false,
        }))
      );
      return;
    }

    reset(defaultPlant);
    setImages([]);
  }, [editingData, open, reset]);

  useEffect(() => {
    if (!open || editingData) {
      return;
    }

    if (enums.placementTypes[0]?.value) {
      setValue('placementType', enums.placementTypes[0].value);
    }
    if (enums.sizes[0]?.value) {
      setValue('size', enums.sizes[0].value);
    }
    if (enums.careLevelTypes[0]?.value) {
      setValue('careLevelType', enums.careLevelTypes[0].value);
    }
  }, [editingData, enums.careLevelTypes, enums.placementTypes, enums.sizes, open, setValue]);

  const handleFormSubmit = (data: PlantFormData) => {
    onSubmit(data, images);
  };

  const isEnumReady =
    enums.placementTypes.length > 0 && enums.sizes.length > 0 && enums.careLevelTypes.length > 0;
  const disableSubmit = isLoading || enumLoading || Boolean(enumError) || !isEnumReady;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingData ? 'Edit Plant' : 'Create Plant'}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {enumError && <Alert severity="error">Failed to load plant enums. Please retry later.</Alert>}

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Basic information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <TextField {...field} label="Plant name" fullWidth required />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="specificName"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <TextField {...field} label="Specific name" fullWidth required />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="origin"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <TextField {...field} label="Origin" fullWidth required />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="basePrice"
                  control={control}
                  rules={{ required: true, min: 0 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Base price"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <TextField {...field} label="Description" fullWidth multiline rows={3} required />}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Plant attributes
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="placementType"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Placement type</InputLabel>
                      <Select
                        {...field}
                        label="Placement type"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        {enums.placementTypes.map((item) => (
                          <MenuItem key={item.value} value={item.value}>{item.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="size"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Size</InputLabel>
                      <Select
                        {...field}
                        label="Size"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        {enums.sizes.map((item) => (
                          <MenuItem key={item.value} value={item.value}>{item.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="careLevelType"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Care level type</InputLabel>
                      <Select
                        {...field}
                        label="Care level type"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        {enums.careLevelTypes.map((item) => (
                          <MenuItem key={item.value} value={item.value}>{item.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="careLevel"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <TextField {...field} label="Care level" fullWidth required />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="growthRate"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <TextField {...field} label="Growth rate" fullWidth required />}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Extra properties
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiElement"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <FormControl fullWidth required>
                      <InputLabel>Feng shui element</InputLabel>
                      <Select
                        {...field}
                        label="Feng shui element"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        <MenuItem value={0} disabled>
                          Select element
                        </MenuItem>
                        {FENG_SHUI_ELEMENT_OPTIONS.map((item) => (
                          <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiMeaning"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <TextField {...field} label="Feng shui meaning" fullWidth required />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="potSize"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!potIncluded) {
                        return true;
                      }

                      return Boolean(value?.trim());
                    },
                  }}
                  render={({ field }) => <TextField {...field} label="Pot size" fullWidth required={potIncluded} />}
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
                          <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
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
                          <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Boolean flags
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6, sm: 3 }}><Controller name="toxicity" control={control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Toxicity" />} /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><Controller name="airPurifying" control={control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Air purifying" />} /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><Controller name="hasFlower" control={control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Has flower" />} /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><Controller name="petSafe" control={control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Pet safe" />} /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><Controller name="childSafe" control={control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Child safe" />} /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><Controller name="potIncluded" control={control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Pot included" />} /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><Controller name="isUniqueInstance" control={control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Unique instance" />} /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><Controller name="isActive" control={control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Active" />} /></Grid>
            </Grid>
          </Box>

          <Divider />

          <ImageUpload images={images} onImagesChange={setImages} label="Plant images" maxImages={10} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" disabled={disableSubmit}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
