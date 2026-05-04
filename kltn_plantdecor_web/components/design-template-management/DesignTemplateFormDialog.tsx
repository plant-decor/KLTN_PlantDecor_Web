'use client';

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import type {
  AdminDesignTemplateDetail,
  AdminDesignTemplateListItem,
  DesignTemplateRoomTypeOption,
  DesignTemplateSpecialization,
  DesignTemplateStyleOption,
  DesignTemplateTier,
} from '@/types/admin-design-template.types';
import { toast } from 'react-toastify';
import { CustomLoading } from '@/components/CustomLoading';
import {
  DESIGN_TEMPLATE_SAMPLE_IMAGE_MAX_BYTES,
  formatCurrency,
  formControlDisabledSelectBlackTextSx,
  textFieldDisabledBlackInputSx,
} from './designTemplateManagement.constants';
import { resolveDesignSampleImageSrc } from '@/lib/utils/designTemplateSampleImage';

const MULTI_SELECT_MENU_MAX_HEIGHT = 280;

const multiSelectMenuProps = {
  PaperProps: {
    sx: { maxHeight: MULTI_SELECT_MENU_MAX_HEIGHT },
  },
} as const;

export interface DesignTemplateFormValue {
  name: string;
  description: string;
  style: number;
  roomTypes: number[];
  imageFile: File | null;
  specializationIds: number[];
}

interface DesignTemplateFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  template: AdminDesignTemplateListItem | AdminDesignTemplateDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  formValue: DesignTemplateFormValue;
  styleOptions: DesignTemplateStyleOption[];
  roomTypeOptions: DesignTemplateRoomTypeOption[];
  specializationOptions: DesignTemplateSpecialization[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onFormChange: (updater: (prev: DesignTemplateFormValue) => DesignTemplateFormValue) => void;
  onAddTier?: () => void;
  onEditTier?: (tier: DesignTemplateTier) => void;
  onDeactivateTier?: (tier: DesignTemplateTier) => void;
  /** View mode only: open read-only tier detail (e.g. manager workspace). */
  onViewTier?: (tier: DesignTemplateTier) => void;
}

