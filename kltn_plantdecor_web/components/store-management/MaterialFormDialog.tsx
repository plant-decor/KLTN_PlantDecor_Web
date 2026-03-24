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
import type { Material, ImageUploadData } from '@/types/store-management.types';

interface MaterialFormDialogProps {
  open: boolean;
  editingData?: Material;
  onClose: () => void;
  onSubmit: (data: Material, images: ImageUploadData[]) => void;
  isLoading?: boolean;
}

const defaultMaterial: Material = {
  id: 0,
  materialCode: '',
  name: '',
  description: '',
  basePrice: 0,
  unit: '',
  brand: '',
  specifications: {},
  expiryMonths: 0,
  isActive: true,
};

export default function MaterialFormDialog({
  open,
  editingData,
  onClose,
  onSubmit,
  isLoading = false,
}: MaterialFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<Material>({
    defaultValues: defaultMaterial,
  });

  const [images, setImages] = useState<ImageUploadData[]>([]);
  const [specs, setSpecs] = useState<string>('{}');
  const [specsError, setSpecsError] = useState<string>('');

  useEffect(() => {
    if (editingData) {
      reset(editingData);
      setSpecs(JSON.stringify(editingData.specifications || {}, null, 2));
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
      reset(defaultMaterial);
      setSpecs('{}');
      setImages([]);
    }
    setSpecsError('');
  }, [editingData, open, reset]);

  const handleFormSubmit = (data: Material) => {
    try {
      const parsedSpecs = JSON.parse(specs);
      const submitData = {
        ...data,
        specifications: parsedSpecs,
        images: undefined,
      };
      onSubmit(submitData, images);
    } catch (error) {
      setSpecsError('JSON không hợp lệ');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingData ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}</DialogTitle>
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
                  name="materialCode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mã vật tư" fullWidth required />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Tên vật tư" fullWidth required />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="brand"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Thương hiệu" fullWidth />
                  )}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Đơn vị (kg, lít, cái, etc.)" fullWidth />
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

          {/* Pricing & Expiry */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Giá & Hạn sử dụng
            </Typography>
            <Grid container spacing={2}>
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
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Controller
                  name="expiryMonths"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Hạn sử dụng (tháng)"
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

          {/* Specifications */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Thông số kỹ thuật (JSON)
            </Typography>
            <TextField
              value={specs}
              onChange={(e) => {
                setSpecs(e.target.value);
                setSpecsError('');
              }}
              label="Thông số kỹ thuật"
              fullWidth
              multiline
              rows={6}
              placeholder='{"color": "xanh", "size": "lớn"}'
              error={!!specsError}
              helperText={specsError}
              sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
          </Box>

          <Divider />

          {/* Images */}
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            label="Hình ảnh vật tư"
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
