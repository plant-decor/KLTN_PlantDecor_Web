'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import type { AdminPlantGuideDetail } from '@/types/admin-plant-guide.types';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { localizeRoomDesignEnumLabel } from '@/lib/utils/roomDesignEnumI18n';

interface PlantGuideDetailDialogProps {
  open: boolean;
  guide?: AdminPlantGuideDetail | null;
  loading?: boolean;
  onClose: () => void;
}

const DetailField = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={600}>
      {value === null || value === undefined || value === '' ? '-' : String(value)}
    </Typography>
  </Box>
);

export default function PlantGuideDetailDialog({ open, guide, loading = false, onClose }: PlantGuideDetailDialogProps) {
  const tRoomDesignEnum = useTranslations('roomDesignEnums');
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết Plant Guide</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
        ) : guide ? (
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
                <Chip label={`ID #${guide.id}`} size="small" variant="outlined" />
                <Chip label={`Plant ID #${guide.plantId}`} size="small" color="primary" variant="outlined" />
                <Chip
                  label={localizeRoomDesignEnumLabel(
                    guide.lightRequirementName,
                    tRoomDesignEnum,
                    'LightRequirement'
                  )}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Stack>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {guide.plantName}
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField
                  label="Ánh sáng"
                  value={localizeRoomDesignEnumLabel(
                    guide.lightRequirementName,
                    tRoomDesignEnum,
                    'LightRequirement'
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Tưới nước" value={guide.watering} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Bón phân" value={guide.fertilizing} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Cắt tỉa" value={guide.pruning} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Nhiệt độ" value={guide.temperature} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Độ ẩm" value={guide.humidity} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Đất trồng" value={guide.soil} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(25, 118, 210, 0.06)' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Ghi chú chăm sóc
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {guide.careNotes}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Ngày tạo" value={formatDateTime(guide.createdAt)} />
              </Grid>
            </Grid>
          </Stack>
        ) : (
          <Typography color="text.secondary">Không có dữ liệu Plant Guide.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
