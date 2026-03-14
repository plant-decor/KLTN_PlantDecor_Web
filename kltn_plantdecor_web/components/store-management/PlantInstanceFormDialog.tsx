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
      reset(defaultInstance);
      setImages([]);
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
      <DialogTitle>{editingData ? 'Chỉnh sửa mẫu cây' : 'Thêm mẫu cây mới'}</DialogTitle>
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
                  name="plantId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ID Cây"
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
                      label="ID Vườn ươm"
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
                      label="Trạng thái (1=Có sẵn, 2=Đã bán, etc.)"
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
                    <TextField {...field} label="Mô tả" fullWidth multiline rows={2} />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Physical Specifications */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Thông số vật lý
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="height"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Chiều cao (cm)"
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
                      label="Đường kính thân (cm)"
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
                      label="Tuổi (năm)"
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
                    <TextField {...field} label="Tình trạng sức khỏe" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Pricing */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Giá
            </Typography>
            <Controller
              name="specificPrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Giá cụ thể"
                  fullWidth
                  type="number"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              )}
            />
          </Box>

          <Divider />

          {/* Images */}
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            label="Hình ảnh mẫu cây"
            maxImages={10}
          />
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
