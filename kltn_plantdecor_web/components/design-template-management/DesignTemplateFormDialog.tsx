'use client';

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type {
  AdminDesignTemplateDetail,
  AdminDesignTemplateListItem,
  DesignTemplateRoomTypeOption,
  DesignTemplateSpecialization,
  DesignTemplateStyleOption,
} from '@/types/admin-design-template.types';
import { CustomLoading } from '@/components/CustomLoading';

export interface DesignTemplateFormValue {
  name: string;
  description: string;
  style: number;
  roomTypes: number[];
  imageUrl: string;
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
}: DesignTemplateFormDialogProps) {
  const isView = mode === 'view';
  const isCreate = mode === 'create';

  const handleChangeField = <K extends keyof DesignTemplateFormValue>(field: K, value: DesignTemplateFormValue[K]) => {
    onFormChange((prev) => ({ ...prev, [field]: value }));
  };

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
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
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

              <TextField
                label="Image URL"
                value={formValue.imageUrl}
                onChange={(event) => handleChangeField('imageUrl', event.target.value)}
                disabled={isView || submitting}
                fullWidth
                required
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel id="room-types-label">Room Types</InputLabel>
              <Select
                labelId="room-types-label"
                multiple
                value={formValue.roomTypes}
                label="Room Types"
                disabled={isView || submitting}
                onChange={(event) => handleChangeField('roomTypes', event.target.value as number[])}
                renderValue={(selected) =>
                  (selected as number[])
                    .map((id) => roomTypeOptions.find((option) => option.value === id)?.label ?? id)
                    .join(', ')
                }
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
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Specializations
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="specialization-ids-label">Specializations</InputLabel>
                  <Select
                    labelId="specialization-ids-label"
                    multiple
                    value={formValue.specializationIds}
                    label="Specializations"
                    disabled={submitting}
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
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Specializations
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {template?.specializations?.length ? (
                    template.specializations.map((item) => <Typography key={item.id} variant="body2">{item.name}</Typography>)
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No specialization data available.
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
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
