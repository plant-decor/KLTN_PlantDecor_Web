'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { CustomLoading } from '@/components/CustomLoading';
import {
  deleteManagerPlantInstanceImage,
  getManagerPlantInstanceById,
  replaceManagerPlantInstanceImage,
  setPrimaryManagerPlantInstanceImage,
  updateManagerPlantInstance,
  uploadManagerPlantInstanceImages,
  uploadManagerPlantInstanceThumbnail,
} from '@/lib/api/managerStoreCatalogService';
import type { ResponseModel } from '@/types/api.types';
import type {
  PlantInstanceDetail,
  PlantInstanceEnumValue,
  UpdatePlantInstanceRequest,
} from '@/types/manager-store-catalog.types';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { generatePlantInstanceSku } from '@/lib/utils/plantInstanceSku';

interface PlantInstanceDetailDialogProps {
  open: boolean;
  instanceId: number | null;
  readOnly?: boolean;
  /** Mở dialog ở chế độ xem hoặc chỉnh sửa (mặc định view) */
  defaultMode?: 'view' | 'edit';
  /** Tên manager (vườn) — dùng khi sinh SKU */
  managerName?: string;
  statusOptions?: PlantInstanceEnumValue[];
  onClose: () => void;
  onUpdated: () => void;
}

interface EditFormState {
  sku: string;
  specificPrice: number;
  height: number;
  trunkDiameter: number | null;
  healthStatus: string;
  age: number;
  description: string;
}

const statusColorMap: Record<number, 'success' | 'warning' | 'default' | 'error' | 'info'> = {
  1: 'success',
  2: 'default',
  3: 'warning',
  4: 'error',
  5: 'info',
};

const getPayload = <T,>(response: ResponseModel<T>): T | undefined => {
  return response.payload ?? response.data;
};

const buildFormFromDetail = (detail: PlantInstanceDetail): EditFormState => ({
  sku: detail.sku ?? '',
  specificPrice: detail.specificPrice ?? 0,
  height: detail.height ?? 0,
  trunkDiameter: detail.trunkDiameter ?? null,
  healthStatus: detail.healthStatus ?? '',
  age: detail.age ?? 0,
  description: detail.description ?? '',
});

