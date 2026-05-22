'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { PlantEnumValue } from '@/lib/api/shopPlantsService';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

const humanizeEnum = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

const FALLBACK_LIGHT_DIRECTIONS: PlantEnumValue[] = [
  { value: 1, name: 'North' },
  { value: 2, name: 'Northeast' },
  { value: 3, name: 'East' },
  { value: 4, name: 'Southeast' },
  { value: 5, name: 'South' },
  { value: 6, name: 'Southwest' },
  { value: 7, name: 'West' },
  { value: 8, name: 'Northwest' },
];

const FALLBACK_LIGHT_LEVELS: PlantEnumValue[] = [
  { value: 1, name: 'FullSun' },
  { value: 2, name: 'BrightIndirect' },
  { value: 3, name: 'MediumLight' },
  { value: 4, name: 'LowLight' },
  { value: 5, name: 'NoLight' },
];

interface Step3Props {
  lightDirection: string;
  naturalLightLevel: string;
  lightDirections: PlantEnumValue[];
  lightLevels: PlantEnumValue[];
  onLightDirectionChange: (value: string) => void;
  onNaturalLightLevelChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step3Lighting({
  lightDirection,
  naturalLightLevel,
  lightDirections,
  lightLevels,
  onLightDirectionChange,
  onNaturalLightLevelChange,
  onBack,
  onNext,
}: Step3Props) {
  const directionOptions = lightDirections.length > 0 ? lightDirections : FALLBACK_LIGHT_DIRECTIONS;
  const levelOptions = lightLevels.length > 0 ? lightLevels : FALLBACK_LIGHT_LEVELS;

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Lighting Conditions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Lighting information helps AI recommend plants that suit your space.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Window / Light direction
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              The direction your main window faces to receive natural light.
            </Typography>
            <TextField
              label="Light direction"
              value={lightDirection}
              onChange={(e) => onLightDirectionChange(e.target.value)}
              select
              fullWidth
            >
              <MenuItem value="">
                <em>Unknown</em>
              </MenuItem>
              {directionOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.name}>
                  {humanizeEnum(opt.name)}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Natural light level
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Amount of natural light the space receives during the day.
            </Typography>
            <TextField
              label="Light level"
              value={naturalLightLevel}
              onChange={(e) => onNaturalLightLevelChange(e.target.value)}
              select
              fullWidth
            >
              <MenuItem value="">
                <em>Unknown</em>
              </MenuItem>
              {levelOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.name}>
                  {humanizeEnum(opt.name)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
          <Button variant="outlined" size="large" onClick={onBack} sx={hoverLiftStyle}>
            Back
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={onNext}
            sx={{ backgroundColor: 'var(--primary)', fontWeight: 600, ...hoverLiftStyle }}
          >
            Next
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
