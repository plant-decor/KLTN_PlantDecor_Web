'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  ClickAwayListener,
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
import { Search as SearchIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { searchShopNurseries, type ShopNurseryListItem } from '@/lib/api/shopPlantsService';
import { getAllergyPlants } from '@/lib/api/aiRecommendationService';
import type { AllergyPlantOption } from '@/types/ai-recommendation.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { localizeRoomDesignEnumLabel } from '@/lib/utils/roomDesignEnumI18n';
import ClickableImageViewer from '../image-view/ClickableImageViewer';

const SEARCH_DEBOUNCE_MS = 300;
const MAX_VISIBLE_ITEMS = 6;

const FENG_SHUI_OPTIONS = [
  { value: '', label: '--' },
  { value: 'Kim', label: 'Kim' },
  { value: 'Moc', label: 'Mộc' },
  { value: 'Thuy', label: 'Thủy' },
  { value: 'Hoa', label: 'Hỏa' },
  { value: 'Tho', label: 'Thổ' },
];

const ROOM_TYPE_OPTIONS = [
  'LivingRoom',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'HomeOffice',
  'Balcony',
  'Corridor',
  'DiningRoom',
];

const ROOM_STYLE_OPTIONS = [
  'Minimalist',
  'Scandinavian',
  'Tropical',
  'Industrial',
  'Bohemian',
  'Modern',
  'Japanese',
  'Mediterranean',
  'Rustic',
];

const CARE_LEVEL_OPTIONS = ['', 'Easy', 'Medium', 'Hard', 'Expert'];

interface RoomInputCardProps {
  imageFile: File | null;
  imagePreviewUrl: string | null;
  fengShuiElement: string;
  roomType: string;
  roomStyle: string;
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
  error: string | null;
  onUploadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFengShuiChange: (value: string) => void;
  onRoomTypeChange: (value: string) => void;
  onRoomStyleChange: (value: string) => void;
  onMinBudgetChange: (value: string) => void;
  onMaxBudgetChange: (value: string) => void;
  onCareLevelChange: (value: string) => void;
  onHasAllergyChange: (checked: boolean) => void;
  onAllergyNoteChange: (value: string) => void;
  onPetSafeChange: (checked: boolean) => void;
  onChildSafeChange: (checked: boolean) => void;
  onSelectedNurseriesChange: (nurseries: ShopNurseryListItem[]) => void;
  onSelectedAllergiesChange: (allergies: AllergyPlantOption[]) => void;
  onAnalyze: () => void;
  onErrorDismiss: () => void;
}

export default function RoomInputCard({
  imageFile,
  imagePreviewUrl,
  fengShuiElement,
  roomType,
  roomStyle,
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
  error,
  onUploadImage,
  onFengShuiChange,
  onRoomTypeChange,
  onRoomStyleChange,
  onMinBudgetChange,
  onMaxBudgetChange,
  onCareLevelChange,
  onHasAllergyChange,
  onAllergyNoteChange,
  onPetSafeChange,
  onChildSafeChange,
  onSelectedNurseriesChange,
  onSelectedAllergiesChange,
  onAnalyze,
  onErrorDismiss,
}: RoomInputCardProps) {
  const t = useTranslations('aiRecommendation.roomInput');
  const tRoomDesignEnum = useTranslations('roomDesignEnums');
  const [imagePreviewUrlLocal, setImagePreviewUrl] = useState<string | null>(null);
  const [nurseryLoading, setNurseryLoading] = useState(false);
  const [nurseryOptions, setNurseryOptions] = useState<ShopNurseryListItem[]>([]);

  const [allergyKeyword, setAllergyKeyword] = useState('');
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [allergyLoading, setAllergyLoading] = useState(false);
  const [allergyOptions, setAllergyOptions] = useState<AllergyPlantOption[]>([]);

  useEffect(() => {
    if (!imagePreviewUrl) {
      setImagePreviewUrl(null);
      return;
    }
    setImagePreviewUrl(imagePreviewUrl);
  }, [imagePreviewUrl]);

  useEffect(() => {
    let active = true;

    const loadNurseries = async () => {
      try {
        setNurseryLoading(true);
        const response = await searchShopNurseries(
          {
            pagination: {
              pageNumber: 1,
              pageSize: 200,
            },
          },
          false,
          false
        );

        if (!active) {
          return;
        }

        const items = (response?.payload?.items ?? response?.data?.items ?? []).filter((item) => item.isActive);
        setNurseryOptions(items);
      } catch (nurseryError) {
        if (!active) {
          return;
        }

        console.error('Failed to fetch active nurseries:', nurseryError);
        setNurseryOptions([]);
      } finally {
        if (active) {
          setNurseryLoading(false);
        }
      }
    };

    void loadNurseries();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!allergyOpen) {
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        setAllergyLoading(true);
        const items = await getAllergyPlants({ keyword: allergyKeyword.trim(), take: 50 }, false, false);
        if (!active) {
          return;
        }

        setAllergyOptions(items);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        console.error('Failed to fetch allergy plant options:', fetchError);
        setAllergyOptions([]);
      } finally {
        if (active) {
          setAllergyLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [allergyKeyword, allergyOpen]);

  const selectedAllergyIds = useMemo(
    () => selectedAllergies.map((item) => item.plantId),
    [selectedAllergies]
  );

  const noAllergyResults = useMemo(
    () => allergyOpen && !allergyLoading && allergyOptions.length === 0,
    [allergyOpen, allergyLoading, allergyOptions.length]
  );

  const toggleAllergyPlant = (item: AllergyPlantOption) => {
    const newAllergies = selectedAllergies.some((selected) => selected.plantId === item.plantId)
      ? selectedAllergies.filter((selected) => selected.plantId !== item.plantId)
      : [...selectedAllergies, item];
    onSelectedAllergiesChange(newAllergies);
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          {t('title')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={onErrorDismiss}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ justifyContent: 'flex-start', ...hoverLiftStyle }}
          >
            {imageFile ? imageFile.name : t('uploadImageButtonLabel')}
            <input hidden type="file" accept="image/jpeg,image/jpg,image/png,image/heif" onChange={onUploadImage} />
          </Button>

          <TextField
            label={t('fengShuiElement')}
            value={fengShuiElement}
            onChange={(event) => onFengShuiChange(event.target.value)}
            select
            fullWidth
          >
            {FENG_SHUI_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('roomType')}
            value={roomType}
            onChange={(event) => onRoomTypeChange(event.target.value)}
            select
            fullWidth
            required
          >
            {ROOM_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {localizeRoomDesignEnumLabel(option, tRoomDesignEnum, 'RoomType')}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('roomStyle')}
            value={roomStyle}
            onChange={(event) => onRoomStyleChange(event.target.value)}
            select
            fullWidth
            required
          >
            {ROOM_STYLE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {localizeRoomDesignEnumLabel(option, tRoomDesignEnum, 'RoomStyle')}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('minBudget')}
            value={minBudget}
            onChange={(event) => onMinBudgetChange(event.target.value)}
            type="number"
            fullWidth
          />

          <TextField
            label={t('maxBudget')}
            value={maxBudget}
            onChange={(event) => onMaxBudgetChange(event.target.value)}
            type="number"
            fullWidth
          />

          <TextField
            label={t('careLevel')}
            value={careLevelType}
            onChange={(event) => onCareLevelChange(event.target.value)}
            select
            fullWidth
          >
            {CARE_LEVEL_OPTIONS.map((option) => (
              <MenuItem key={option || '__empty'} value={option}>
                {option || '--'}
              </MenuItem>
            ))}
          </TextField>

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
                label={t('nurseries')}
                placeholder={t('nurseriesPlaceholder')}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.name} size="small" />
              ))
            }
          />
        </Box>

        {imagePreviewUrlLocal && (
          <ClickableImageViewer
            images={[imagePreviewUrlLocal]}
            alt="Uploaded room"
            containerClassName=""
            className="object-cover"
            showZoomHint={true}
          />
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={hasAllergy}
                onChange={(event) => {
                  const checked = event.target.checked;
                  onHasAllergyChange(checked);
                  if (!checked) {
                    onSelectedAllergiesChange([]);
                    onAllergyNoteChange('');
                  }
                }}
              />
            }
            label={t('hasAllergy')}
          />
          <FormControlLabel
            control={<Switch checked={petSafe} onChange={(event) => onPetSafeChange(event.target.checked)} />}
            label={t('petSafe')}
          />
          <FormControlLabel
            control={<Switch checked={childSafe} onChange={(event) => onChildSafeChange(event.target.checked)} />}
            label={t('childSafe')}
          />
        </Stack>

        {hasAllergy && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              {t('allergyPlantsTitle')}
            </Typography>

            <ClickAwayListener onClickAway={() => setAllergyOpen(false)}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  value={allergyKeyword}
                  onFocus={() => setAllergyOpen(true)}
                  onChange={(event) => {
                    setAllergyKeyword(event.target.value);
                    setAllergyOpen(true);
                  }}
                  placeholder={t('allergySearchPlaceholder')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: allergyLoading ? (
                        <InputAdornment position="end">
                          <CircularProgress size={16} />
                        </InputAdornment>
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
                              bgcolor: selected
                                ? 'color-mix(in srgb, var(--primary) 18%, white)'
                                : 'transparent',
                            }}
                          >
                            <Typography variant="body2">{option.plantName}</Typography>
                          </ListItemButton>
                        );
                      })}
                      {noAllergyResults && (
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('noAllergyResults')}
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
              label={t('allergyNote')}
              placeholder={t('allergyNotePlaceholder')}
              value={allergyNote}
              onChange={(event) => onAllergyNoteChange(event.target.value)}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            onClick={onAnalyze}
            disabled={isAnalyzing || !imageFile || !roomType.trim() || !roomStyle.trim()}
            sx={{ px: 3, py: 1.2, fontWeight: 'bold', ...hoverLiftStyle }}
          >
            {isAnalyzing ? t('analyzingButton') : t('analyzeButton')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
