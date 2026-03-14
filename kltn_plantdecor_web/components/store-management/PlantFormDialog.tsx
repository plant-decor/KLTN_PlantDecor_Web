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
  Switch,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import type { Plant, PlantGuide, ImageUploadData } from '@/types/store-management.types';

interface PlantFormDialogProps {
  open: boolean;
  editingData?: Plant;
  onClose: () => void;
  onSubmit: (data: Plant, images: ImageUploadData[]) => void;
  isLoading?: boolean;
}

const defaultPlant: Plant = {
  plantId: 0,
  name: '',
  specificName: '',
  origin: '',
  description: '',
  basePrice: 0,
  placement: '',
  size: '',
  minHeight: 0,
  maxHeight: 0,
  growthRate: '',
  toxicity: false,
  airPurifying: false,
  hasFlower: false,
  fengShuiElement: '',
  fengShuiMeaning: '',
  potIncluded: false,
  potSize: '',
  plantType: '',
  careLevel: '',
  isActive: true,
};

export default function PlantFormDialog({
  open,
  editingData,
  onClose,
  onSubmit,
  isLoading = false,
}: PlantFormDialogProps) {
  const { control, handleSubmit, reset, watch } = useForm<Plant>({
    defaultValues: defaultPlant,
  });

  const [images, setImages] = useState<ImageUploadData[]>([]);
  const [showGuideFields, setShowGuideFields] = useState(false);
  const [guideData, setGuideData] = useState<PlantGuide>({
    plantId: 0,
    lightRequirement: '',
    watering: '',
    fertilizing: '',
    pruning: '',
    temperature: '',
    careNotes: '',
  });

  useEffect(() => {
    if (editingData) {
      reset(editingData);
      setShowGuideFields(!!editingData.guide);
      if (editingData.guide) {
        setGuideData(editingData.guide);
      }
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
      reset(defaultPlant);
      setImages([]);
      setShowGuideFields(false);
      setGuideData({
        plantId: 0,
        lightRequirement: '',
        watering: '',
        fertilizing: '',
        pruning: '',
        temperature: '',
        careNotes: '',
      });
    }
  }, [editingData, open, reset]);

  const handleFormSubmit = (data: Plant) => {
    const submitData = {
      ...data,
      guide: showGuideFields ? guideData : undefined,
      images: undefined,
    };
    onSubmit(submitData, images);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className=''>{editingData ? 'Chỉnh sửa cây' : 'Thêm cây mới'}</DialogTitle>
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
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Tên cây" fullWidth required />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="specificName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Tên khoa học" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="origin"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Xuất xứ" fullWidth />}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="plantType"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Loại cây" fullWidth />}
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

          {/* Size & Price */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Kích thước & Giá
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Kích thước" fullWidth />}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="basePrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Giá cơ bản"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 4 }}>
                <Controller
                  name="minHeight"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Chiều cao tối thiểu (cm)"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 4 }}>
                <Controller
                  name="maxHeight"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Chiều cao tối đa (cm)"
                      fullWidth
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 4 }}>
                <Controller
                  name="placement"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Vị trí đặt" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Growth & Care */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Sinh trưởng & Chăm sóc
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="growthRate"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Tốc độ sinh trưởng" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="careLevel"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mức độ chăm sóc" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 6, sm: 3 }}>
                <Controller
                  name="toxicity"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Có độc"
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 6, sm: 3 }}>
                <Controller
                  name="airPurifying"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Lọc không khí"
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 6, sm: 3 }}>
                <Controller
                  name="hasFlower"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Có hoa"
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 6, sm: 3 }}>
                <Controller
                  name="potIncluded"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Có chậu"
                    />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="potSize"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Kích thước chậu" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Feng Shui */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Phong Thủy
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
                  name="fengShuiMeaning"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Ý nghĩa phong thủy" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Plant Guide */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={showGuideFields}
                  onChange={(e) => setShowGuideFields(e.target.checked)}
                />
              }
              label="Thêm hướng dẫn chăm sóc"
            />
            {showGuideFields && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <TextField
                    value={guideData.lightRequirement}
                    onChange={(e) =>
                      setGuideData({ ...guideData, lightRequirement: e.target.value })
                    }
                    label="Yêu cầu ánh sáng"
                    fullWidth
                  />
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <TextField
                    value={guideData.watering}
                    onChange={(e) =>
                      setGuideData({ ...guideData, watering: e.target.value })
                    }
                    label="Tưới nước"
                    fullWidth
                  />
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <TextField
                    value={guideData.fertilizing}
                    onChange={(e) =>
                      setGuideData({ ...guideData, fertilizing: e.target.value })
                    }
                    label="Bón phân"
                    fullWidth
                  />
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <TextField
                    value={guideData.pruning}
                    onChange={(e) => setGuideData({ ...guideData, pruning: e.target.value })}
                    label="Cắt tỉa"
                    fullWidth
                  />
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <TextField
                    value={guideData.temperature}
                    onChange={(e) =>
                      setGuideData({ ...guideData, temperature: e.target.value })
                    }
                    label="Nhiệt độ"
                    fullWidth
                  />
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <TextField
                    value={guideData.careNotes}
                    onChange={(e) =>
                      setGuideData({ ...guideData, careNotes: e.target.value })
                    }
                    label="Ghi chú chăm sóc"
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            )}
          </Box>

          <Divider />

          {/* Images */}
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            label="Hình ảnh cây"
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
