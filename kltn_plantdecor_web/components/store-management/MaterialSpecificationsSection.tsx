import React from 'react';
import { Autocomplete, Box, Checkbox, Chip, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

type MaterialSpecType = '' | 'soil' | 'fertilizer' | 'pot' | 'tool';

type DrainageLevel = '' | 'low' | 'medium' | 'high';
type FertilizerForm = '' | 'liquid' | 'powder';
type DurabilityLevel = '' | 'low' | 'medium' | 'high';

export type SoilProperties = {
  ph: number | null;
  drainage: DrainageLevel;
  waterRetention: DrainageLevel;
  organic: boolean;
  weightKg: number | null;
  suitableFor: string[];
};

export type FertilizerProperties = {
  npk: string;
  form: FertilizerForm;
  application: string;
  volume: string;
  organic: boolean;
  targetPlants: string[];
};

export type PotProperties = {
  material: string;
  size: string;
  hasDrainHole: boolean;
  color: string;
  shape: string;
  indoor: boolean;
};

export type ToolProperties = {
  toolType: string;
  material: string;
  usage: string;
  capacityLiters: number | null;
  durability: DurabilityLevel;
};

export type MaterialSpecsFormSlice = {
  specType: MaterialSpecType;
  soil: SoilProperties;
  fertilizer: FertilizerProperties;
  pot: PotProperties;
  tool: ToolProperties;
};

export const defaultSpecs: MaterialSpecsFormSlice = {
  specType: '',
  soil: {
    ph: null,
    drainage: '',
    waterRetention: '',
    organic: false,
    weightKg: null,
    suitableFor: [],
  },
  fertilizer: {
    npk: '',
    form: '',
    application: '',
    volume: '',
    organic: false,
    targetPlants: [],
  },
  pot: {
    material: '',
    size: '',
    hasDrainHole: false,
    color: '',
    shape: '',
    indoor: false,
  },
  tool: {
    toolType: '',
    material: '',
    usage: '',
    capacityLiters: null,
    durability: '',
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function safeTrim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => Boolean(item));
  return Array.from(new Set(out));
}

function isSpecType(value: unknown): value is Exclude<MaterialSpecType, ''> {
  return value === 'soil' || value === 'fertilizer' || value === 'pot' || value === 'tool';
}

export function parseEditingSpecsToForm(specifications: Record<string, unknown> | null | undefined): MaterialSpecsFormSlice {
  if (!specifications || !isRecord(specifications)) {
    return defaultSpecs;
  }

  const type = specifications.type;
  const properties = specifications.properties;
  if (!isSpecType(type) || !isRecord(properties)) {
    return defaultSpecs;
  }

  if (type === 'soil') {
    return {
      ...defaultSpecs,
      specType: 'soil',
      soil: {
        ph: asNumberOrNull(properties.ph),
        drainage: (safeTrim(properties.drainage) as DrainageLevel) || '',
        waterRetention: (safeTrim(properties.waterRetention) as DrainageLevel) || '',
        organic: asBoolean(properties.organic, false),
        weightKg: asNumberOrNull(properties.weightKg),
        suitableFor: normalizeStringArray(properties.suitableFor),
      },
    };
  }

  if (type === 'fertilizer') {
    return {
      ...defaultSpecs,
      specType: 'fertilizer',
      fertilizer: {
        npk: safeTrim(properties.npk),
        form: (safeTrim(properties.form) as FertilizerForm) || '',
        application: safeTrim(properties.application),
        volume: safeTrim(properties.volume),
        organic: asBoolean(properties.organic, false),
        targetPlants: normalizeStringArray(properties.targetPlants),
      },
    };
  }

  if (type === 'pot') {
    return {
      ...defaultSpecs,
      specType: 'pot',
      pot: {
        material: safeTrim(properties.material),
        size: safeTrim(properties.size),
        hasDrainHole: asBoolean(properties.hasDrainHole, false),
        color: safeTrim(properties.color),
        shape: safeTrim(properties.shape),
        indoor: asBoolean(properties.indoor, false),
      },
    };
  }

  return {
    ...defaultSpecs,
    specType: 'tool',
    tool: {
      toolType: safeTrim(properties.toolType),
      material: safeTrim(properties.material),
      usage: safeTrim(properties.usage),
      capacityLiters: asNumberOrNull(properties.capacityLiters),
      durability: (safeTrim(properties.durability) as DurabilityLevel) || '',
    },
  };
}

export function buildSpecificationsJson(values: MaterialSpecsFormSlice): string {
  const type = values.specType;
  if (!isSpecType(type)) {
    return '';
  }

  if (type === 'soil') {
    const p = values.soil;
    return JSON.stringify({
      type,
      properties: {
        ph: p.ph,
        drainage: p.drainage || undefined,
        waterRetention: p.waterRetention || undefined,
        organic: Boolean(p.organic),
        weightKg: p.weightKg,
        suitableFor: normalizeStringArray(p.suitableFor),
      },
    });
  }

  if (type === 'fertilizer') {
    const p = values.fertilizer;
    return JSON.stringify({
      type,
      properties: {
        npk: safeTrim(p.npk) || undefined,
        form: p.form || undefined,
        application: safeTrim(p.application) || undefined,
        volume: safeTrim(p.volume) || undefined,
        organic: Boolean(p.organic),
        targetPlants: normalizeStringArray(p.targetPlants),
      },
    });
  }

  if (type === 'pot') {
    const p = values.pot;
    return JSON.stringify({
      type,
      properties: {
        material: safeTrim(p.material) || undefined,
        size: safeTrim(p.size) || undefined,
        hasDrainHole: Boolean(p.hasDrainHole),
        color: safeTrim(p.color) || undefined,
        shape: safeTrim(p.shape) || undefined,
        indoor: Boolean(p.indoor),
      },
    });
  }

  const p = values.tool;
  return JSON.stringify({
    type,
    properties: {
      toolType: safeTrim(p.toolType) || undefined,
      material: safeTrim(p.material) || undefined,
      usage: safeTrim(p.usage) || undefined,
      capacityLiters: p.capacityLiters,
      durability: p.durability || undefined,
    },
  });
}

function ChipsInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={value}
      onChange={(_, nextValue) => onChange(nextValue)}
      renderTags={(tagValue: readonly string[], getTagProps) =>
        tagValue.map((option: string, index: number) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} key={`${option}-${index}`} />
        ))
      }
      renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} />}
    />
  );
}

