'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  Divider,
  Stack,
  Chip,
  CardMedia,
} from '@mui/material';
import type { PlantInstance } from '@/types/store-management.types';

interface PlantInstanceViewDialogProps {
  open: boolean;
  instance?: PlantInstance;
  onClose: () => void;
}

const getStatusLabel = (status: number) => {
  const statusMap: Record<number, string> = {
    1: 'Có sẵn',
    2: 'Đã bán',
    3: 'Hư hỏng',
    4: 'Không bán',
  };
  return statusMap[status] || 'Không xác định';
};

export default function PlantInstanceViewDialog({
  open,
  instance,
  onClose,
}: PlantInstanceViewDialogProps) {
  if (!instance) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết mẫu cây</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Images */}
          {instance.images && instance.images.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Hình ảnh
              </Typography>
              <Grid container spacing={2}>
                {instance.images.map((img, index) => (
                  <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={img.preview || img.url}
                        alt={`Instance ${index + 1}`}
                        sx={{ borderRadius: 1, height: 200, objectFit: 'cover' }}
                      />
                      {img.isThumbnail && (
                        <Chip
                          label="Ảnh chính"
                          size="small"
                          color="primary"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Divider />

          {/* Basic Info */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  SKU
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {instance.sku}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  ID Cây
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {instance.plantId}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  ID Vườn ươm
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {instance.currentNurseryId}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Chip
                  label={getStatusLabel(instance.status)}
                  color={instance.status === 1 ? 'success' : 'warning'}
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              {instance.description && (
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1">{instance.description}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider />

          {/* Physical Specifications */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Thông số vật lý
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Chiều cao
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {instance.height} cm
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Đường kính thân
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {instance.trunkDiameter} cm
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tuổi
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {instance.age} năm
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tình trạng sức khỏe
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {instance.healthStatus}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Pricing */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Giá cụ thể
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {instance.specificPrice.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
