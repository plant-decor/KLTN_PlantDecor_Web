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
import { Check, Close } from '@mui/icons-material';
import type { Plant } from '@/types/store-management.types';

interface PlantViewDialogProps {
  open: boolean;
  plant?: Plant;
  onClose: () => void;
}

export default function PlantViewDialog({ open, plant, onClose }: PlantViewDialogProps) {
  if (!plant) return null;

  const renderBooleanCell = (value: boolean) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {value ? (
        <Check sx={{ color: 'success.main', fontSize: 20 }} />
      ) : (
        <Close sx={{ color: 'error.main', fontSize: 20 }} />
      )}
      <Typography variant="body2">{value ? 'Có' : 'Không'}</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết cây</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Images */}
          {plant.images && plant.images.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Hình ảnh
              </Typography>
              <Grid container spacing={2}>
                {plant.images.map((img, index) => (
                  <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={img.preview || img.url}
                        alt={`Plant ${index + 1}`}
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
                  Tên cây
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.name}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tên khoa học
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.specificName}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Xuất xứ
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.origin}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Loại cây
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.plantType}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Mô tả
                </Typography>
                <Typography variant="body1">{plant.description}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Size & Price */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Kích thước & Giá
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Kích thước
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.size}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Giá cơ bản
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.basePrice.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Chiều cao tối thiểu
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.minHeight} cm
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Chiều cao tối đa
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.maxHeight} cm
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Vị trí đặt
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.placement}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Growth & Care */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Sinh trưởng & Chăm sóc
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tốc độ sinh trưởng
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.growthRate}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Mức độ chăm sóc
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.careLevel}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Độc
                </Typography>
                {renderBooleanCell(plant.toxicity)}
              </Grid>
              <Grid sx={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Lọc không khí
                </Typography>
                {renderBooleanCell(plant.airPurifying)}
              </Grid>
              <Grid sx={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Có hoa
                </Typography>
                {renderBooleanCell(plant.hasFlower)}
              </Grid>
              <Grid sx={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Có chậu
                </Typography>
                {renderBooleanCell(plant.potIncluded)}
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Kích thước chậu
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.potSize}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Feng Shui */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Phong Thủy
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Yếu tố phong thủy
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.fengShuiElement}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Ý nghĩa phong thủy
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.fengShuiMeaning}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Guide */}
          {plant.guide && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Hướng dẫn chăm sóc
                </Typography>
                <Grid container spacing={2}>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Yêu cầu ánh sáng
                    </Typography>
                    <Typography variant="body1">{plant.guide.lightRequirement}</Typography>
                  </Grid>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tưới nước
                    </Typography>
                    <Typography variant="body1">{plant.guide.watering}</Typography>
                  </Grid>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bón phân
                    </Typography>
                    <Typography variant="body1">{plant.guide.fertilizing}</Typography>
                  </Grid>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Cắt tỉa
                    </Typography>
                    <Typography variant="body1">{plant.guide.pruning}</Typography>
                  </Grid>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nhiệt độ
                    </Typography>
                    <Typography variant="body1">{plant.guide.temperature}</Typography>
                  </Grid>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ghi chú chăm sóc
                    </Typography>
                    <Typography variant="body1">{plant.guide.careNotes}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}

          {/* Status */}
          <Divider />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Trạng thái
            </Typography>
            <Chip
              label={plant.isActive ? 'Kích hoạt' : 'Vô hiệu'}
              color={plant.isActive ? 'success' : 'error'}
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
