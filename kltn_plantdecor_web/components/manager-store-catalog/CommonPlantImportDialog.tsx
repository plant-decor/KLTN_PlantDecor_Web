'use client';

import { useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { AvailableImportCommonPlantItem } from '@/types/manager-store-catalog.types';
import { formatCurrency } from '@/lib/utils/formatUtil';

const parseNonNegativeInteger = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsed));
};

export interface ImportFormValue {
  plantId: number;
  quantity: number;
  isActive: boolean;
}

interface CommonPlantImportDialogProps {
  open: boolean;
  availablePlants: AvailableImportCommonPlantItem[];
  loadingAvailable: boolean;
  submitting: boolean;
  form: ImportFormValue;
  onFormChange: (value: ImportFormValue) => void;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
}

export default function CommonPlantImportDialog({
  open,
  availablePlants,
  loadingAvailable,
  submitting,
  form,
  onFormChange,
  onClose,
  onSubmit,
}: CommonPlantImportDialogProps) {
  const selectedPlant = useMemo(
    () => availablePlants.find((item) => item.id === form.plantId),
    [availablePlants, form.plantId]
  );

  const canSubmit =
    !loadingAvailable &&
    !submitting &&
    form.plantId > 0 &&
    Number.isFinite(form.quantity) &&
    form.quantity > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Import Common Plant</DialogTitle>
      <DialogContent>
        {availablePlants.length === 0 && !loadingAvailable ? (
          <Box
            sx={{
              mt: 1,
              border: '1px dashed var(--card-border)',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No available plants for import.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Select Plant"
              value={form.plantId || ''}
              onChange={(event) =>
              onFormChange({ ...form, plantId: Number(event.target.value) })
              }
              disabled={loadingAvailable || submitting}
              fullWidth
              SelectProps={{
              MenuProps: {
                PaperProps: {
                style: {
                  maxHeight: 48 * 5 + 8,
                },
                },
              },
              }}
            >
              {availablePlants.map((plant) => (
              <MenuItem key={plant.id} value={plant.id}>
                {plant.name}
              </MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              label="Quantity"
              value={form.quantity}
              onChange={(event) =>
                onFormChange({ ...form, quantity: parseNonNegativeInteger(event.target.value) })
              }
              inputProps={{ min: 1 }}
              disabled={submitting}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(_, checked) => onFormChange({ ...form, isActive: checked })}
                  disabled={submitting}
                />
              }
              label="Activate after import"
            />

            {selectedPlant && (
              <Box
                sx={{
                  border: '1px solid var(--card-border)',
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: '#f8fffb',
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {selectedPlant.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Base price: {formatCurrency(selectedPlant.basePrice, 'vi')}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`Size: ${selectedPlant.sizeName}`} variant="outlined" />
                  <Chip
                    size="small"
                    label={`Care: ${selectedPlant.careLevelTypeName}`}
                    variant="outlined"
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => void onSubmit()}
          disabled={!canSubmit}
          sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Confirm Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}
