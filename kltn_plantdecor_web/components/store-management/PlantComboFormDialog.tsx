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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import type { PlantCombo, ImageUploadData } from '@/types/store-management.types';

interface PlantComboFormDialogProps {
  open: boolean;
  editingData?: PlantCombo;
  onClose: () => void;
  onSubmit: (data: PlantCombo, images: ImageUploadData[]) => void;
  isLoading?: boolean;
}

const defaultCombo: PlantCombo = {
  plantComboId: 0,
  comboCode: '',
  comboName: '',
  comboType: '',
  description: '',
  suitableSpace: '',
  suitableRooms: '',
  fengShuiElement: '',
  fengShuiPurpose: '',
  themeName: '',
  themeDescription: '',
  originalPrice: 0,
  comboPrice: 0,
  discountPercent: 0,
  minPlants: 0,
  maxPlants: 0,
  tags: '',
  season: '',
  viewCount: 0,
  isActive: true,
};

export default function PlantComboFormDialog({
  open,
  editingData,
  onClose,
  onSubmit,
  isLoading = false,
}: PlantComboFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<PlantCombo>({
    defaultValues: defaultCombo,
  });

  const [images, setImages] = useState<ImageUploadData[]>([]);

  useEffect(() => {
    if (editingData) {
      reset(editingData);
      if (editingData.images) {
        setImages(
          editingData.images.map((img) => ({
            ...img,
            file: new File([], ''),
            preview: img.preview || img.url || '',
          }))
        );
      }
    } else {
      reset(defaultCombo);
      setImages([]);
    }
  }, [editingData, open, reset]);

  const handleFormSubmit = (data: PlantCombo) => {
    const submitData = {
      ...data,
      images: undefined,
    };
    onSubmit(submitData, images);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingData ? 'Chỉnh sửa combo cây' : 'Thêm combo cây mới'}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboCode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mã combo" fullWidth required />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Tên combo" fullWidth required />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboType"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Loại combo" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="season"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mùa" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mô tả" fullWidth multiline rows={3} />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Suitable Conditions */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Điều kiện phù hợp
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="suitableSpace"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Không gian phù hợp" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="suitableRooms"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Phòng phù hợp" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Feng Shui & Theme */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Phong Thủy & Chủ đề
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiElement"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Yếu tố phong thủy" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiPurpose"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mục đích phong thủy" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="themeName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Tên chủ đề" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="themeDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mô tả chủ đề" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12 }}>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tags (phân cách bằng dấu phẩy)"
                      fullWidth
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Pricing */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Định giá
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="originalPrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Giá gốc"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboPrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Giá combo"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="discountPercent"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phần trăm giảm giá (%)"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Plants Range */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Số lượng cây
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="minPlants"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Số cây tối thiểu"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="maxPlants"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Số cây tối đa"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Images */}
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            label="Hình ảnh combo"
            maxImages={10}
          />

          {/* Active Status */}
          <Box>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Kích hoạt"
                />
              )}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
