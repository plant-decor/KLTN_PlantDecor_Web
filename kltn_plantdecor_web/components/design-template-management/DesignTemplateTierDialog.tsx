'use client';

import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DeleteOutline, Add, EditNoteOutlined } from '@mui/icons-material';
import type { AdminDesignTemplateDetail, DesignTemplateTier, DesignTemplateTierItemCreateRequest } from '@/types/admin-design-template.types';
import { DESIGN_TEMPLATE_TIER_ITEM_TYPE_OPTIONS, formatCurrency } from './designTemplateManagement.constants';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';

export interface DesignTemplateTierFormValue {
  tierName: string;
  minArea: number;
  maxArea: number;
  packagePrice: number;
  scopedOfWork: string;
  estimatedDays: number;
  isActive: boolean;
  items: DesignTemplateTierItemCreateRequest[];
}

interface DesignTemplateTierDialogProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  template: AdminDesignTemplateDetail | null;
  tier: DesignTemplateTier | null;
  existingTiers: DesignTemplateTier[];
  detailLoading: boolean;
  detailError: string | null;
  formValue: DesignTemplateTierFormValue;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onFormChange: (updater: (prev: DesignTemplateTierFormValue) => DesignTemplateTierFormValue) => void;
  onEditExistingTier: (tier: DesignTemplateTier) => void;
  onDeactivateExistingTier: (tier: DesignTemplateTier) => void;
}

const createEmptyTierItem = (): DesignTemplateTierItemCreateRequest => ({
  materialId: null,
  plantId: null,
  itemType: 1,
  quantity: 1,
});

