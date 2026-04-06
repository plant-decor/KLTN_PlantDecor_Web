'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import type {
  ImageUploadData,
  Plant,
  PlantCombo,
  PlantComboFormData,
} from '@/types/store-management.types';
import { FENG_SHUI_ELEMENT_OPTIONS } from '@/lib/utils/fengShui';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';

interface OptionItem {
  id: number;
  name: string;
}

interface PlantComboFormDialogProps {
  open: boolean;
  editingData?: PlantCombo;
  plants: Plant[];
  plantsLoading?: boolean;
  tags: OptionItem[];
  onClose: () => void;
  onSubmit: (data: PlantComboFormData, images: ImageUploadData[]) => void;
  isLoading?: boolean;
}

const COMBO_TYPE_OPTIONS = [
  { value: 1, label: 'Space' },
  { value: 2, label: 'Fengshui' },
  { value: 3, label: 'Theme' },
];

const SEASON_OPTIONS = [
  { value: 1, label: 'All' },
  { value: 2, label: 'Spring' },
  { value: 3, label: 'Summer' },
  { value: 4, label: 'Autumn' },
  { value: 5, label: 'Winter' },
  { value: 6, label: 'Tet' },
];

const defaultCombo: PlantComboFormData = {
  comboCode: '',
  comboName: '',
  comboType: 1,
  description: '',
  suitableSpace: '',
  suitableRooms: [],
  fengShuiElement: 0,
  fengShuiPurpose: '',
  themeName: '',
  themeDescription: '',
  comboPrice: 0,
  season: 1,
  isActive: true,
  tagIds: [],
  comboItems: [],
};

