'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  ClickAwayListener,
  Divider,
  FormControlLabel,
  InputAdornment,
  List,
  ListItemButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getAllergyPlants } from '@/lib/api/aiRecommendationService';
import { searchShopNurseries, type ShopNurseryListItem } from '@/lib/api/shopPlantsService';
import type { AllergyPlantOption } from '@/types/ai-recommendation.types';
import { formatCurrencyInput } from '@/lib/utils/formatUtil';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { CustomLoading } from '@/components/CustomLoading';

const SEARCH_DEBOUNCE_MS = 300;
const MAX_VISIBLE_ITEMS = 6;
const CARE_LEVEL_OPTIONS = ['', 'Easy', 'Medium', 'Hard', 'Expert'];

interface Step4Props {
  minBudget: string;
  maxBudget: string;
  careLevelType: string;
  hasAllergy: boolean;
  allergyNote: string;
  selectedAllergies: AllergyPlantOption[];
  petSafe: boolean;
  childSafe: boolean;
  selectedNurseries: ShopNurseryListItem[];
  isAnalyzing: boolean;
  onMinBudgetChange: (value: string) => void;
  onMaxBudgetChange: (value: string) => void;
  onCareLevelChange: (value: string) => void;
  onHasAllergyChange: (checked: boolean) => void;
  onAllergyNoteChange: (value: string) => void;
  onPetSafeChange: (checked: boolean) => void;
  onChildSafeChange: (checked: boolean) => void;
  onSelectedNurseriesChange: (nurseries: ShopNurseryListItem[]) => void;
  onSelectedAllergiesChange: (allergies: AllergyPlantOption[]) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step4Budget({
  minBudget,
  maxBudget,
  careLevelType,
  hasAllergy,
  allergyNote,
  selectedAllergies,
  petSafe,
  childSafe,
  selectedNurseries,
  isAnalyzing,
  onMinBudgetChange,
  onMaxBudgetChange,
  onCareLevelChange,
  onHasAllergyChange,
  onAllergyNoteChange,
  onPetSafeChange,
  onChildSafeChange,
  onSelectedNurseriesChange,
  onSelectedAllergiesChange,
  onBack,
  onSubmit,
}: Step4Props) {
  const [nurseryLoading, setNurseryLoading] = useState(false);
  const [nurseryOptions, setNurseryOptions] = useState<ShopNurseryListItem[]>([]);
  const [allergyKeyword, setAllergyKeyword] = useState('');
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [allergyLoading, setAllergyLoading] = useState(false);
  const [allergyOptions, setAllergyOptions] = useState<AllergyPlantOption[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setNurseryLoading(true);
        const response = await searchShopNurseries({ pagination: { pageNumber: 1, pageSize: 200 } }, false, false);
        if (!active) return;
        const items = (response?.payload?.items ?? response?.data?.items ?? []).filter((item) => item.isActive);
        setNurseryOptions(items);
      } catch {
        if (active) setNurseryOptions([]);
      } finally {
        if (active) setNurseryLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!allergyOpen) return;
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        setAllergyLoading(true);
        const items = await getAllergyPlants({ keyword: allergyKeyword.trim(), take: 50 }, false, false);
        if (!active) return;
        setAllergyOptions(items);
      } catch {
        if (active) setAllergyOptions([]);
      } finally {
        if (active) setAllergyLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => { active = false; window.clearTimeout(timeoutId); };
  }, [allergyKeyword, allergyOpen]);

  const selectedAllergyIds = useMemo(() => selectedAllergies.map((item) => item.plantId), [selectedAllergies]);
  const noAllergyResults = allergyOpen && !allergyLoading && allergyOptions.length === 0;

  const toggleAllergyPlant = (item: AllergyPlantOption) => {
    const next = selectedAllergies.some((s) => s.plantId === item.plantId)
      ? selectedAllergies.filter((s) => s.plantId !== item.plantId)
      : [...selectedAllergies, item];
    onSelectedAllergiesChange(next);
  };

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Budget &amp; Care Level
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Set your budget and care preferences so AI can filter the most suitable recommendations.
        </Typography>

        {/* Budget */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Budget (VND)
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              label="Min budget"
              value={minBudget}
              onChange={(e) => onMinBudgetChange(formatCurrencyInput(e.target.value, 'vi'))}
              type="text"
              fullWidth
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            />
            <TextField
              label="Max budget"
              value={maxBudget}
              onChange={(e) => onMaxBudgetChange(formatCurrencyInput(e.target.value, 'vi'))}
              type="text"
              fullWidth
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            />
          </Stack>
        </Box>

        {/* Care level */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Care level
          </Typography>
          <TextField
            label="Care level"
            value={careLevelType}
            onChange={(e) => onCareLevelChange(e.target.value)}
            select
            sx={{ minWidth: 200 }}
          >
            {CARE_LEVEL_OPTIONS.map((opt) => (
              <MenuItem key={opt || '__empty'} value={opt}>
                {opt || 'Any'}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Safety toggles */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Safety requirements
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <FormControlLabel
              control={<Switch checked={petSafe} onChange={(e) => onPetSafeChange(e.target.checked)} />}
              label="Pet safe"
            />
            <FormControlLabel
              control={<Switch checked={childSafe} onChange={(e) => onChildSafeChange(e.target.checked)} />}
              label="Child safe"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={hasAllergy}
                  onChange={(e) => {
                    onHasAllergyChange(e.target.checked);
                    if (!e.target.checked) {
                      onSelectedAllergiesChange([]);
                      onAllergyNoteChange('');
                    }
                  }}
                />
              }
              label="Exclude allergy-causing plants"
            />
          </Stack>
        </Box>

        {/* Allergy plant picker */}
        {hasAllergy && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Select plants to avoid (allergies)
            </Typography>
            <ClickAwayListener onClickAway={() => setAllergyOpen(false)}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  value={allergyKeyword}
                  onFocus={() => setAllergyOpen(true)}
                  onChange={(e) => { setAllergyKeyword(e.target.value); setAllergyOpen(true); }}
                  placeholder="Search allergy plants..."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: allergyLoading ? (
                        <InputAdornment position="end"><CustomLoading size={16} /></InputAdornment>
                      ) : undefined,
                    },
                  }}
                />
                {allergyOpen && (
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      right: 0,
                      zIndex: 1300,
                      maxHeight: `calc(${MAX_VISIBLE_ITEMS} * 52px)`,
                      overflowY: 'auto',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <List disablePadding>
                      {allergyOptions.map((option) => {
                        const selected = selectedAllergyIds.includes(option.plantId);
                        return (
                          <ListItemButton
                            key={option.plantId}
                            onClick={() => toggleAllergyPlant(option)}
                            sx={{
                              borderBottom: '1px solid var(--card-border)',
                              bgcolor: selected ? 'color-mix(in srgb, var(--primary) 18%, white)' : 'transparent',
                            }}
                          >
                            <Typography variant="body2">{option.plantName}</Typography>
                          </ListItemButton>
                        );
                      })}
                      {noAllergyResults && (
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            No matching plants found
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {selectedAllergies.map((item) => (
                <Chip
                  key={item.plantId}
                  label={item.plantName}
                  onDelete={() => toggleAllergyPlant(item)}
                  color="warning"
                  variant="outlined"
                />
              ))}
            </Box>

            <TextField
              sx={{ mt: 2 }}
              fullWidth
              multiline
              rows={2}
              label="Allergy note"
              placeholder="Describe allergy details (optional)"
              value={allergyNote}
              onChange={(e) => onAllergyNoteChange(e.target.value)}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Nursery preference */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Preferred nurseries (optional)
          </Typography>
          <Autocomplete
            multiple
            options={nurseryOptions}
            loading={nurseryLoading}
            value={selectedNurseries}
            onChange={(_, value) => onSelectedNurseriesChange(value)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select nurseries"
                placeholder="Search and select nurseries..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.name} size="small" />
              ))
            }
          />
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
          <Button variant="outlined" size="large" onClick={onBack} disabled={isAnalyzing} sx={hoverLiftStyle}>
            Back
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={onSubmit}
            disabled={isAnalyzing}
            sx={{ px: 4, backgroundColor: 'var(--primary)', fontWeight: 700, ...hoverLiftStyle }}
          >
            {isAnalyzing ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CustomLoading size={20} />
                <span>Analyzing...</span>
              </Stack>
            ) : (
              'Analyze & Recommend'
            )}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