export default function MaterialSpecificationsSection<TFieldValues extends FieldValues & MaterialSpecsFormSlice>({
  control,
}: {
  control: Control<TFieldValues>;
}) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Specifications
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name={'specType' as Path<TFieldValues>}
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select {...field} label="Type" value={field.value || ''}>
                  <MenuItem value="">Select type...</MenuItem>
                  <MenuItem value="soil">Soil</MenuItem>
                  <MenuItem value="fertilizer">Fertilizer</MenuItem>
                  <MenuItem value="pot">Pot</MenuItem>
                  <MenuItem value="tool">Tool</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>

      <Controller
        name={'specType' as Path<TFieldValues>}
        control={control}
        render={({ field: { value: specType } }) => {
          if (specType === 'soil') {
            return (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'soil.ph' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="pH"
                          fullWidth
                          type="number"
                          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'soil.weightKg' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Weight (kg)"
                          fullWidth
                          type="number"
                          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'soil.drainage' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Drainage</InputLabel>
                          <Select {...field} label="Drainage" value={field.value || ''}>
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="veryHigh">Very high</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'soil.waterRetention' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Water retention</InputLabel>
                          <Select {...field} label="Water retention" value={field.value || ''}>
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name={'soil.organic' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />
                          }
                          label="Organic"
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name={'soil.suitableFor' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <ChipsInput
                          label="Suitable for"
                          placeholder="Type and press Enter..."
                          value={(field.value as string[] | undefined) || []}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            );
          }

          if (specType === 'fertilizer') {
            return (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'fertilizer.npk' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => <TextField {...field} label="NPK" fullWidth placeholder="20-20-15" />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'fertilizer.form' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Form</InputLabel>
                          <Select {...field} label="Form" value={field.value || ''}>
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="liquid">Liquid</MenuItem>
                            <MenuItem value="powder">Powder</MenuItem>
                            <MenuItem value="pellet">Pellet</MenuItem>
                            <MenuItem value="granule">Granule</MenuItem>
                            <MenuItem value="tablets">Slow-release</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'fertilizer.application' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Application</InputLabel>
                          <Select {...field} label="Application" value={field.value || ''}>
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="once">Once</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="quarterly">Quarterly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name={'fertilizer.organic' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />
                          }
                          label="Organic"
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name={'fertilizer.targetPlants' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <ChipsInput
                          label="Target plants"
                          placeholder="Type and press Enter..."
                          value={(field.value as string[] | undefined) || []}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            );
          }

          if (specType === 'pot') {
            return (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'pot.material' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Material</InputLabel>
                          <Select {...field} label="Material" value={field.value || ''}>
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="ceramic">Ceramic</MenuItem>
                            <MenuItem value="plastic">Plastic</MenuItem>
                            <MenuItem value="terracotta">Terracotta</MenuItem>
                            <MenuItem value="glass">Glass</MenuItem>
                            <MenuItem value="cement">Cement</MenuItem>
                            <MenuItem value="metal">Metal</MenuItem>
                            <MenuItem value="stone">Stone</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'pot.size' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => <TextField {...field} label="Size" fullWidth placeholder="20x20 cm" />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'pot.color' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Color</InputLabel>
                          <Select {...field} label="Color" value={field.value || ''}>
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="white">White</MenuItem>
                            <MenuItem value="black">Black</MenuItem>
                            <MenuItem value="gray">Gray</MenuItem>
                            <MenuItem value="brown">Brown</MenuItem>
                            <MenuItem value="red">Red</MenuItem>
                            <MenuItem value="orange">Orange</MenuItem>
                            <MenuItem value="yellow">Yellow</MenuItem>
                            <MenuItem value="green">Green</MenuItem>
                            <MenuItem value="blue">Blue</MenuItem>
                            <MenuItem value="purple">Purple</MenuItem>
                            <MenuItem value="pink">Pink</MenuItem>
                            <MenuItem value="brown">Brown</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'pot.shape' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Shape</InputLabel>
                          <Select {...field} label="Shape" value={field.value || ''}>
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="round">Round</MenuItem>
                            <MenuItem value="square">Square</MenuItem>
                            <MenuItem value="oval">Oval</MenuItem>
                            <MenuItem value="rectangular">Rectangular</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'pot.indoor' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />
                          }
                          label="Indoor"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            );
          }

          if (specType === 'tool') {
            return (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'tool.toolType' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => <TextField {...field} label="Tool type" fullWidth placeholder="watering_can" />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'tool.material' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => <TextField {...field} label="Material" fullWidth placeholder="plastic" />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'tool.usage' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Usage</InputLabel>
                          <Select {...field} label="Usage" value={field.value || ''}>
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="watering">Watering</MenuItem>
                            <MenuItem value="fertilizing">Fertilizing</MenuItem>
                            <MenuItem value="digging">Digging</MenuItem>
                            <MenuItem value="cleaning">Cleaning</MenuItem>
                            <MenuItem value="weeding">Weeding</MenuItem>
                            <MenuItem value="pruning">Pruning</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'tool.capacityLiters' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Capacity (liters)"
                          fullWidth
                          type="number"
                          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={'tool.durability' as Path<TFieldValues>}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Durability</InputLabel>
                          <Select {...field} label="Durability" value={field.value || ''}>
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="veryHigh">Very high</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            );
          }

          return (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                Select a type to enter specifications.
              </Typography>
            </Box>
          );
        }}
      />
    </Box>
  );
}

