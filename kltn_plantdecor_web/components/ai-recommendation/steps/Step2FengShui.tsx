'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { PersonOutline as PersonIcon, PeopleAlt as PeopleIcon } from '@mui/icons-material';
import type { PlantEnumValue } from '@/lib/api/shopPlantsService';
import { getFengShuiColors, getFengShuiElementKey } from '@/lib/utils/fengShui';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

const FENG_SHUI_VI: Record<string, string> = {
  kim: 'Kim (Metal)',
  moc: 'Mộc (Wood)',
  thuy: 'Thủy (Water)',
  hoa: 'Hỏa (Fire)',
  tho: 'Thổ (Earth)',
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

/** Mock: compute fengshui element from birth year last digit */
const computeFengShuiFromBirthYear = (birthYear: number): string => {
  const d = birthYear % 10;
  if (d === 0 || d === 1) return 'Metal';
  if (d === 2 || d === 3) return 'Water';
  if (d === 4 || d === 5) return 'Wood';
  if (d === 6 || d === 7) return 'Fire';
  return 'Earth';
};

const humanizeEnum = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

interface Step2Props {
  dominantDirection: string;
  isBuyingForSelf: boolean;
  otherBirthDate: string;
  calendarType: 'Solar' | 'Lunar';
  profileBirthDate: string;
  profileFengShuiElement: string;
  dominantDirections: PlantEnumValue[];
  onFengShuiChange: (value: string) => void;
  onDominantDirectionChange: (value: string) => void;
  onIsBuyingForSelfChange: (value: boolean) => void;
  onOtherBirthDateChange: (value: string) => void;
  onCalendarTypeChange: (value: 'Solar' | 'Lunar') => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2FengShui({
  dominantDirection,
  isBuyingForSelf,
  otherBirthDate,
  calendarType,
  profileBirthDate,
  profileFengShuiElement,
  dominantDirections,
  onFengShuiChange,
  onDominantDirectionChange,
  onIsBuyingForSelfChange,
  onOtherBirthDateChange,
  onCalendarTypeChange,
  onBack,
  onNext,
}: Step2Props) {
  const [mode, setMode] = useState<'self' | 'other'>(isBuyingForSelf ? 'self' : 'other');

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, val: 'self' | 'other' | null) => {
    if (!val) return;
    setMode(val);
    onIsBuyingForSelfChange(val === 'self');
    if (val === 'self') {
      onFengShuiChange(profileFengShuiElement || '');
    }
  };

  const computedElementForOther = useMemo(() => {
    if (!otherBirthDate) return '';
    const year = new Date(otherBirthDate).getFullYear();
    if (isNaN(year)) return '';
    return computeFengShuiFromBirthYear(year);
  }, [otherBirthDate]);

  const activeElement = mode === 'self' ? profileFengShuiElement : computedElementForOther;
  const elementKey = getFengShuiElementKey(activeElement);
  const colors = getFengShuiColors(activeElement);

  const handleOtherBirthDateChange = (value: string) => {
    onOtherBirthDateChange(value);
    const year = new Date(value).getFullYear();
    if (!isNaN(year)) {
      onFengShuiChange(computeFengShuiFromBirthYear(year));
    }
  };

  const directionOptions =
    dominantDirections.length > 0
      ? dominantDirections
      : [
          { value: 1, name: 'North' },
          { value: 2, name: 'Northeast' },
          { value: 3, name: 'East' },
          { value: 4, name: 'Southeast' },
          { value: 5, name: 'South' },
          { value: 6, name: 'Southwest' },
          { value: 7, name: 'West' },
          { value: 8, name: 'Northwest' },
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

        {/* Buying mode toggle */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Buying plants for
          </Typography>
          <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} size="small">
            <ToggleButton value="self" sx={{ gap: 1 }}>
              <PersonIcon fontSize="small" />
              Myself
            </ToggleButton>
            <ToggleButton value="other" sx={{ gap: 1 }}>
              <PeopleIcon fontSize="small" />
              Someone else
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Birth date section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Date of birth
          </Typography>

          {mode === 'self' ? (
            <TextField
              label="Date of birth"
              value={profileBirthDate || ''}
              fullWidth
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              disabled
              helperText="Pulled from your profile"
              sx={{ maxWidth: 280 }}
            />
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
              <TextField
                label="Date of birth"
                value={otherBirthDate}
                onChange={(e) => handleOtherBirthDateChange(e.target.value)}
                type="date"
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: new Date().toISOString().split('T')[0] } }}
                sx={{ maxWidth: 280 }}
              />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Calendar type
                </Typography>
                <ToggleButtonGroup
                  value={calendarType}
                  exclusive
                  onChange={(_, val) => { if (val) onCalendarTypeChange(val); }}
                  size="small"
                >
                  <ToggleButton value="Solar">Solar</ToggleButton>
                  <ToggleButton value="Lunar">Lunar</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          )}
        </Box>

        {/* Feng shui element result */}
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
              Five Elements (Ngũ Hành)
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
              <Chip
                label={FENG_SHUI_VI[elementKey] ?? activeElement}
                sx={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 700, fontSize: '0.95rem' }}
              />
              {mode === 'other' && (
                <Typography variant="caption" color="text.secondary">
                  (Estimated from birth year — the system will confirm the final value)
                </Typography>
              )}
            </Stack>
            {FENG_SHUI_DESCRIPTION[elementKey] && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {FENG_SHUI_DESCRIPTION[elementKey]}
              </Typography>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Room direction */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Building / Room facing direction
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            The orientation of the building structure (not light direction).
          </Typography>
          <TextField
            label="Facing direction"
            value={dominantDirection}
            onChange={(e) => onDominantDirectionChange(e.target.value)}
            select
            sx={{ minWidth: 200 }}
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
