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
import type { Material } from '@/types/store-management.types';

interface MaterialViewDialogProps {
  open: boolean;
  material?: Material;
  onClose: () => void;
}

export default function MaterialViewDialog({ open, material, onClose }: MaterialViewDialogProps) {
  if (!material) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết vật tư</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Images */}
          {material.images && material.images.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Hình ảnh
              </Typography>
              <Grid container spacing={2}>
                {material.images.map((img, index) => (
                  <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={img.preview || img.url}
                        alt={`Material ${index + 1}`}
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
                  Mã vật tư
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.materialCode}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tên vật tư
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.name}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Thương hiệu
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.brand}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Đơn vị
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.unit}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Mô tả
                </Typography>
                <Typography variant="body1">{material.description}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Pricing & Expiry */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Giá & Hạn sử dụng
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Giá cơ bản
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.basePrice.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Hạn sử dụng
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.expiryMonths} tháng
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Specifications */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Thông số kỹ thuật
            </Typography>
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              <pre>{JSON.stringify(material.specifications, null, 2)}</pre>
            </Box>
          </Box>

          <Divider />

          {/* Status */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Trạng thái
            </Typography>
            <Chip
              label={material.isActive ? 'Kích hoạt' : 'Vô hiệu'}
              color={material.isActive ? 'success' : 'error'}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