export default function DesignTemplateFormDialog({
  open,
  mode,
  template,
  detailLoading,
  detailError,
  formValue,
  styleOptions,
  roomTypeOptions,
  specializationOptions,
  submitting,
  onClose,
  onSubmit,
  onFormChange,
  onAddTier,
  onEditTier,
  onDeactivateTier,
  onViewTier,
}: DesignTemplateFormDialogProps) {
  const isView = mode === 'view';
  const isCreate = mode === 'create';

  const handleChangeField = <K extends keyof DesignTemplateFormValue>(field: K, value: DesignTemplateFormValue[K]) => {
    onFormChange((prev) => ({ ...prev, [field]: value }));
  };

  const [localPreviewUrl, setLocalPreviewUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (!formValue.imageFile) {
      setLocalPreviewUrl('');
      return;
    }

    const nextUrl = URL.createObjectURL(formValue.imageFile);
    setLocalPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [formValue.imageFile]);

  const rawPreviewUrl = localPreviewUrl || (typeof template?.imageUrl === 'string' ? template.imageUrl.trim() : '');

  const displayPreviewSrc = React.useMemo(() => resolveDesignSampleImageSrc(rawPreviewUrl), [rawPreviewUrl]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isCreate ? 'Create Design Template' : isView ? `Design Template #${template?.id ?? ''}` : `Edit Design Template #${template?.id ?? ''}`}
      </DialogTitle>
      <DialogContent dividers>
        {detailLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CustomLoading />
          </Box>
        ) : detailError ? (
          <Alert severity="error">{detailError}</Alert>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Template Name"
              value={formValue.name}
              onChange={(event) => handleChangeField('name', event.target.value)}
              disabled={isView || submitting}
              fullWidth
              required
              sx={textFieldDisabledBlackInputSx}
            />

            <TextField
              label="Description"
              value={formValue.description}
              onChange={(event) => handleChangeField('description', event.target.value)}
              disabled={isView || submitting}
              fullWidth
              multiline
              minRows={3}
              required
              sx={textFieldDisabledBlackInputSx}
            />

            <FormControl fullWidth sx={formControlDisabledSelectBlackTextSx}>
              <InputLabel id="design-template-style-label">Style</InputLabel>
              <Select
                labelId="design-template-style-label"
                label="Style"
                value={formValue.style}
                disabled={isView || submitting}
                onChange={(event) => handleChangeField('style', Number(event.target.value))}
              >
                {styleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={formControlDisabledSelectBlackTextSx}>
              <InputLabel id="room-types-label">Room Types</InputLabel>
              <Select
                labelId="room-types-label"
                multiple
                value={formValue.roomTypes}
                label="Room Types"
                disabled={isView || submitting}
                MenuProps={multiSelectMenuProps}
                onChange={(event) => handleChangeField('roomTypes', event.target.value as number[])}
                renderValue={(selected) => {
                  const ids = selected as number[];
                  if (isView) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, py: 0.25 }}>
                        {ids.map((id) => (
                          <Chip
                            key={id}
                            size="small"
                            variant="outlined"
                            label={roomTypeOptions.find((option) => option.value === id)?.label ?? id}
                          />
                        ))}
                      </Box>
                    );
                  }
                  return ids.map((id) => roomTypeOptions.find((option) => option.value === id)?.label ?? id).join(', ');
                }}
              >
                {roomTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={formValue.roomTypes.includes(option.value)} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isCreate ? (
              <Box>
                {/* <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Specializations
                </Typography> */}
                <FormControl fullWidth sx={formControlDisabledSelectBlackTextSx}>
                  <InputLabel id="specialization-ids-label">Specializations</InputLabel>
                  <Select
                    labelId="specialization-ids-label"
                    multiple
                    value={formValue.specializationIds}
                    label="Specializations"
                    disabled={submitting}
                    MenuProps={multiSelectMenuProps}
                    onChange={(event) => handleChangeField('specializationIds', event.target.value as number[])}
                    renderValue={(selected) =>
                      (selected as number[])
                        .map((id) => specializationOptions.find((option) => option.id === id)?.name ?? id)
                        .join(', ')
                    }
                  >
                    {specializationOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        <Checkbox checked={formValue.specializationIds.includes(option.id)} />
                        <ListItemText primary={option.name} secondary={option.description} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <FormControl fullWidth sx={formControlDisabledSelectBlackTextSx}>
                <InputLabel id="specializations-readonly-label">Specializations</InputLabel>
                <Select
                  labelId="specializations-readonly-label"
                  label="Specializations"
                  multiple
                  value={(template?.specializations ?? []).map((s) => s.id)}
                  disabled
                  MenuProps={multiSelectMenuProps}
                  renderValue={() => {
                    const list = template?.specializations ?? [];
                    if (!list.length) {
                      return (
                        <Typography variant="body2" component="span" sx={{ color: 'rgb(0, 0, 0)' }}>
                          No specialization data available.
                        </Typography>
                      );
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, py: 0.25 }}>
                        {list.map((item) => (
                          <Chip key={item.id} size="small" variant="outlined" label={item.name} />
                        ))}
                      </Box>
                    );
                  }}
                >
                  {(template?.specializations ?? []).map((item) => (
                    <MenuItem key={item.id} value={item.id} disabled>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {!isCreate && template ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Package tiers
                </Typography>
                {!isView && onAddTier ? (
                  <Button variant="outlined" size="small" onClick={() => onAddTier()} disabled={submitting}>
                    Add tier
                  </Button>
                ) : null}
                <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                  {template.tiers?.length ? (
                    template.tiers.map((tier) => (
                      <Stack
                        key={tier.id}
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ sm: 'center' }}
                        justifyContent="space-between"
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: tier.isActive ? 'background.paper' : 'action.hover',
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Typography fontWeight={600}>{tier.tierName}</Typography>
                            {!tier.isActive ? <Chip size="small" label="Inactive" color="default" variant="outlined" /> : null}
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(tier.packagePrice)} · {tier.minArea}–{tier.maxArea} m² · {tier.estimatedDays} day(s)
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexShrink={0} alignItems="center">
                          {isView && onViewTier ? (
                            <Tooltip title="View tier detail">
                              <IconButton size="small" color="primary" onClick={() => onViewTier(tier)} disabled={submitting} aria-label="View tier detail">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                          {!isView && onEditTier && onDeactivateTier ? (
                            <>
                              <Button size="small" variant="outlined" onClick={() => onEditTier(tier)} disabled={submitting}>
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="warning"
                                variant="outlined"
                                onClick={() => onDeactivateTier(tier)}
                                disabled={submitting || !tier.isActive}
                              >
                                Deactivate
                              </Button>
                            </>
                          ) : null}
                        </Stack>
                      </Stack>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No tiers yet. Add a package tier to offer pricing packages for this template.
                    </Typography>
                  )}
                </Stack>
              </Box>
            ) : null}

            <Box sx={{ pt: 0.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Design Sample Image
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
                <Box
                  sx={{
                    width: 160,
                    height: 160,
                    flexShrink: 0,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {displayPreviewSrc ? (
                    <Box
                      component="img"
                      src={displayPreviewSrc}
                      alt="Design sample image"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1, textAlign: 'center' }}>
                      No preview yet
                    </Typography>
                  )}
                </Box>
                <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={isView || submitting}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Choose image
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        event.target.value = '';
                        if (!file) {
                          handleChangeField('imageFile', null);
                          return;
                        }
                        if (file.size > DESIGN_TEMPLATE_SAMPLE_IMAGE_MAX_BYTES) {
                          toast.error(`Image must be at most ${DESIGN_TEMPLATE_SAMPLE_IMAGE_MAX_BYTES / (1024 * 1024)} MB.`);
                          return;
                        }
                        handleChangeField('imageFile', file);
                      }}
                    />
                  </Button>
                  {!isView && (
                    <Typography variant="caption" color="text.secondary">
                      {isCreate
                        ? `Required. Max ${DESIGN_TEMPLATE_SAMPLE_IMAGE_MAX_BYTES / (1024 * 1024)} MB.`
                        : `Optional. Leave empty to keep current image. Max ${DESIGN_TEMPLATE_SAMPLE_IMAGE_MAX_BYTES / (1024 * 1024)} MB.`}
                    </Typography>
                  )}
                  {!isView && formValue.imageFile && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => handleChangeField('imageFile', null)}
                      disabled={submitting}
                      sx={{ width: 'fit-content' }}
                    >
                      Remove selected
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
        {!isView && (
          <Button onClick={() => void onSubmit()} variant="contained" disabled={submitting || detailLoading}>
            {submitting ? 'Processing...' : isCreate ? 'Create' : 'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
