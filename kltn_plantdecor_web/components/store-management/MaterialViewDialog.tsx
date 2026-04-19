'use client';

import React from 'react';
import {
  Box,
  Button,
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
import type { MaterialDetail } from '@/types/store-management.types';
import { formatCurrency } from '@/lib/utils/formatUtil';

interface MaterialViewDialogProps {
  open: boolean;
  material?: MaterialDetail;
  onClose: () => void;
}

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

export default function MaterialViewDialog({ open, material, onClose }: MaterialViewDialogProps) {
  if (!material) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Material Detail</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {material.images.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Images
              </Typography>
              <Grid container spacing={2}>
                {material.images.map((image) => (
                  <Grid key={image.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={image.imageUrl}
                        alt={`Material image ${image.id}`}
                        sx={{ borderRadius: 1, height: 200, objectFit: 'cover', width: '100%' }}
                      />
                      {image.isPrimary && (
                        <Chip
                          label="Primary"
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
              Basic information
            </Typography>
            <Grid container spacing={2}>
              {/* <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Material code
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.materialCode}
                </Typography>
              </Grid> */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.name}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Brand
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.brand || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Unit
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.unit || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{material.description || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Price and status
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Base price
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {formatCurrency(material.basePrice, 'vi')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Expiry months
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {material.expiryMonths ?? '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={material.isActive ? 'Active' : 'Inactive'}
                  color={material.isActive ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Categories and tags
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Categories
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
              {material.categories.length > 0 ? (
                material.categories.map((category) => (
                  <Chip key={category.id} label={category.name} size="small" variant="outlined" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No categories
                </Typography>
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {material.tags.length > 0 ? (
                material.tags.map((tag) => (
                  <Chip key={tag.id} label={tag.tagName} size="small" color="info" variant="outlined" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No tags
                </Typography>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Specifications
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
              <pre>{JSON.stringify(material.specifications ?? {}, null, 2)}</pre>
            </Box>
          </Box> */}

          {/* <Divider /> */}

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Metadata
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Created at
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {formatDateTime(material.createdAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Updated at
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {formatDateTime(material.updatedAt)}
                </Typography>
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