export default function DesignTemplateTierDialog({
  open,
  mode,
  template,
  tier,
  existingTiers,
  detailLoading,
  detailError,
  formValue,
  submitting,
  onClose,
  onSubmit,
  onFormChange,
  onEditExistingTier,
  onDeactivateExistingTier,
}: DesignTemplateTierDialogProps) {
  const isView = mode === 'view';
  const isCreate = mode === 'create';

  const handleChangeField = <K extends keyof DesignTemplateTierFormValue>(field: K, value: DesignTemplateTierFormValue[K]) => {
    onFormChange((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, value: Partial<DesignTemplateTierItemCreateRequest>) => {
    onFormChange((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...value } : item)),
    }));
  };

  const addItem = () => {
    onFormChange((prev) => ({ ...prev, items: [...prev.items, createEmptyTierItem()] }));
  };

  const removeItem = (index: number) => {
    onFormChange((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        {isCreate ? 'Create Tier' : isView ? `Tier #${tier?.id ?? ''}` : `Edit Tier #${tier?.id ?? ''}`}
      </DialogTitle>
      <DialogContent dividers>
        {detailLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : detailError ? (
          <Alert severity="error">{detailError}</Alert>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Template: {template?.name ?? 'Unknown template'}
            </Typography>
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Existing Tiers</Typography>
                {!isView && (
                  <Typography variant="caption" color="text.secondary">
                    Use Edit / Delete to manage current tiers.
                  </Typography>
                )}
              </Stack>
              <Stack spacing={1.5}>
                {existingTiers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No tiers available for this template.
                  </Typography>
                ) : (
                  existingTiers.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        border: '1px solid var(--card-border)',
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography fontWeight={700}>{item.tierName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.minArea} - {item.maxArea} m2 | {formatCurrency(item.packagePrice)} | {item.estimatedDays} days
                        </Typography>
                      </Box>
                      {!isView && (
                        <Stack direction="row" spacing={1}>
                          <Button size="medium" onClick={() => onEditExistingTier(item)} disabled={submitting}>
                            <EditNoteOutlined fontSize="large" />
                          </Button>
                          <IconButton
                            size="medium"
                            color="error"
                            onClick={() => onDeactivateExistingTier(item)}
                            disabled={submitting || !item.isActive}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </Stack>
                      )}
                    </Box>
                  ))
                )}
              </Stack>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Tier Name"
                value={formValue.tierName}
                onChange={(event) => handleChangeField('tierName', event.target.value)}
                disabled={isView || submitting}
                fullWidth
                required
              />
              <TextField
              required
                label="Estimated Days"
                type="number"
                value={formValue.estimatedDays}
                onChange={(event) => handleChangeField('estimatedDays', Number(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
              required
                label="Min Area"
                type="number"
                value={formValue.minArea}
                onChange={(event) => handleChangeField('minArea', Number(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
              required
                label="Max Area"
                type="number"
                value={formValue.maxArea}
                onChange={(event) => handleChangeField('maxArea', Number(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
              required
                label="Package Price"
                type="text"
                value={formatCurrencyInput(formValue.packagePrice, 'vi')}
                onChange={(event) => handleChangeField('packagePrice', parseCurrencyInput(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ inputMode: 'numeric' }}
              />
            </Stack>

            <TextField
              label="Scope of Work"
              value={formValue.scopedOfWork}
              onChange={(event) => handleChangeField('scopedOfWork', event.target.value)}
              disabled={isView || submitting}
              fullWidth
              multiline
              minRows={3}
              required
            />

            <Stack direction="column" alignItems="left" justifyContent="left">
              <Typography variant="body2" fontWeight={600}>
                Status
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValue.isActive}
                    onChange={(event) => handleChangeField('isActive', event.target.checked)}
                    disabled={isView || submitting}
                    color="success"
                  />
                }
                label={formValue.isActive ? 'Active' : 'Inactive'}
              />
            </Stack>

            

            {isCreate && (
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Tier Items</Typography>
                  <Button size="small" startIcon={<Add />} onClick={addItem} disabled={submitting || isView}>
                    Add item
                  </Button>
                </Stack>
                <Stack spacing={2}>
                  {formValue.items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Add at least one plant/material item for this tier.
                    </Typography>
                  ) : (
                    formValue.items.map((item, index) => (
                      <Box key={`${index}-${item.itemType}`} sx={{ border: '1px solid var(--card-border)', borderRadius: 2, p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">Item {index + 1}</Typography>
                          <IconButton size="small" color="error" onClick={() => removeItem(index)} disabled={submitting || isView}>
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <FormControl fullWidth>
                            <InputLabel id={`tier-item-type-${index}`}>Item Type</InputLabel>
                            <Select
                              labelId={`tier-item-type-${index}`}
                              label="Item Type"
                              value={item.itemType}
                              disabled={isView || submitting}
                              onChange={(event) => updateItem(index, { itemType: Number(event.target.value) })}
                            >
                              {DESIGN_TEMPLATE_TIER_ITEM_TYPE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <TextField
                            label="Plant ID"
                            type="number"
                            value={item.plantId ?? ''}
                            onChange={(event) => updateItem(index, { plantId: event.target.value === '' ? null : Number(event.target.value) })}
                            disabled={isView || submitting}
                            fullWidth
                          />
                          <TextField
                            label="Material ID"
                            type="number"
                            value={item.materialId ?? ''}
                            onChange={(event) => updateItem(index, { materialId: event.target.value === '' ? null : Number(event.target.value) })}
                            disabled={isView || submitting}
                            fullWidth
                          />
                          <TextField
                            label="Quantity"
                            type="number"
                            value={item.quantity}
                            onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
                            disabled={isView || submitting}
                            fullWidth
                            inputProps={{ min: 1 }}
                          />
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </Box>
            )}

            {!isCreate && tier && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Existing Items
                </Typography>
                <Stack spacing={1}>
                  {tier.items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No items found for this tier.
                    </Typography>
                  ) : (
                    tier.items.map((item) => (
                      <Box key={item.id ?? `${item.itemType}-${item.quantity}`} sx={{ px: 2, py: 1.5, border: '1px solid var(--card-border)', borderRadius: 2 }}>
                        <Typography variant="body2">
                          Type {item.itemType} - Qty {item.quantity} - {item.plantId ? `Plant ${item.plantId}` : `Material ${item.materialId}`}
                        </Typography>
                      </Box>
                    ))
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
