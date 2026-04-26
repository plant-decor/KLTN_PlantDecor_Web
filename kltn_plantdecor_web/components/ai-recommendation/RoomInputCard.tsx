'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { getRoomDesignEnums, searchShopNurseries, type PlantEnumValue, type ShopNurseryListItem } from '@/lib/api/shopPlantsService';
import { getAllergyPlants } from '@/lib/api/aiRecommendationService';
import type { AllergyPlantOption, RoomViewAngle } from '@/types/ai-recommendation.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import ClickableImageViewer from '../image-view/ClickableImageViewer';
import { CustomLoading } from '../CustomLoading';

const SEARCH_DEBOUNCE_MS = 300;
const MAX_VISIBLE_ITEMS = 6;

const CARE_LEVEL_OPTIONS = ['', 'Easy', 'Medium', 'Hard', 'Expert'];
const ROOM_VIEW_ANGLES: RoomViewAngle[] = ['Front', 'Left', 'Right', 'Back'];
const INITIAL_VIEW_ANGLES: RoomViewAngle[] = ['Front'];

type RoomDesignEnumMap = {
  roomTypes: PlantEnumValue[];
  roomStyles: PlantEnumValue[];
  lightRequirements: PlantEnumValue[];
  lightDirections: PlantEnumValue[];
  dominantDirections: PlantEnumValue[];
  roomViewAngles: PlantEnumValue[];
  fengShuiElements: PlantEnumValue[];
};

const resolveEnumMap = (groups: Array<{ enumName: string; values: PlantEnumValue[] }>): RoomDesignEnumMap => {
  const map = new Map<string, PlantEnumValue[]>();
  groups.forEach((group) => {
    if (group?.enumName) {
      map.set(group.enumName, Array.isArray(group.values) ? group.values : []);
    }
  });

  return {
    roomTypes: map.get('RoomType') ?? [],
    roomStyles: map.get('RoomStyle') ?? [],
    lightRequirements: map.get('LightRequirement') ?? [],
    lightDirections: map.get('LightDirection') ?? [],
    dominantDirections: map.get('DominantDirection') ?? [],
    roomViewAngles: map.get('RoomViewAngle') ?? [],
    fengShuiElements: map.get('FengShuiElement') ?? [],
  };
};

interface RoomInputCardProps {
  imagesByViewAngle: Partial<Record<RoomViewAngle, File>>;
  imagePreviewUrlsByViewAngle: Partial<Record<RoomViewAngle, string>>;
  fengShuiElement: string;
  roomType: string;
  roomStyle: string;
  roomArea: string;
  lightDirection: string;
  dominantDirection: string;
  naturalLightLevel: string;
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
  onUploadImage: (viewAngle: RoomViewAngle, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (viewAngle: RoomViewAngle) => void;
  onFengShuiChange: (value: string) => void;
  onRoomTypeChange: (value: string) => void;
  onRoomStyleChange: (value: string) => void;
  onRoomAreaChange: (value: string) => void;
  onLightDirectionChange: (value: string) => void;
  onDominantDirectionChange: (value: string) => void;
  onNaturalLightLevelChange: (value: string) => void;
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
  imagesByViewAngle,
  imagePreviewUrlsByViewAngle,
  fengShuiElement,
  roomType,
  roomStyle,
  roomArea,
  lightDirection,
  dominantDirection,
  naturalLightLevel,
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
  onRemoveImage,
  onFengShuiChange,
  onRoomTypeChange,
  onRoomStyleChange,
  onRoomAreaChange,
  onLightDirectionChange,
  onDominantDirectionChange,
  onNaturalLightLevelChange,
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
  const [enumLoading, setEnumLoading] = useState(false);
  const [enumMap, setEnumMap] = useState<RoomDesignEnumMap>(() =>
    resolveEnumMap([])
  );
  const [nurseryLoading, setNurseryLoading] = useState(false);
  const [nurseryOptions, setNurseryOptions] = useState<ShopNurseryListItem[]>([]);

  const [allergyKeyword, setAllergyKeyword] = useState('');
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [allergyLoading, setAllergyLoading] = useState(false);
  const [allergyOptions, setAllergyOptions] = useState<AllergyPlantOption[]>([]);

  useEffect(() => {
    let active = true;

    const loadEnums = async () => {
      try {
        setEnumLoading(true);
        const response = await getRoomDesignEnums(false, false).catch(() => null);
        if (!active) {
          return;
        }
        const payload = (response?.payload ?? response?.data ?? []) as Array<{ enumName: string; values: PlantEnumValue[] }>;
        setEnumMap(resolveEnumMap(Array.isArray(payload) ? payload : []));
      } catch (fetchError) {
        if (!active) {
          return;
        }
        console.error('Failed to fetch room design enums:', fetchError);
        setEnumMap(resolveEnumMap([]));
      } finally {
        if (active) {
          setEnumLoading(false);
        }
      }
    };

    void loadEnums();

    return () => {
      active = false;
    };
  }, []);

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

  const humanizeEnumName = (value: string) => {
    if (!value) return value;
    const withSpaces = value
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  const viewAnglesToRender = useMemo<RoomViewAngle[]>(() => {
    if (imagesByViewAngle.Front) {
      return ROOM_VIEW_ANGLES;
    }
    return INITIAL_VIEW_ANGLES;
  }, [imagesByViewAngle.Front]);

  return (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          1) Room input and preferences
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={onErrorDismiss}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Upload room image (Front required)
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              {viewAnglesToRender.map((angle) => {
                const file = imagesByViewAngle[angle];
                return (
                  <Stack key={angle} direction="row" spacing={1} alignItems="center">
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ justifyContent: 'flex-start', flex: 1, ...hoverLiftStyle }}
                    >
                      {file ? `${angle}: ${file.name}` : `${angle}: Upload`}
                      <input
                        hidden
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/heif"
                        onChange={(event) => onUploadImage(angle, event)}
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={!file}
                      onClick={() => onRemoveImage(angle)}
                      sx={{ minWidth: 88, ...hoverLiftStyle }}
                    >
                      Remove
                    </Button>
                  </Stack>
                );
              })}
            </Box>
          </Box>

