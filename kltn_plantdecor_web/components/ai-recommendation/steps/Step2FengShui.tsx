'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { PlantEnumValue } from '@/lib/api/shopPlantsService';
import { getFengShuiColors, getFengShuiElementKey } from '@/lib/utils/fengShui';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

const FENG_SHUI_VI: Record<string, string> = {
  kim: 'Metal',
  moc: 'Wood',
  thuy: 'Water',
  hoa: 'Fire',
  tho: 'Earth',
  unknown: 'Unknown',
};
const FENG_SHUI_DESCRIPTION: Record<string, string> = {
  kim: 'Metal element — suited to plants with silver or white foliage and rounded shapes. Try Orchids, Japanese Bamboo, or Cactus.',
  moc: 'Wood element — suited to lush green plants with long leaves. Try Lucky Bamboo, Snake Plant, or Pothos.',
  thuy: 'Water element — suited to aquatic or deep-green plants. Try Duckweed, Succulent, or Fern.',
  hoa: 'Fire element — suited to red-leaved or vibrant-flowering plants. Try Roses, Geraniums, or Carnations.',
  tho: 'Earth element — suited to low-growing, broad-leaved plants. Try Money Tree, Pothos, or Fan Palm.',
  unknown: '',
};

const humanizeEnum = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

interface Step2Props {
  fengShui: string;
  fengShuiElements: PlantEnumValue[];
  isBuyingForSelf: boolean;
  profileFengShuiElement: string;
  onFengShuiChange: (value: string) => void;
  onIsBuyingForSelfChange: (value: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2FengShui({
  fengShui,
  fengShuiElements,
  isBuyingForSelf,
  profileFengShuiElement,
  onFengShuiChange,
  onIsBuyingForSelfChange,
  onBack,
  onNext,
}: Step2Props) {
  const [useProfile, setUseProfile] = useState(isBuyingForSelf);

  const handleUseProfileChange = (checked: boolean) => {
    setUseProfile(checked);
    onIsBuyingForSelfChange(checked);
    if (checked) onFengShuiChange(profileFengShuiElement || '');
  };

  const activeElement = useProfile ? profileFengShuiElement : fengShui;
  const elementKey = getFengShuiElementKey(activeElement);
  const colors = getFengShuiColors(activeElement);

  const fengShuiOptions =
    fengShuiElements.length > 0
      ? fengShuiElements
      : [
          { value: 1, name: 'Metal' },
          { value: 2, name: 'Wood' },
          { value: 3, name: 'Water' },
          { value: 4, name: 'Fire' },
          { value: 5, name: 'Earth' },
        ];

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Feng Shui Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          AI will analyze feng shui data to recommend plants that align with the owner&apos;s element.
        </Typography>

        {/* Use profile checkbox */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={useProfile}
                onChange={(e) => handleUseProfileChange(e.target.checked)}
              />
            }
            label="Use user profile information"
          />
        </Box>

        {/* Feng Shui Element field */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Feng Shui Element"
            value={useProfile ? profileFengShuiElement : fengShui}
            onChange={(e) => onFengShuiChange(e.target.value)}
            select
            disabled={useProfile}
            sx={{ minWidth: 240 }}
            helperText={useProfile ? 'Pulled from your profile' : ' '}
          >
            {fengShuiOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.name}>
                {humanizeEnum(opt.name)}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Feng shui element description */}
        {activeElement && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: colors.text }}>
              Five Elements
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
              <Chip
                label={FENG_SHUI_VI[elementKey] ?? activeElement}
                sx={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 700, fontSize: '0.95rem' }}
              />
            </Stack>
            {FENG_SHUI_DESCRIPTION[elementKey] && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {FENG_SHUI_DESCRIPTION[elementKey]}
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
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