const parseNumberValue = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseNullableNumberValue = (value: string): number | null => {
  if (value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function PlantInstanceDetailDialog({
  open,
  instanceId,
  readOnly = false,
  defaultMode = 'view',
  managerName = '',
  statusOptions = [],
  onClose,
  onUpdated,
}: PlantInstanceDetailDialogProps) {
  const [detail, setDetail] = useState<PlantInstanceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageBusyId, setImageBusyId] = useState<number | null>(null);
  const [galleryBusy, setGalleryBusy] = useState<'add' | 'thumbnail' | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [form, setForm] = useState<EditFormState | null>(null);

  const replaceInputsRef = useRef<Record<number, HTMLInputElement | null>>({});
  const addImagesInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  const statusLabel = useMemo(() => {
    if (!detail) return '';
    if (detail.statusName) return detail.statusName;
    return statusOptions.find((option) => option.value === detail.status)?.name ?? `Status ${detail.status}`;
  }, [detail, statusOptions]);

  const fetchDetail = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const response = await getManagerPlantInstanceById(id, true);
      const payload = getPayload(response);
      if (payload) {
        setDetail(payload);
        let formState = buildFormFromDetail(payload);
        if (defaultMode === 'edit') {
          const sku =
            formState.sku.trim() ||
            generatePlantInstanceSku({
              plantName: payload.plantName,
              managerName,
            });
          formState = { ...formState, sku };
        }
        setForm(formState);
      } else {
        setDetail(null);
        setForm(null);
      }
    } catch {
      setDetail(null);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [defaultMode, managerName]);

  useEffect(() => {
    if (!open || !instanceId) {
      return;
    }
    setMode(defaultMode);
    void fetchDetail(instanceId);
  }, [open, instanceId, fetchDetail, defaultMode]);

  useEffect(() => {
    if (!open) {
      setDetail(null);
      setForm(null);
      setMode('view');
      setImageBusyId(null);
      setGalleryBusy(null);
    }
  }, [open]);

  const isMutating = submitting || imageBusyId !== null || galleryBusy !== null;

  const handleGenerateSku = () => {
    if (!detail || !form) return;
    setForm((prev) => {
      if (!prev || !detail) return prev;
      return {
        ...prev,
        sku: generatePlantInstanceSku({
          plantName: detail.plantName,
          managerName,
        }),
      };
    });
  };

  const handleCancelEdit = () => {
    if (!detail) return;
    setForm(buildFormFromDetail(detail));
    setMode('view');
  };

  const handleSave = async () => {
    if (!detail || !form || readOnly) return;
    let sku = form.sku.trim();
    if (!sku) {
      sku = generatePlantInstanceSku({
        plantName: detail.plantName,
        managerName,
      });
      setForm((prev) => (prev ? { ...prev, sku } : prev));
    }
    if (!(form.specificPrice > 0)) {
      toast.error('Specific price must be greater than 0');
      return;
    }
    if (!(form.height > 0)) {
      toast.error('Height must be greater than 0');
      return;
    }
    if (!form.healthStatus.trim()) {
      toast.error('Health status is required');
      return;
    }

    const request: UpdatePlantInstanceRequest = {
      sku,
      specificPrice: form.specificPrice,
      height: form.height,
      trunkDiameter: form.trunkDiameter,
      healthStatus: form.healthStatus.trim(),
      age: form.age,
      description: form.description,
    };

    setSubmitting(true);
    try {
      const response = await updateManagerPlantInstance(detail.id, request, true);
      const payload = getPayload(response);
      if (payload) {
        setDetail(payload);
        setForm(buildFormFromDetail(payload));
      }
      toast.success('Plant instance updated successfully');
      setMode('view');
      onUpdated();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  const triggerReplaceImage = (imageId: number) => {
    const input = replaceInputsRef.current[imageId];
    input?.click();
  };

  const handleReplaceImage = async (
    imageId: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!detail) return;
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImageBusyId(imageId);
    try {
      const response = await replaceManagerPlantInstanceImage(detail.id, imageId, file, true);
      const payload = getPayload(response);
      if (payload) {
        setDetail(payload);
      }
      toast.success('Image replaced successfully');
      onUpdated();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setImageBusyId(null);
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    if (!detail) return;
    setImageBusyId(imageId);
    try {
      const response = await setPrimaryManagerPlantInstanceImage(detail.id, imageId, true);
      const payload = getPayload(response);
      if (payload) {
        setDetail(payload);
      }
      toast.success('Primary image updated');
      onUpdated();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setImageBusyId(null);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!detail) return;
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    setImageBusyId(imageId);
    try {
      const response = await deleteManagerPlantInstanceImage(detail.id, imageId, true);
      const payload = getPayload(response);
      if (payload) {
        setDetail(payload);
      }
      toast.success('Image deleted');
      onUpdated();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setImageBusyId(null);
    }
  };

  const handleAddImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!detail) return;
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    if (files.length === 0) return;

    setGalleryBusy('add');
    try {
      await uploadManagerPlantInstanceImages(detail.id, files, true);
      await fetchDetail(detail.id);
      toast.success('Images uploaded successfully');
      onUpdated();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setGalleryBusy(null);
    }
  };

  const handleReplaceThumbnail = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!detail) return;
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setGalleryBusy('thumbnail');
    try {
      await uploadManagerPlantInstanceThumbnail(detail.id, file, true);
      await fetchDetail(detail.id);
      toast.success('Thumbnail updated successfully');
      onUpdated();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setGalleryBusy(null);
    }
  };

  const renderViewMode = () => {
    if (!detail) return null;
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Plant</Typography>
              <Typography variant="body1" fontWeight={600}>
                {detail.plantName} (ID: {detail.plantId})
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">SKU</Typography>
              <Typography variant="body1" fontWeight={600}>{detail.sku || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip
                size="small"
                label={statusLabel}
                color={statusColorMap[detail.status] ?? 'default'}
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Specific Price</Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(detail.specificPrice, 'vi')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Created</Typography>
              <Typography variant="body2">{formatDateTime(detail.createdAt)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Updated</Typography>
              <Typography variant="body2">{formatDateTime(detail.updatedAt)}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Nursery
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Name</Typography>
              <Typography variant="body1" fontWeight={600}>
                {detail.nurseryName} (ID: {detail.currentNurseryId})
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Phone</Typography>
              <Typography variant="body2">{detail.nurseryPhone || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">Address</Typography>
              <Typography variant="body2">{detail.nurseryAddress || '-'}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Physical Specifications
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">Height</Typography>
              <Typography variant="body1" fontWeight={600}>{detail.height} cm</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">Trunk Diameter</Typography>
              <Typography variant="body1" fontWeight={600}>
                {detail.trunkDiameter !== null && detail.trunkDiameter !== undefined
                  ? `${detail.trunkDiameter} cm`
                  : '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">Age</Typography>
              <Typography variant="body1" fontWeight={600}>{detail.age} years</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">Health</Typography>
              <Typography variant="body1" fontWeight={600}>{detail.healthStatus || '-'}</Typography>
            </Grid>
          </Grid>
        </Box>

        {detail.description ? (
          <>
            <Divider />
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {detail.description}
              </Typography>
            </Box>
          </>
        ) : null}
      </Stack>
    );
  };

  const renderEditMode = () => {
    if (!form) return null;
    return (
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Update the editable fields below. Fields marked with * are required.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                fullWidth
                label="SKU *"
                value={form.sku}
                onChange={(event) => setForm((prev) => (prev ? { ...prev, sku: event.target.value } : prev))}
                disabled={submitting}
                helperText="Leave blank to auto-generate on save, or use Generate."
              />
              <Button variant="outlined" size="small" sx={{ mt: 1, flexShrink: 0 }} onClick={handleGenerateSku} disabled={submitting}>
                Generate
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Specific Price *"
              value={formatCurrencyInput(form.specificPrice, 'vi')}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, specificPrice: parseCurrencyInput(event.target.value) } : prev))
              }
              inputProps={{ inputMode: 'numeric' }}
              disabled={submitting}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label="Height (cm) *"
              type="number"
              value={form.height}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, height: parseNumberValue(event.target.value) } : prev))
              }
              disabled={submitting}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label="Trunk Diameter (cm)"
              type="number"
              value={form.trunkDiameter ?? ''}
              onChange={(event) =>
                setForm((prev) =>
                  prev ? { ...prev, trunkDiameter: parseNullableNumberValue(event.target.value) } : prev
                )
              }
              disabled={submitting}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label="Age (years)"
              type="number"
              value={form.age}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, age: parseNumberValue(event.target.value) } : prev))
              }
              disabled={submitting}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label="Health Status *"
              value={form.healthStatus}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, healthStatus: event.target.value } : prev))
              }
              disabled={submitting}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, description: event.target.value } : prev))
              }
              disabled={submitting}
            />
          </Grid>
        </Grid>
      </Stack>
    );
  };

  const renderImageGallery = () => {
    if (!detail) return null;
    const images = detail.images ?? [];

    return (
      <Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Images ({images.length})
          </Typography>
          {!readOnly ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isMutating}

              >
                {galleryBusy === 'thumbnail' ? 'Uploading...' : 'Replace Thumbnail'}
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddPhotoAlternateIcon />}
                onClick={() => addImagesInputRef.current?.click()}
                disabled={isMutating}
                sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {galleryBusy === 'add' ? 'Uploading...' : 'Add Images'}
              </Button>
              <input
                type="file"
                accept="image/*"
                hidden
                ref={thumbnailInputRef}
                onChange={(event) => void handleReplaceThumbnail(event)}
              />
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                ref={addImagesInputRef}
                onChange={(event) => void handleAddImages(event)}
              />
            </Stack>
          ) : null}
        </Stack>

        {images.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderColor: 'divider' }}
          >
            <Typography variant="body2" color="text.secondary">
              No images uploaded yet.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {images.map((image) => {
              const isBusy = imageBusyId === image.id;
              return (
                <Grid key={image.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden',
                      borderColor: image.isPrimary ? 'primary.main' : 'divider',
                      borderWidth: image.isPrimary ? 2 : 1,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={image.imageUrl}
                      alt={`Plant instance image ${image.id}`}
                      sx={{ height: 200, objectFit: 'cover' }}
                    />
                    {image.isPrimary ? (
                      <Chip
                        size="small"
                        color="primary"
                        icon={<StarIcon />}
                        label="Primary"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        className='text-white! bg-primary!'
                      />
                    ) : null}

                    {isBusy ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        <CustomLoading size={28} />
                      </Box>
                    ) : null}

                    {!readOnly ? (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 0.5,
                          backgroundColor: 'rgba(0,0,0,0.55)',
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          ref={(node) => {
                            replaceInputsRef.current[image.id] = node;
                          }}
                          onChange={(event) => void handleReplaceImage(image.id, event)}
                        />
                        <IconButton
                          size="small"
                          title="Replace image"
                          sx={{ color: '#fff' }}
                          onClick={() => triggerReplaceImage(image.id)}
                          disabled={isMutating}
                        >
                          <SwapHorizIcon fontSize="small" className='text-white!' />
                        </IconButton>
                        <IconButton
                          size="small"
                          title={image.isPrimary ? 'Already primary' : 'Set as primary'}
                          sx={{ color: image.isPrimary ? '#facc15' : '#fff' }}
                          onClick={() => void handleSetPrimary(image.id)}
                          disabled={isMutating || image.isPrimary}
                        >
                          {image.isPrimary ? (
                            <StarIcon fontSize="small" className='text-white!' />
                          ) : (
                            <StarBorderIcon fontSize="small" className='text-white!' />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Delete image"
                          sx={{ color: '#ff8a80' }}
                          onClick={() => void handleDeleteImage(image.id)}
                          disabled={isMutating}
                        >
                          <DeleteIcon fontSize="small" className='text-white!' />
                        </IconButton>
                      </Stack>
                    ) : null}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={isMutating ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h6" component="span" fontWeight={700}>
            {mode === 'edit' ? 'Edit Plant Instance' : 'Plant Instance Details'}
          </Typography>
          {detail ? (
            <Chip size="small" label={`#${detail.id}`} variant="outlined" />
          ) : null}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" onClick={onClose} disabled={isMutating}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '80vh' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CustomLoading size={32} />
          </Box>
        ) : !detail ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No plant instance data available.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {mode === 'edit' ? renderEditMode() : renderViewMode()}
            <Divider />
            {renderImageGallery()}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {mode === 'edit' ? (
          <>
            <Button onClick={handleCancelEdit} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => void handleSave()}
              disabled={!detail || !form || submitting}
              sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} disabled={isMutating}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
