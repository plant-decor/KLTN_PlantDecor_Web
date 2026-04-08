'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import type { CommonPlantInventoryItem } from '@/types/manager-store-catalog.types';

const parseNonNegativeInteger = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsed));
};

export interface UpdateFormValue {
  quantity: number;
  reservedQuantity: number;
  isActive: boolean;
}

interface CommonPlantEditDialogProps {
  open: boolean;
  item: CommonPlantInventoryItem | null;
  submitting: boolean;
  form: UpdateFormValue;
  onFormChange: (value: UpdateFormValue) => void;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
}

export default function CommonPlantEditDialog({
  open,
  item,
  submitting,
  form,
  onFormChange,
  onClose,
  onSubmit,
}: CommonPlantEditDialogProps) {
  const canSubmit =
    !!item &&
    !submitting &&
    Number.isFinite(form.quantity) &&
    Number.isFinite(form.reservedQuantity) &&
    form.quantity >= 0 &&
    form.reservedQuantity >= 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Common Plant</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Plant Name"
            value={item?.plantName ?? ''}
            disabled
            fullWidth
          />

          <TextField
            type="number"
            label="Quantity"
            value={form.quantity}
            onChange={(event) =>
              onFormChange({ ...form, quantity: parseNonNegativeInteger(event.target.value) })
            }
            inputProps={{ min: 0 }}
            disabled={submitting}
            fullWidth
          />

          <TextField
            type="number"
            label="Reserved Quantity"
            value={form.reservedQuantity}
            onChange={(event) =>
              onFormChange({ ...form, reservedQuantity: parseNonNegativeInteger(event.target.value) })
            }
            inputProps={{ min: 0 }}
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
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => void onSubmit()}
          disabled={!canSubmit}
          sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
