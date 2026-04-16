'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Alert,
  Box,
  Button,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import type { PlantDetail, PlantEnumPayload } from '@/types/store-management.types';
import type { AdminPlantGuideDetail } from '@/types/admin-plant-guide.types';
import { getAdminPlantGuideByPlantId } from '@/lib/api/adminPlantGuidesService';
import { getFengShuiColors, getFengShuiElementLabel } from '@/lib/utils/fengShui';
import { formatCurrency } from '@/lib/utils/formatUtil';
import { localizeRoomDesignEnumLabel } from '@/lib/utils/roomDesignEnumI18n';

interface PlantViewDialogProps {
  open: boolean;
  plant?: PlantDetail;
  enums: PlantEnumPayload;
  onClose: () => void;
}

const getEnumLabel = (items: { value: number; name: string }[], value: number) => {
  return items.find((item) => item.value === value)?.name ?? String(value);
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('vi-VN');
};

const renderEnumChips = (ids: number[] | undefined, options: { value: number; name: string }[]) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return <Typography variant="body2" color="text.secondary">-</Typography>;
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {ids.map((id) => {
        const label = options.find((item) => item.value === id)?.name ?? String(id);
        return <Chip key={`enum-${id}`} size="small" label={label} variant="outlined" />;
      })}
    </Stack>
  );
};

const GuideField = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={600}>
      {value === null || value === undefined || value === '' ? '-' : String(value)}
    </Typography>
  </Box>
);

