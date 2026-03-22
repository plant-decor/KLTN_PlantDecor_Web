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
import type { PlantCombo } from '@/types/store-management.types';

interface PlantComboViewDialogProps {
  open: boolean;
  combo?: PlantCombo;
  onClose: () => void;
}

export default function PlantComboViewDialog({ open, combo, onClose }: PlantComboViewDialogProps) {
  if (!combo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết combo cây</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Images */}
          {combo.images && combo.images.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Hình ảnh
              </Typography>
              <Grid container spacing={2}>
                {combo.images.map((img, index) => (
                  <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={img.preview || img.url}
                        alt={`Combo ${index + 1}`}
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
                  Mã combo
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.comboCode}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tên combo
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.comboName}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Loại combo
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.comboType}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Mùa
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.season}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Mô tả
                </Typography>
                <Typography variant="body1">{combo.description}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Suitable Conditions */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Điều kiện phù hợp
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Không gian phù hợp
                </Typography>
                <Typography variant="body1">{combo.suitableSpace}</Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Phòng phù hợp
                </Typography>
                <Typography variant="body1">{combo.suitableRooms}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Feng Shui & Theme */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Phong Thủy & Chủ đề
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Yếu tố phong thủy
                </Typography>
                <Typography variant="body1">{combo.fengShuiElement}</Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Mục đích phong thủy
                </Typography>
                <Typography variant="body1">{combo.fengShuiPurpose}</Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tên chủ đề
                </Typography>
                <Typography variant="body1">{combo.themeName}</Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Mô tả chủ đề
                </Typography>
                <Typography variant="body1">{combo.themeDescription}</Typography>
              </Grid>
              {combo.tags && (
                <Grid sx={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tags
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {combo.tags.split(',').map((tag, idx) => (
                      <Chip key={idx} label={tag.trim()} size="small" />
                    ))}
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider />

          {/* Pricing */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Định giá
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Giá gốc
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.originalPrice.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Giá combo
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.comboPrice.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Giảm giá
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.discountPercent}%
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Plants Range */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Số lượng cây
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tối thiểu
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.minPlants}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tối đa
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.maxPlants}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Status & Views */}
          <Box>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Lượt xem
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {combo.viewCount}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Chip
                  label={combo.isActive ? 'Kích hoạt' : 'Vô hiệu'}
                  color={combo.isActive ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
