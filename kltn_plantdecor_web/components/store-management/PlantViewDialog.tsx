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
import type { PlantDetail, PlantEnumPayload } from '@/types/store-management.types';
import { getFengShuiColors } from '@/lib/utils/fengShui';

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

export default function PlantViewDialog({ open, plant, enums, onClose }: PlantViewDialogProps) {
  if (!plant) return null;
  const fengShuiColors = getFengShuiColors(plant.fengShuiElement);

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
                  {plant.basePrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
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
                  label={plant.fengShuiElement || '-'}
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