export default function PlantComboFormDialog({
  open,
  editingData,
  plants,
  plantsLoading = false,
  tags,
  onClose,
  onSubmit,
  isLoading = false,
}: PlantComboFormDialogProps) {
  const { control, handleSubmit, reset, setValue, getValues } = useForm<PlantComboFormData>({
    defaultValues: defaultCombo,
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: 'comboItems',
  });

  const suitableRooms = useWatch({ control, name: 'suitableRooms' }) || [];

  const [images, setImages] = useState<ImageUploadData[]>([]);
  const [roomDraft, setRoomDraft] = useState('');

  const plantOptions = useMemo(() => {
    return plants.map((item) => ({ id: item.id, name: item.name }));
  }, [plants]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingData) {
      reset({
        comboCode: editingData.comboCode || '',
        comboName: editingData.comboName || '',
        comboType: editingData.comboType || 1,
        description: editingData.description || '',
        suitableSpace: editingData.suitableSpace || '',
        suitableRooms: editingData.suitableRooms || [],
        fengShuiElement: editingData.fengShuiElement || 0,
        fengShuiPurpose: editingData.fengShuiPurpose || '',
        themeName: editingData.themeName || '',
        themeDescription: editingData.themeDescription || '',
        comboPrice: Number(editingData.comboPrice) || 0,
        season: editingData.season || 1,
        isActive: editingData.isActive,
        tagIds: editingData.tagsNavigation?.map((item) => item.id) || [],
        comboItems:
          editingData.comboItems?.map((item) => ({
            id: item.id,
            plantComboId: item.plantComboId,
            plantId: item.plantId,
            plantName: item.plantName,
            quantity: item.quantity,
            notes: item.notes ?? '',
          })) || [],
      });

      setImages(
        (editingData.images || []).map((img) => ({
          id: img.id,
          existingImageId: img.id,
          preview: img.imageUrl,
          url: img.imageUrl,
          isThumbnail: Boolean(img.isPrimary),
          createdAt: img.createdAt,
        }))
      );
      return;
    }

    reset(defaultCombo);
    setImages([]);
    setRoomDraft('');
  }, [editingData, open, reset]);

  const handleAddRoom = () => {
    const value = roomDraft.trim();
    if (!value) {
      return;
    }

    const current = getValues('suitableRooms');
    if (current.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setRoomDraft('');
      return;
    }

    setValue('suitableRooms', [...current, value], { shouldDirty: true });
    setRoomDraft('');
  };

  const handleRemoveRoom = (index: number) => {
    const next = suitableRooms.filter((_, roomIndex) => roomIndex !== index);
    setValue('suitableRooms', next, { shouldDirty: true });
  };

  const handleFormSubmit = (data: PlantComboFormData) => {
    const normalizedData: PlantComboFormData = {
      ...data,
      suitableRooms: data.suitableRooms.map((item) => item.trim()).filter(Boolean),
      comboItems: data.comboItems
        .map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          notes: item.notes?.trim() || '',
        }))
        .filter((item) => item.plantId > 0),
    };

    onSubmit(normalizedData, images);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{editingData ? 'Chỉnh sửa combo cây' : 'Thêm combo cây mới'}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboCode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mã combo" fullWidth required disabled={Boolean(editingData)} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboName"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Tên combo" fullWidth required />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Loại combo</InputLabel>
                      <Select
                        {...field}
                        value={field.value}
                        label="Loại combo"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        {COMBO_TYPE_OPTIONS.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="season"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Mùa</InputLabel>
                      <Select
                        {...field}
                        value={field.value}
                        label="Mùa"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        {SEASON_OPTIONS.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Mô tả" fullWidth multiline rows={3} />}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Điều kiện phù hợp
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="suitableSpace"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Không gian phù hợp" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Thêm phòng phù hợp"
                  fullWidth
                  value={roomDraft}
                  onChange={(event) => setRoomDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddRoom();
                    }
                  }}
                  helperText="Nhấn Enter hoặc nút Thêm"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {suitableRooms.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có phòng phù hợp
                    </Typography>
                  )}
                  {suitableRooms.map((room, index) => (
                    <Chip
                      key={`${room}-${index}`}
                      label={room}
                      onDelete={() => handleRemoveRoom(index)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" size="small" onClick={handleAddRoom}>
                  Thêm phòng
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Phong thủy và chủ đề
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiElement"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Yếu tố phong thủy</InputLabel>
                      <Select
                        {...field}
                        value={field.value}
                        label="Yếu tố phong thủy"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        <MenuItem value={0}>Chọn mệnh</MenuItem>
                        {FENG_SHUI_ELEMENT_OPTIONS.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiPurpose"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Mục đích phong thủy" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="themeName"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Tên chủ đề" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="themeDescription"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Mô tả chủ đề" fullWidth />}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Giá và tags
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboPrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={formatCurrencyInput(field.value ?? 0, 'vi')}
                      label="Giá combo"
                      fullWidth
                      type="text"
                      inputProps={{ inputMode: 'numeric' }}
                      onChange={(event) => field.onChange(parseCurrencyInput(event.target.value))}
                    />
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
                        input={<OutlinedInput label="Tags" />}
                        value={field.value || []}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(typeof value === 'string' ? value.split(',').map(Number) : value);
                        }}
                        renderValue={(selected) => (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {(selected as number[]).map((id) => {
                              const item = tags.find((tag) => tag.id === id);
                              return <Chip key={id} size="small" label={item?.name || id} sx={{ mb: 0.5 }} />;
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

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Danh sách cây trong combo
            </Typography>
            {itemFields.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Chưa có cây trong combo, vui lòng thêm ít nhất 1 cây.
              </Typography>
            )}
            <Stack spacing={1.5}>
              {itemFields.map((item, index) => (
                <Stack key={item.id} direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start">
                  <Controller
                    name={`comboItems.${index}.plantId`}
                    control={control}
                    render={({ field }) => (
                      <FormControl sx={{ minWidth: 260 }}>
                        <InputLabel>Cây</InputLabel>
                        <Select
                          {...field}
                          value={field.value || 0}
                          label="Cây"
                          onChange={(event) => field.onChange(Number(event.target.value))}
                          disabled={plantsLoading}
                        >
                          <MenuItem value={0}>Chọn cây</MenuItem>
                          {plantOptions.map((plant) => (
                            <MenuItem key={plant.id} value={plant.id}>
                              {plant.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  <Controller
                    name={`comboItems.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Số lượng"
                        type="number"
                        sx={{ width: 140 }}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    )}
                  />

                  <Controller
                    name={`comboItems.${index}.notes`}
                    control={control}
                    render={({ field }) => <TextField {...field} label="Ghi chú" sx={{ minWidth: 260, flex: 1 }} />}
                  />

                  <IconButton color="error" onClick={() => removeItem(index)}>
                    <Delete />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
            <Button
              startIcon={<Add />}
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => appendItem({ plantId: 0, quantity: 1, notes: '' })}
            >
              Thêm cây vào combo
            </Button>
          </Box>

          <Divider />

          <ImageUpload images={images} onImagesChange={setImages} label="Hình ảnh combo" maxImages={10} />

          <Box>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Chip
                  label={field.value ? 'Đang kích hoạt' : 'Đang vô hiệu'}
                  color={field.value ? 'success' : 'default'}
                  onClick={() => setValue('isActive', !field.value)}
                  clickable
                />
              )}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" disabled={isLoading}>
          {isLoading ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
