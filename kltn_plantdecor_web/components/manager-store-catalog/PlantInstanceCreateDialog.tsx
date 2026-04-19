'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ImageUpload from '@/components/store-management/ImageUpload';
import type { ImageUploadData } from '@/types/store-management.types';
import type { CreatePlantInstanceInput, SystemPlantSearchItem } from '@/types/manager-store-catalog.types';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';

export interface PlantInstanceCreateSubmitValue {
  form: CreatePlantInstanceInput;
  images: ImageUploadData[];
}

interface PlantInstanceCreateDialogProps {
  open: boolean;
  plants: SystemPlantSearchItem[];
  loadingPlants: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (value: PlantInstanceCreateSubmitValue) => void;
}

const DEFAULT_FORM: CreatePlantInstanceInput = {
  plantId: 0,
  specificPrice: 0,
  height: 0,
  trunkDiameter: 0,
  healthStatus: '',
  age: 0,
  description: '',
};

const parseNumericValue = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function PlantInstanceCreateDialog({
  open,
  plants,
  loadingPlants,
  submitting,
  onClose,
  onSubmit,
}: PlantInstanceCreateDialogProps) {
  const [form, setForm] = useState<CreatePlantInstanceInput>(DEFAULT_FORM);
  const [images, setImages] = useState<ImageUploadData[]>([]);

  const hasValidPlant = useMemo(() => plants.some((plant) => plant.id === form.plantId), [plants, form.plantId]);

  const handleDialogEnter = useCallback(() => {
    setForm({
      ...DEFAULT_FORM,
      plantId: plants[0]?.id ?? 0,
    });
    setImages([]);
  }, [plants]);

  const handleNumberChange = <K extends keyof CreatePlantInstanceInput>(key: K, value: string) => {
    const parsedValue = parseNumericValue(value);
    setForm((prev) => ({
      ...prev,
      [key]: parsedValue,
    }));
  };

  const canSubmit =
    !loadingPlants &&
    hasValidPlant &&
    form.specificPrice > 0 &&
    form.height > 0 &&
    form.healthStatus.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} TransitionProps={{ onEnter: handleDialogEnter }} maxWidth="md" fullWidth>
      <DialogTitle>Create New Plant Instance</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            Please fill in all required information to create a new unique plant instance. Fields marked with * are required.
          </Typography>

          <Grid container spacing={2}>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Plant"
                value={form.plantId}
                onChange={(event) => handleNumberChange('plantId', event.target.value)}
                disabled={loadingPlants || plants.length === 0}
                required
              >
                {loadingPlants ? (
                  <MenuItem value={0} disabled>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={14} />
                      <span>Loading plants...</span>
                    </Stack>
                  </MenuItem>
                ) : plants.length === 0 ? (
                  <MenuItem value={0} disabled>
                    No unique-instance plants found
                  </MenuItem>
                ) : (
                  plants.map((plant) => (
                    <MenuItem key={plant.id} value={plant.id}>
                      {plant.name} (ID: {plant.id})
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Specific Price"
                type="text"
                value={formatCurrencyInput(form.specificPrice, 'vi')}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, specificPrice: parseCurrencyInput(event.target.value) }))
                }
                inputProps={{ inputMode: 'numeric' }}
                required
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={form.height}
                onChange={(event) => handleNumberChange('height', event.target.value)}
                required
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Trunk Diameter (cm)"
                type="number"
                value={form.trunkDiameter}
                onChange={(event) => handleNumberChange('trunkDiameter', event.target.value)}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={form.age}
                onChange={(event) => handleNumberChange('age', event.target.value)}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Health Status"
                value={form.healthStatus}
                onChange={(event) => setForm((prev) => ({ ...prev, healthStatus: event.target.value }))}
                required
              />
            </Grid>
            <Grid sx={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </Grid>
          </Grid>

          <Box>
            <ImageUpload images={images} onImagesChange={setImages} label="Plant Instance Images" maxImages={8} />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit({ form, images })}
          variant="contained"
          disabled={!canSubmit || submitting}
          sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {submitting ? 'Creating...' : 'Create Instance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