          <TextField
            label="Feng Shui element"
            value={fengShuiElement}
            onChange={(event) => onFengShuiChange(event.target.value)}
            select
            fullWidth
            disabled={enumLoading}
          >
            <MenuItem value="">{'--'}</MenuItem>
            {enumMap.fengShuiElements.map((option) => (
              <MenuItem key={option.value} value={option.name}>
                {humanizeEnumName(option.name)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Room type"
            value={roomType}
            onChange={(event) => onRoomTypeChange(event.target.value)}
            select
            fullWidth
            required
            disabled={enumLoading}
          >
            {enumMap.roomTypes.map((option) => (
              <MenuItem key={option.value} value={option.name}>
                {humanizeEnumName(option.name)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Room style"
            value={roomStyle}
            onChange={(event) => onRoomStyleChange(event.target.value)}
            select
            fullWidth
            required
            disabled={enumLoading}
          >
            {enumMap.roomStyles.map((option) => (
              <MenuItem key={option.value} value={option.name}>
                {humanizeEnumName(option.name)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Room area (m²)"
            value={roomArea}
            onChange={(event) => onRoomAreaChange(event.target.value)}
            type="number"
            fullWidth
            inputProps={{ step: '0.1', min: 0 }}
          />

          <TextField
            label="Light direction"
            value={lightDirection}
            onChange={(event) => onLightDirectionChange(event.target.value)}
            select
            fullWidth
            disabled={enumLoading}
          >
            {enumMap.lightDirections.map((option) => (
              <MenuItem key={option.value} value={option.name}>
                {humanizeEnumName(option.name)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Dominant direction"
            value={dominantDirection}
            onChange={(event) => onDominantDirectionChange(event.target.value)}
            select
            fullWidth
            disabled={enumLoading}
          >
            {enumMap.dominantDirections.map((option) => (
              <MenuItem key={option.value} value={option.name}>
                {humanizeEnumName(option.name)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Natural light level"
            value={naturalLightLevel}
            onChange={(event) => onNaturalLightLevelChange(event.target.value)}
            select
            fullWidth
            disabled={enumLoading}
          >
            {enumMap.lightRequirements.map((option) => (
              <MenuItem key={option.value} value={option.name}>
                {humanizeEnumName(option.name)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Min budget"
            value={minBudget}
            onChange={(event) => onMinBudgetChange(event.target.value)}
            type="number"
            fullWidth
          />

          <TextField
            label="Max budget"
            value={maxBudget}
            onChange={(event) => onMaxBudgetChange(event.target.value)}
            type="number"
            fullWidth
          />

          <TextField
            label="Care level"
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
                label="Preferred nurseries (optional)"
                placeholder="Select one or more nurseries"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.name} size="small" />
              ))
            }
          />
        </Box>

        {Object.keys(imagePreviewUrlsByViewAngle).length > 0 && (
          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {viewAnglesToRender.map((angle) => {
              const url = imagePreviewUrlsByViewAngle[angle];
              if (!url) {
                return null;
              }
              return (
                <Box key={angle}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.75 }}>
                    {angle}
                  </Typography>
                  <ClickableImageViewer
                    images={[url]}
                    alt={`Uploaded room ${angle}`}
                    containerClassName=""
                    className="object-cover"
                    showZoomHint={true}
                  />
                </Box>
              );
            })}
          </Box>
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
            label="Has allergy"
          />
          <FormControlLabel
            control={<Switch checked={petSafe} onChange={(event) => onPetSafeChange(event.target.checked)} />}
            label="Pet safe"
          />
          <FormControlLabel
            control={<Switch checked={childSafe} onChange={(event) => onChildSafeChange(event.target.checked)} />}
            label="Child safe"
          />
        </Stack>

        {hasAllergy && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Allergy plants
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
                  placeholder="Search allergy plants"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: allergyLoading ? (
                        <InputAdornment position="end">
                          <CustomLoading size={16} />
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
                            No matching plants
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
              onChange={(event) => onAllergyNoteChange(event.target.value)}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            onClick={onAnalyze}
            disabled={isAnalyzing || !imagesByViewAngle.Front || !roomType.trim() || !roomStyle.trim()}
            sx={{ px: 3, py: 1.2, fontWeight: 'bold', ...hoverLiftStyle, backgroundColor: 'var(--primary)' }}
          >
            {isAnalyzing ? <> <CustomLoading size={22} /> Analyzing room... </> : 'Analyze and recommend'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
