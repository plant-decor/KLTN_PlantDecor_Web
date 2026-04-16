'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Divider,
  Grid,
  Stack,
  Typography,
  CardMedia,
} from '@mui/material';
import type { PlantCombo } from '@/types/store-management.types';
import { getFengShuiColors, getFengShuiElementLabel } from '@/lib/utils/fengShui';
import { formatCurrency } from '@/lib/utils/formatUtil';
import { localizeRoomDesignEnumLabel } from '@/lib/utils/roomDesignEnumI18n';
import type { ShopNurseryListItem } from '@/lib/api/shopPlantsService';

interface PlantComboViewDialogProps {
  open: boolean;
  combo?: PlantCombo;
  lightRequirementOptions?: Array<{ value: number; name: string }>;
  roomTypeOptions?: Array<{ value: number; name: string }>;
  nurseries?: ShopNurseryListItem[];
  nurseriesLoading?: boolean;
  onClose: () => void;
}

export default function PlantComboViewDialog({
  open,
  combo,
  lightRequirementOptions = [],
  roomTypeOptions = [],
  nurseries = [],
  nurseriesLoading = false,
  onClose,
}: PlantComboViewDialogProps) {
  const tRoomDesignEnum = useTranslations('roomDesignEnums');
  if (!combo) {
    return null;
  }

  const fengShuiColors = getFengShuiColors(combo.fengShuiElement);
  const fengShuiLabel = getFengShuiElementLabel(combo.fengShuiElement);
  const suitableSpaceLabel =
    localizeRoomDesignEnumLabel(
      lightRequirementOptions.find((item) => item.value === Number(combo.suitableSpace))?.name,
      tRoomDesignEnum,
      'LightRequirement'
    ) ||
    (combo.suitableSpace ? String(combo.suitableSpace) : '-');
  const suitableRoomLabels = (combo.suitableRooms || []).map((id) => {
    return localizeRoomDesignEnumLabel(
      roomTypeOptions.find((item) => item.value === Number(id))?.name ?? String(id),
      tRoomDesignEnum,
      'RoomType'
    );
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Chi tiết combo cây</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {combo.images && combo.images.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Hình ảnh
              </Typography>
              <Grid container spacing={2}>
                {combo.images.map((img) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={img.id}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={img.imageUrl}
                        alt={combo.comboName}
                        sx={{ borderRadius: 1, height: 200, objectFit: 'cover' }}
                      />
                      {img.isPrimary && (
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

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Mã combo</Typography>
                <Typography variant="body1" fontWeight="600">{combo.comboCode}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Tên combo</Typography>
                <Typography variant="body1" fontWeight="600">{combo.comboName}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Loại combo</Typography>
                <Typography variant="body1">{combo.comboTypeName || combo.comboType}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Mùa</Typography>
                <Typography variant="body1">{combo.seasonName || combo.season}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">Mô tả</Typography>
                <Typography variant="body1">{combo.description || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Điều kiện phù hợp
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Không gian phù hợp</Typography>
                <Typography variant="body1">{suitableSpaceLabel}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Phòng phù hợp</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {(combo.suitableRooms || []).length === 0 ? (
                    <Typography variant="body1">-</Typography>
                  ) : (
                    suitableRoomLabels.map((roomLabel, index) => (
                      <Chip key={`${roomLabel}-${index}`} size="small" label={roomLabel} sx={{ mb: 0.5 }} />
                    ))
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Phong thủy và chủ đề
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Yếu tố phong thủy</Typography>
                <Chip
                  label={combo.fengShuiElement ? fengShuiLabel : '-'}
                  size="small"
                  variant="outlined"
                  sx={{
                    mt: 0.5,
                    fontWeight: 600,
                    backgroundColor: fengShuiColors.bg,
                    color: fengShuiColors.text,
                    borderColor: fengShuiColors.border,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Mục đích phong thủy</Typography>
                <Typography variant="body1">{combo.fengShuiPurpose || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Tên chủ đề</Typography>
                <Typography variant="body1">{combo.themeName || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Mô tả chủ đề</Typography>
                <Typography variant="body1">{combo.themeDescription || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tags
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {(combo.tagsNavigation || []).length === 0 ? (
                    <Typography variant="body1">-</Typography>
                  ) : (
                    combo.tagsNavigation?.map((tag) => <Chip key={tag.id} size="small" label={tag.tagName} sx={{ mb: 0.5 }} />)
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Giá và trạng thái
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Giá combo</Typography>
                <Typography variant="body1" fontWeight="600">{formatCurrency(combo.comboPrice, 'vi-VN')}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Lượt xem</Typography>
                <Typography variant="body1" fontWeight="600">{combo.viewCount}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Lượt mua</Typography>
                <Typography variant="body1" fontWeight="600">{combo.purchaseCount ?? 0}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Chip
                  label={combo.isActive ? 'Kích hoạt' : 'Vô hiệu'}
                  color={combo.isActive ? 'success' : 'default'}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Cây trong combo
            </Typography>
            {(combo.comboItems || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Combo chưa có cây.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {combo.comboItems?.map((item) => (
                  <Box key={item.id || `${item.plantId}-${item.plantName}`} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body1" fontWeight="600">
                      {item.plantName || `Plant #${item.plantId}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ghi chú: {item.notes || '-'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Danh sách vựa đang bán combo
            </Typography>
            {nurseriesLoading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  Đang tải danh sách vựa...
                </Typography>
              </Stack>
            ) : nurseries.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Chưa có vựa nào đang bán combo này.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {nurseries.map((nursery) => (
                  <Box
                    key={`${nursery.id}-${nursery.nurseryPlantComboId ?? 0}`}
                    sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">{nursery.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{nursery.address}</Typography>
                        <Typography variant="body2" color="text.secondary">{nursery.phone}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Manager: {nursery.managerName || 'N/A'}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={nursery.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                        color={nursery.isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