export default function PlantViewDialog({ open, plant, enums, onClose }: PlantViewDialogProps) {
  const tRoomDesignEnum = useTranslations('roomDesignEnums');
  const [guide, setGuide] = useState<AdminPlantGuideDetail | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !plant) {
      setGuide(null);
      setGuideError(null);
      setGuideLoading(false);
      return;
    }

    let cancelled = false;

    const loadGuide = async () => {
      setGuideLoading(true);
      setGuideError(null);

      try {
        const response = await getAdminPlantGuideByPlantId(plant.id, false);
        const payload = response.payload ?? response.data ?? null;
        if (!cancelled) {
          setGuide(payload);
        }
      } catch (error) {
        if (!cancelled) {
          setGuide(null);
          setGuideError(error instanceof Error ? error.message : 'Không thể tải Plant Guide');
        }
      } finally {
        if (!cancelled) {
          setGuideLoading(false);
        }
      }
    };

    void loadGuide();

    return () => {
      cancelled = true;
    };
  }, [open, plant]);

  if (!plant) return null;
  const fengShuiColors = getFengShuiColors(plant.fengShuiElement);
  const fengShuiLabel = getFengShuiElementLabel(plant.fengShuiElement);

  const renderBooleanCell = (value: boolean) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {value ? <Check sx={{ color: 'success.main', fontSize: 20 }} /> : <Close sx={{ color: 'error.main', fontSize: 20 }} />}
      <Typography variant="body2">{value ? 'Yes' : 'No'}</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Plant Detail</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {plant.images.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Images
              </Typography>
              <Grid container spacing={2}>
                {plant.images.map((img) => (
                  <Grid key={img.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <CardMedia component="img" image={img.imageUrl} alt={`Plant image ${img.id}`} sx={{ borderRadius: 1, height: 200, objectFit: 'cover' }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Basic information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight="600">{plant.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Specific name</Typography>
                <Typography variant="body1" fontWeight="600">{plant.specificName || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Origin</Typography>
                <Typography variant="body1" fontWeight="600">{plant.origin || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Placement</Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.placementTypeName || getEnumLabel(enums.placementTypes, plant.placementType)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{plant.description || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Properties
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Size</Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.sizeName || getEnumLabel(enums.sizes, plant.size)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Care level type</Typography>
                <Typography variant="body1" fontWeight="600">
                  {plant.careLevelTypeName || getEnumLabel(enums.careLevelTypes, plant.careLevelType)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Care level</Typography>
                <Typography variant="body1" fontWeight="600">{plant.careLevel}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Base price</Typography>
                <Typography variant="body1" fontWeight="600">
                  {formatCurrency(plant.basePrice, 'vi')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Growth rate</Typography>
                <Typography variant="body1" fontWeight="600">{plant.growthRate || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Pot size</Typography>
                <Typography variant="body1" fontWeight="600">{plant.potSize || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Total instances</Typography>
                <Typography variant="body1" fontWeight="600">{plant.totalInstances ?? 0}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Available instances</Typography>
                <Typography variant="body1" fontWeight="600">{plant.availableInstances ?? 0}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Room type</Typography>
                {renderEnumChips(
                  plant.roomType,
                  enums.roomTypes.map((item) => ({
                    ...item,
                    name: localizeRoomDesignEnumLabel(item.name, tRoomDesignEnum, 'RoomType'),
                  }))
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Room style</Typography>
                {renderEnumChips(
                  plant.roomStyle,
                  enums.roomStyles.map((item) => ({
                    ...item,
                    name: localizeRoomDesignEnumLabel(item.name, tRoomDesignEnum, 'RoomStyle'),
                  }))
                )}
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Feng Shui
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Element
                </Typography>
                <Chip
                  label={plant.fengShuiElement ? fengShuiLabel : '-'}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: fengShuiColors.bg,
                    color: fengShuiColors.text,
                    borderColor: fengShuiColors.border,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 7 }}>
                <Typography variant="body2" color="text.secondary">Meaning</Typography>
                <Typography variant="body1" fontWeight="600">{plant.fengShuiMeaning || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Plant Guide
            </Typography>
            {guideLoading ? (
              <Typography color="text.secondary">Đang tải hướng dẫn chăm sóc...</Typography>
            ) : guideError ? (
              <Alert severity="error">{guideError}</Alert>
            ) : guide ? (
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <GuideField
                    label="Ánh sáng"
                    value={localizeRoomDesignEnumLabel(
                      guide.lightRequirementName,
                      tRoomDesignEnum,
                      'LightRequirement'
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <GuideField label="Tưới nước" value={guide.watering} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <GuideField label="Bón phân" value={guide.fertilizing} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <GuideField label="Cắt tỉa" value={guide.pruning} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <GuideField label="Nhiệt độ" value={guide.temperature} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <GuideField label="Độ ẩm" value={guide.humidity} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <GuideField label="Đất trồng" value={guide.soil} />
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
            ) : (
              <Alert severity="info">Cây này chưa có Plant Guide.</Alert>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Booleans
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="body2" color="text.secondary">Toxicity</Typography>{renderBooleanCell(plant.toxicity)}</Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="body2" color="text.secondary">Air purifying</Typography>{renderBooleanCell(plant.airPurifying)}</Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="body2" color="text.secondary">Has flower</Typography>{renderBooleanCell(plant.hasFlower)}</Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="body2" color="text.secondary">Pet safe</Typography>{renderBooleanCell(plant.petSafe)}</Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="body2" color="text.secondary">Child safe</Typography>{renderBooleanCell(plant.childSafe)}</Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="body2" color="text.secondary">Pot included</Typography>{renderBooleanCell(plant.potIncluded)}</Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="body2" color="text.secondary">Unique instance</Typography>{renderBooleanCell(plant.isUniqueInstance)}</Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="body2" color="text.secondary">Active</Typography>{renderBooleanCell(plant.isActive)}</Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Categories
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
              {plant.categories.length > 0 ? plant.categories.map((category) => (
                <Chip key={category.id} label={category.name} size="small" variant="outlined" />
              )) : <Typography variant="body2" color="text.secondary">No categories</Typography>}
            </Stack>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {plant.tags.length > 0 ? plant.tags.map((tag) => (
                <Chip key={tag.id} label={tag.name || tag.tagName || `Tag #${tag.id}`} size="small" color="info" variant="outlined" />
              )) : <Typography variant="body2" color="text.secondary">No tags</Typography>}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Metadata
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Created at</Typography>
                <Typography variant="body1" fontWeight="600">{formatDateTime(plant.createdAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Updated at</Typography>
                <Typography variant="body1" fontWeight="600">{formatDateTime(plant.updatedAt)}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
