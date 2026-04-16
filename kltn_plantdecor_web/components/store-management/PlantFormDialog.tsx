'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  FormHelperText,
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
import type { PlantGuideFormData } from '@/types/admin-plant-guide.types';
import { FENG_SHUI_ELEMENT_OPTIONS } from '@/lib/utils/fengShui';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';
import { localizeRoomDesignEnumLabel } from '@/lib/utils/roomDesignEnumI18n';
import {
  PLANT_GUIDE_LABELS,
  BOOLEAN_FLAGS_LABELS,
  mapEditingDataToForm,
  getDefaultPlant,
  handleMultipleSelectChange,
  getValidationMessage,
} from './PlantFormDialog.utils';

interface OptionItem {
  id: number;
  name: string;
}

interface PlantFormDialogProps {
  open: boolean;
  editingData?: PlantDetail;
  plantGuideData?: PlantGuideFormData;
  categories: OptionItem[];
  tags: OptionItem[];
  enums: PlantEnumPayload;
  enumLoading: boolean;
  enumError: string | null;
  onClose: () => void;
  onSubmit: (data: PlantFormData, images: ImageUploadData[]) => void;
  isLoading?: boolean;
}

export default function PlantFormDialog({
  open,
  editingData,
  plantGuideData,
  categories,
  tags,
  enums,
  enumLoading,
  enumError,
  onClose,
  onSubmit,
  isLoading = false,
}: PlantFormDialogProps) {
  const tRoomDesignEnum = useTranslations('roomDesignEnums');
  const { control, handleSubmit, reset, setValue } = useForm<PlantFormData>({
    defaultValues: getDefaultPlant(),
  });
  const potIncluded = useWatch({ control, name: 'potIncluded' });

  const [images, setImages] = useState<ImageUploadData[]>([]);
  const [includePlantGuide, setIncludePlantGuide] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingData) {
      reset(mapEditingDataToForm(editingData, plantGuideData));
      setIncludePlantGuide(Boolean(plantGuideData));

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

    reset(getDefaultPlant());
    setIncludePlantGuide(false);
    setImages([]);
  }, [editingData, open, plantGuideData, reset]);

  useEffect(() => {
    if (!open || editingData || !includePlantGuide) {
      return;
    }

    if (enums.placementTypes[0]?.value !== undefined) {
      setValue('placementType', enums.placementTypes[0].value);
    }
    if (enums.sizes[0]?.value !== undefined) {
      setValue('size', enums.sizes[0].value);
    }
    if (enums.careLevelTypes[0]?.value !== undefined) {
      setValue('careLevelType', enums.careLevelTypes[0].value);
    }
    if (enums.lightRequirements[0]?.name && !editingData) {
      setValue('plantGuide.lightRequirement', enums.lightRequirements[0].name);
    }
  }, [editingData, enums.careLevelTypes, enums.lightRequirements, enums.placementTypes, enums.sizes, includePlantGuide, open, setValue]);

  const handleFormSubmit = (data: PlantFormData) => {
    onSubmit(
      includePlantGuide
        ? data
        : {
            ...data,
            plantGuide: undefined,
          },
      images
    );
  };

  const isEnumReady =
    enums.placementTypes.length > 0 &&
    enums.sizes.length > 0 &&
    enums.careLevelTypes.length > 0 &&
    enums.lightRequirements.length > 0;
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
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Plant name"
                      fullWidth
                      required
                      error={Boolean(fieldState.error)}
                      helperText={getValidationMessage(fieldState.error)}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="specificName"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Specific name"
                      fullWidth
                      required
                      error={Boolean(fieldState.error)}
                      helperText={getValidationMessage(fieldState.error)}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="origin"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Origin"
                      fullWidth
                      required
                      error={Boolean(fieldState.error)}
                      helperText={getValidationMessage(fieldState.error)}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="basePrice"
                  control={control}
                  rules={{ required: true, min: 0 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={formatCurrencyInput(field.value ?? 0, 'vi')}
                      label="Base price"
                      fullWidth
                      type="text"
                      inputProps={{ inputMode: 'numeric' }}
                      onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                      error={Boolean(fieldState.error)}
                      helperText={getValidationMessage(fieldState.error)}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      required
                      error={Boolean(fieldState.error)}
                      helperText={getValidationMessage(fieldState.error)}
                    />
                  )}
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
                  rules={{ required: true, min: 0 }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={Boolean(fieldState.error)}>
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
                      <FormHelperText>{getValidationMessage(fieldState.error)}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="size"
                  control={control}
                  rules={{ required: true, min: 0 }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={Boolean(fieldState.error)}>
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
                      <FormHelperText>{getValidationMessage(fieldState.error)}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="careLevelType"
                  control={control}
                  rules={{ required: true, min: 0 }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={Boolean(fieldState.error)}>
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
                      <FormHelperText>{getValidationMessage(fieldState.error)}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="careLevel"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Care level"
                      fullWidth
                      required
                      error={Boolean(fieldState.error)}
                      helperText={getValidationMessage(fieldState.error)}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="growthRate"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Growth rate"
                      fullWidth
                      required
                      error={Boolean(fieldState.error)}
                      helperText={getValidationMessage(fieldState.error)}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="roomType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Room type</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Room type"
                        value={field.value || []}
                        onChange={(event) => {
                          field.onChange(handleMultipleSelectChange(event.target.value as number[] | string[]));
                        }}
                        renderValue={(selected) => (
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                            {(selected as number[]).map((id) => {
                              const item = enums.roomTypes.find((option) => option.value === id);
                              return (
                                <Chip
                                  key={id}
                                  label={localizeRoomDesignEnumLabel(item?.name ?? id, tRoomDesignEnum, 'RoomType')}
                                  size="small"
                                />
                              );
                            })}
                          </Stack>
                        )}
                      >
                        {enums.roomTypes.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {localizeRoomDesignEnumLabel(item.name, tRoomDesignEnum, 'RoomType')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="roomStyle"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Room style</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Room style"
                        value={field.value || []}
                        onChange={(event) => {
                          field.onChange(handleMultipleSelectChange(event.target.value as number[] | string[]));
                        }}
                        renderValue={(selected) => (
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                            {(selected as number[]).map((id) => {
                              const item = enums.roomStyles.find((option) => option.value === id);
                              return (
                                <Chip
                                  key={id}
                                  label={localizeRoomDesignEnumLabel(item?.name ?? id, tRoomDesignEnum, 'RoomStyle')}
                                  size="small"
                                />
                              );
                            })}
                          </Stack>
                        )}
                      >
                        {enums.roomStyles.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {localizeRoomDesignEnumLabel(item.name, tRoomDesignEnum, 'RoomStyle')}
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
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth required error={Boolean(fieldState.error)}>
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
                      <FormHelperText>{getValidationMessage(fieldState.error)}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiMeaning"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Feng shui meaning"
                      fullWidth
                      required
                      error={Boolean(fieldState.error)}
                      helperText={getValidationMessage(fieldState.error)}
                    />
                  )}
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

                      return Boolean(value?.trim()) || 'Pot size is required when pot is included.';
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Pot size"
                      fullWidth
                      required={potIncluded}
                      error={Boolean(fieldState.error)}
                      helperText={getValidationMessage(fieldState.error)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Plant Guide
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Plant Guide is optional. You can add or update it later from the plant edit form or in
                  /admin/plant-guide-management.
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={includePlantGuide}
                    onChange={(event) => setIncludePlantGuide(event.target.checked)}
                  />
                }
                label="Add plant guide now"
              />

              {includePlantGuide && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="plantGuide.lightRequirement"
                      control={control}
                      rules={{ required: true }}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth required error={Boolean(fieldState.error)}>
                          <InputLabel>{PLANT_GUIDE_LABELS.lightRequirement}</InputLabel>
                          <Select {...field} label={PLANT_GUIDE_LABELS.lightRequirement}>
                            <MenuItem value="" disabled>
                              {PLANT_GUIDE_LABELS.lightRequirementPlaceholder}
                            </MenuItem>
                            {enums.lightRequirements.map((item) => (
                              <MenuItem key={item.value} value={item.name}>
                                {localizeRoomDesignEnumLabel(item.name, tRoomDesignEnum, 'LightRequirement')}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{getValidationMessage(fieldState.error)}</FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="plantGuide.watering"
                      control={control}
                      rules={{ required: true }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label={PLANT_GUIDE_LABELS.watering}
                          fullWidth
                          required
                          error={Boolean(fieldState.error)}
                          helperText={getValidationMessage(fieldState.error)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="plantGuide.fertilizing"
                      control={control}
                      rules={{ required: true }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label={PLANT_GUIDE_LABELS.fertilizing}
                          fullWidth
                          required
                          error={Boolean(fieldState.error)}
                          helperText={getValidationMessage(fieldState.error)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="plantGuide.pruning"
                      control={control}
                      rules={{ required: true }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label={PLANT_GUIDE_LABELS.pruning}
                          fullWidth
                          required
                          error={Boolean(fieldState.error)}
                          helperText={getValidationMessage(fieldState.error)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="plantGuide.temperature"
                      control={control}
                      rules={{ required: true }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label={PLANT_GUIDE_LABELS.temperature}
                          fullWidth
                          required
                          error={Boolean(fieldState.error)}
                          helperText={getValidationMessage(fieldState.error)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="plantGuide.humidity"
                      control={control}
                      rules={{ required: true }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label={PLANT_GUIDE_LABELS.humidity}
                          fullWidth
                          required
                          error={Boolean(fieldState.error)}
                          helperText={getValidationMessage(fieldState.error)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="plantGuide.soil"
                      control={control}
                      rules={{ required: true }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label={PLANT_GUIDE_LABELS.soil}
                          fullWidth
                          required
                          error={Boolean(fieldState.error)}
                          helperText={getValidationMessage(fieldState.error)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="plantGuide.careNotes"
                      control={control}
                      rules={{ required: true }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label={PLANT_GUIDE_LABELS.careNotes}
                          fullWidth
                          multiline
                          minRows={4}
                          required
                          error={Boolean(fieldState.error)}
                          helperText={getValidationMessage(fieldState.error)}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}
            </Stack>
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
                          field.onChange(handleMultipleSelectChange(event.target.value as number[] | string[]));
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
                          field.onChange(handleMultipleSelectChange(event.target.value as number[] | string[]));
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
              {(Object.entries(BOOLEAN_FLAGS_LABELS) as Array<[
                keyof typeof BOOLEAN_FLAGS_LABELS,
                string,
              ]>).map(
                ([fieldName, label]) => (
                  <Grid key={fieldName} size={{ xs: 6, sm: 3 }}>
                    <Controller
                      name={fieldName}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                          label={label}
                        />
                      )}
                    />
                  </Grid>
                )
              )}
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
