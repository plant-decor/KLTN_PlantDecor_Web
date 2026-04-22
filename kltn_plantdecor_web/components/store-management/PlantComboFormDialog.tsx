'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Alert,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Search as SearchIcon } from '@mui/icons-material';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import RichTextEditor from './RichTextEditor';
import { uploadAdminPlantComboImages } from '@/lib/api/adminPlantCombosService';
import type {
  ImageUploadData,
  Plant,
  PlantCombo,
  PlantComboFormData,
} from '@/types/store-management.types';
import { FENG_SHUI_ELEMENT_OPTIONS } from '@/lib/utils/fengShui';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';
import { localizeRoomDesignEnumLabel } from '@/lib/utils/roomDesignEnumI18n';
import Image from 'next/image';

interface OptionItem {
  id: number;
  name: string;
}

type UnknownApiResponse = { payload?: unknown; data?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function readImageUrlFromUnknownPayload(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const images = payload.images;
  if (Array.isArray(images) && images.length > 0) {
    const last = images.at(-1);
    if (isRecord(last) && typeof last.imageUrl === 'string' && last.imageUrl.trim()) {
      return last.imageUrl;
    }
    const maybeLast = images[images.length - 1];
    if (isRecord(maybeLast) && typeof maybeLast.imageUrl === 'string' && maybeLast.imageUrl.trim()) {
      return maybeLast.imageUrl;
    }
  }

  if (typeof payload.imageUrl === 'string' && payload.imageUrl.trim()) {
    return payload.imageUrl;
  }

  return null;
}

interface EnumOptionItem {
  value: number;
  name: string;
}

interface PlantComboFormDialogProps {
  open: boolean;
  editingData?: PlantCombo;
  plants: Plant[];
  plantsLoading?: boolean;
  tags: OptionItem[];
  lightRequirementOptions: EnumOptionItem[];
  roomTypeOptions: EnumOptionItem[];
  enumLoading?: boolean;
  enumError?: string | null;
  onPlantSearch?: (keyword: string) => void;
  onClose: () => void;
  onSubmit: (data: PlantComboFormData, images: ImageUploadData[]) => void;
  isLoading?: boolean;
}

const COMBO_TYPE_OPTIONS = [
  { value: 1, label: 'Space' },
  { value: 2, label: 'Fengshui' },
  { value: 3, label: 'Theme' },
];

const SEASON_OPTIONS = [
  { value: 1, label: 'All' },
  { value: 2, label: 'Spring' },
  { value: 3, label: 'Summer' },
  { value: 4, label: 'Autumn' },
  { value: 5, label: 'Winter' },
  { value: 6, label: 'Tet' },
];

const defaultCombo: PlantComboFormData = {
  comboCode: '',
  comboName: '',
  comboType: 1,
  description: '',
  suitableSpace: 0,
  suitableRooms: [],
  fengShuiElement: 0,
  fengShuiPurpose: '',
  themeName: '',
  themeDescription: '',
  comboPrice: 0,
  season: 1,
  isActive: true,
  tagIds: [],
  comboItems: [],
};

const defaultComboItem = {
  plantId: 0,
  quantity: 1,
  notes: '',
};

const plantSelectMenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 48 * 5,
      overflowY: 'auto',
    },
  },
};

const SEARCH_DEBOUNCE_MS = 300;
const MAX_VISIBLE_SUGGESTIONS = 5;

export default function PlantComboFormDialog({
  open,
  editingData,
  plants,
  plantsLoading = false,
  tags,
  lightRequirementOptions,
  roomTypeOptions,
  enumLoading = false,
  enumError = null,
  onPlantSearch,
  onClose,
  onSubmit,
  isLoading = false,
}: PlantComboFormDialogProps) {
  const locale = useLocale();
  const tCommon = useTranslations('common');
  const tRoomDesignEnum = useTranslations('roomDesignEnums');
  const { control, handleSubmit, reset, setValue, getValues } = useForm<PlantComboFormData>({
    defaultValues: defaultCombo,
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: 'comboItems',
  });

  const watchedComboItems = useWatch({ control, name: 'comboItems' });
  const comboItems = useMemo(() => watchedComboItems ?? [], [watchedComboItems]);

  const [images, setImages] = useState<ImageUploadData[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPlantMap, setSelectedPlantMap] = useState<Record<number, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const lastSearchedKeywordRef = useRef<string | null>(null);
  const searchRootRef = useRef<HTMLDivElement | null>(null);
  const fallbackImage = '/img/fallbackplant.avif'

  // Handle image upload for RichTextEditor
  const handleRichTextImageUpload = async (file: File): Promise<string> => {
    if (!editingData?.id) {
      throw new Error('Combo must be created first before uploading images to description');
    }

    setUploadingImage(true);
    try {
      const response = await uploadAdminPlantComboImages(editingData.id, [file], true);
      const candidate = response as UnknownApiResponse;
      const payload = candidate.payload ?? candidate.data;
      const imageUrl = readImageUrlFromUnknownPayload(payload);

      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      return imageUrl;
    } finally {
      setUploadingImage(false);
    }
  };
  const plantOptions = useMemo(() => {
    return plants.map((item) => ({ id: item.id, name: item.name }));
  }, [plants]);

  const resolvedPlantOptions = useMemo(() => {
    const optionMap = new Map<number, string>();

    plantOptions.forEach((option) => {
      optionMap.set(option.id, option.name);
    });

    comboItems.forEach((item) => {
      const plantId = Number(item?.plantId);
      if (!plantId || optionMap.has(plantId)) {
        return;
      }

      const fallbackName =
        item?.plantName?.trim() ||
        selectedPlantMap[plantId]?.trim() ||
        `Plant #${plantId}`;
      optionMap.set(plantId, fallbackName);
    });

    Object.entries(selectedPlantMap).forEach(([id, name]) => {
      const plantId = Number(id);
      if (!plantId || optionMap.has(plantId)) {
        return;
      }

      optionMap.set(plantId, name);
    });

    return Array.from(optionMap.entries()).map(([id, name]) => ({ id, name }));
  }, [comboItems, plantOptions, selectedPlantMap]);

  const hasKeyword = keyword.trim().length > 0;
  const items = plants;
  const showSuggestionDropdown = searchOpen && (hasKeyword);
  const noResults = useMemo(
    () => hasKeyword && items.length === 0,
    [hasKeyword, items.length]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingData) {
      const initialSelectedPlantMap: Record<number, string> = {};
      (editingData.comboItems || []).forEach((item) => {
        if (item.plantId > 0 && item.plantName?.trim()) {
          initialSelectedPlantMap[item.plantId] = item.plantName.trim();
        }
      });

      // Map suitableSpace from enum name (string) to value (number)
      let mappedSuitableSpace = 0;
      const suitableSpaceValue = editingData.suitableSpace;
      if (suitableSpaceValue) {
        if (typeof suitableSpaceValue === 'number') {
          mappedSuitableSpace = suitableSpaceValue;
        } else if (typeof suitableSpaceValue === 'string') {
          const spaceStr = suitableSpaceValue as string;
          if (spaceStr.length > 0) {
            const found = lightRequirementOptions.find(
              (opt) => opt.name === spaceStr || opt.name.toLowerCase() === spaceStr.toLowerCase()
            );
            mappedSuitableSpace = found?.value ?? 0;
          }
        }
      }

      // Map suitableRooms from enum names (strings) to values (numbers)
      let mappedSuitableRooms: number[] = [];
      if (Array.isArray(editingData.suitableRooms)) {
        mappedSuitableRooms = editingData.suitableRooms
          .map((room) => {
            if (typeof room === 'number') {
              return room;
            }
            if (typeof room === 'string') {
              const roomStr = room as string;
              if (roomStr.length > 0) {
                const found = roomTypeOptions.find(
                  (opt) => opt.name === roomStr || opt.name.toLowerCase() === roomStr.toLowerCase()
                );
                return found?.value ?? 0;
              }
            }
            return 0;
          })
          .filter((value) => value > 0);
      }

      reset({
        comboCode: editingData.comboCode || '',
        comboName: editingData.comboName || '',
        comboType: editingData.comboType || 1,
        description: editingData.description || '',
        suitableSpace: mappedSuitableSpace,
        suitableRooms: mappedSuitableRooms,
        fengShuiElement: editingData.fengShuiElement || 0,
        fengShuiPurpose: editingData.fengShuiPurpose || '',
        themeName: editingData.themeName || '',
        themeDescription: editingData.themeDescription || '',
        comboPrice: Number(editingData.comboPrice) || 0,
        season: editingData.season || 1,
        isActive: editingData.isActive,
        tagIds: editingData.tagsNavigation?.map((item) => item.id) || [],
        comboItems:
          editingData.comboItems?.map((item) => ({
            id: item.id,
            plantComboId: item.plantComboId,
            plantId: item.plantId,
            plantName: item.plantName,
            quantity: item.quantity,
            notes: item.notes ?? '',
          })) || [],
      });

      queueMicrotask(() => {
        setImages(
          (editingData.images || []).map((img) => ({
            id: img.id,
            existingImageId: img.id,
            preview: img.imageUrl,
            url: img.imageUrl,
            isThumbnail: Boolean(img.isPrimary),
            createdAt: img.createdAt,
          }))
        );
      });
      queueMicrotask(() => {
        setKeyword('');
        setSearchOpen(false);
        setSelectedPlantMap(initialSelectedPlantMap);
      });
      lastSearchedKeywordRef.current = null;
      return;
    }

    reset({
      ...defaultCombo,
      comboItems: [{ ...defaultComboItem }],
    });
    queueMicrotask(() => {
      setImages([]);
      setKeyword('');
      setSearchOpen(false);
      setSelectedPlantMap({});
    });
    lastSearchedKeywordRef.current = null;
  }, [editingData, lightRequirementOptions, open, reset, roomTypeOptions]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!hasKeyword) {
      lastSearchedKeywordRef.current = null;
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) {
        return;
      }

      const normalizedKeyword = keyword.trim();
      if (normalizedKeyword === lastSearchedKeywordRef.current) {
        setSearchOpen(true);
        return;
      }

      lastSearchedKeywordRef.current = normalizedKeyword;
      onPlantSearch?.(normalizedKeyword);
      setSearchOpen(true);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [hasKeyword, keyword, onPlantSearch, open]);

  const handleQuickAddPlant = (plant: Plant) => {
    const currentItems = getValues('comboItems') || [];
    const isDuplicate = currentItems.some((item) => Number(item.plantId) === plant.id);

    if (!isDuplicate) {
      appendItem({
        ...defaultComboItem,
        plantId: plant.id,
        plantName: plant.name,
      });
    }

    setSelectedPlantMap((prev) => ({ ...prev, [plant.id]: plant.name }));
    setKeyword('');
    setSearchOpen(false);
  };

  const handleFormSubmit = (data: PlantComboFormData) => {
    const normalizedData: PlantComboFormData = {
      ...data,
      suitableSpace: Number(data.suitableSpace) || 0,
      suitableRooms: Array.from(
        new Set(
          (data.suitableRooms || [])
            .map((item) => Number(item))
            .filter((item) => Number.isInteger(item) && item > 0)
        )
      ),
      comboItems: data.comboItems
        .map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          notes: item.notes?.trim() || '',
        }))
        .filter((item) => item.plantId > 0),
    };

    onSubmit(normalizedData, images);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{editingData ? 'Edit Plant Combo' : 'Add New Plant Combo'}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          {enumError && <Alert severity="error">Cannot load room design enum.</Alert>}

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              {/* <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboCode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Combo Code" fullWidth required disabled={Boolean(editingData)} />
                  )}
                />
              </Grid> */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboName"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Combo Name" fullWidth required />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Combo Type</InputLabel>
                      <Select
                        {...field}
                        value={field.value}
                        label="Combo Type"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        {COMBO_TYPE_OPTIONS.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="season"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Season</InputLabel>
                      <Select
                        {...field}
                        value={field.value}
                        label="Season"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        {SEASON_OPTIONS.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      {...field}
                      label="Description"
                      placeholder="Enter combo description with rich formatting..."
                      minHeight={200}
                      onUploadImage={editingData?.id ? handleRichTextImageUpload : undefined}
                      uploading={uploadingImage}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Suitable Conditions
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="suitableSpace"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Suitable Space</InputLabel>
                      <Select
                        {...field}
                        value={field.value || 0}
                        label="Suitable Space"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        <MenuItem value={0}>Select Light</MenuItem>
                        {lightRequirementOptions.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {localizeRoomDesignEnumLabel(item.name, tRoomDesignEnum, 'LightRequirement')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="suitableRooms"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Suitable Rooms</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Suitable Rooms"
                        input={<OutlinedInput label="Suitable Rooms" />}
                        value={field.value || []}
                        onChange={(event) => {
                          const raw = event.target.value as number[] | string[];
                          field.onChange(raw.map((item) => Number(item)));
                        }}
                        renderValue={(selected) => (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {(selected as number[]).map((id) => {
                              const item = roomTypeOptions.find((option) => option.value === id);
                              return (
                                <Chip
                                  key={id}
                                  size="small"
                                  label={localizeRoomDesignEnumLabel(item?.name || id, tRoomDesignEnum, 'RoomType')}
                                  sx={{ mb: 0.5 }}
                                />
                              );
                            })}
                          </Stack>
                        )}
                      >
                        {roomTypeOptions.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {localizeRoomDesignEnumLabel(item.name, tRoomDesignEnum, 'RoomType')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Feng Shui & Theme
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiElement"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Feng Shui Element</InputLabel>
                      <Select
                        {...field}
                        value={field.value}
                        label="Feng Shui Element"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        <MenuItem value={0}>Select Element</MenuItem>
                        {FENG_SHUI_ELEMENT_OPTIONS.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiPurpose"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Feng Shui Purpose" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="themeName"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Theme Name" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="themeDescription"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      {...field}
                      label="Theme Description"
                      placeholder="Enter theme description with rich formatting..."
                      minHeight={150}
                      onUploadImage={editingData?.id ? handleRichTextImageUpload : undefined}
                      uploading={uploadingImage}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Price and Tags
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboPrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={formatCurrencyInput(field.value ?? 0, 'vi')}
                      label="Combo Price"
                      fullWidth
                      type="text"
                      inputProps={{ inputMode: 'numeric' }}
                      onChange={(event) => field.onChange(parseCurrencyInput(event.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="tagIds"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Tags</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Tags"
                        input={<OutlinedInput label="Tags" />}
                        value={field.value || []}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(typeof value === 'string' ? value.split(',').map(Number) : value);
                        }}
                        renderValue={(selected) => (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {(selected as number[]).map((id) => {
                              const item = tags.find((tag) => tag.id === id);
                              return <Chip key={id} size="small" label={item?.name || id} sx={{ mb: 0.5 }} />;
                            })}
                          </Stack>
                        )}
                      >
                        {tags.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              List of Plants in Combo
            </Typography>
            <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
              <Box ref={searchRootRef} sx={{ position: 'relative', mb: 2, backgroundColor: '#f5f5f5' }}>
                <TextField
                  placeholder={tCommon('searchPlaceholder')}
                  variant="standard"
                  fullWidth
                  value={keyword}
                  onFocus={() => {
                    if (hasKeyword) {
                      setSearchOpen(true);
                    }
                  }}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: 'var(--foreground)' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ mb: 0 }}
                />

                {showSuggestionDropdown && (
                  <Paper
                    elevation={8}
                    sx={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      right: 0,
                      zIndex: 1300,
                      borderRadius: '12px',
                      border: '1px solid var(--card-border)',
                      bgcolor: 'var(--background) ',
                      maxHeight: `calc(${MAX_VISIBLE_SUGGESTIONS} * 64px)`,
                      overflowY: 'auto',
                    }}
                  >
                    <List disablePadding>
                      {items.map((plant, index) => (
                        <ListItemButton
                          key={`${plant.id}-${index}`}
                          onClick={() => handleQuickAddPlant(plant)}
                          sx={{
                            alignItems: 'flex-start',
                            borderBottom:
                              index === items.length - 1 ? 'none' : '1px solid var(--card-border)',
                            '&:hover': {
                              bgcolor: 'color-mix(in srgb, var(--primary) 50%, white)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: '10%',
                              minWidth: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'space-between',

                            }}
                          >
                            <Image
                              src={plant.primaryImageUrl ?? fallbackImage}
                              alt={plant.name}
                              width={40}
                              height={40}
                              style={{ borderRadius: 4, objectFit: 'cover' }}
                            />
                            <Chip
                              size="small"
                              label="Plant"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                bgcolor: 'color-mix(in srgb, var(--primary) 18%, white)',
                                color: 'var(--foreground)',
                              }}
                            />
                          </Box>
                          <Box sx={{ width: '90%', minWidth: 0, display: 'flex', alignItems: 'center' }}>
                            <ListItemText
                              primary={
                                <Box className="flex items-center gap-2">
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'var(--foreground)',
                                      fontWeight: 500,
                                      fontSize: '14px',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'normal',
                                    }}
                                  >                                  {plant.name}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                plant.basePrice ? (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 700 }}
                                  >                                    
                                  {formatCurrency(plant.basePrice, locale)}
                                  </Typography>
                                ) : null
                              }
                            />
                          </Box>
                        </ListItemButton>
                      ))}

                      {noResults && (
                        <Box className="px-3 py-2">
                          <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                            {tCommon('noData')}
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>
            {itemFields.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No plants added to this combo yet. Please use the search box above to quickly add plants, or click the button below to add manually.
              </Typography>
            )}
            <Stack spacing={1.5}>
              {itemFields.map((item, index) => (
                <Stack key={item.id} direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start">
                  <Controller
                    name={`comboItems.${index}.plantId`}
                    control={control}
                    render={({ field }) => (
                      <FormControl sx={{ minWidth: 260 }}>
                        <InputLabel>Plant</InputLabel>
                        <Select
                          {...field}
                          value={field.value || 0}
                          label="Plant"
                          onChange={(event) => {
                            const nextPlantId = Number(event.target.value);
                            field.onChange(nextPlantId);

                            const nextPlantName =
                              resolvedPlantOptions.find((option) => option.id === nextPlantId)?.name ||
                              selectedPlantMap[nextPlantId] ||
                              '';

                            setValue(`comboItems.${index}.plantName`, nextPlantName, { shouldDirty: true });

                            if (nextPlantId > 0 && nextPlantName) {
                              setSelectedPlantMap((prev) => ({
                                ...prev,
                                [nextPlantId]: nextPlantName,
                              }));
                            }
                          }}
                          disabled={plantsLoading}
                          MenuProps={plantSelectMenuProps}
                        >
                          <MenuItem value={0}>Select Plant</MenuItem>
                          {resolvedPlantOptions.map((plant) => (
                            <MenuItem key={plant.id} value={plant.id}>
                              {plant.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  <Controller
                    name={`comboItems.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Quantity"
                        type="number"
                        sx={{ width: 140 }}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    )}
                  />

                  <Controller
                    name={`comboItems.${index}.notes`}
                    control={control}
                    render={({ field }) => <TextField {...field} label="Notes" sx={{ minWidth: 260, flex: 1 }} />}
                  />

                  <IconButton color="error" onClick={() => removeItem(index)}>
                    <Delete />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
            <Button
              startIcon={<Add />}
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => appendItem({ ...defaultComboItem })}
            >
              Add Plant to Combo
            </Button>
          </Box>

          <Divider />

          <ImageUpload images={images} onImagesChange={setImages} label="Combo Images" maxImages={10} />

          <Box>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Chip
                  label={field.value ? 'Active' : 'Inactive'}
                  color={field.value ? 'success' : 'default'}
                  onClick={() => setValue('isActive', !field.value)}
                  clickable
                />
              )}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" disabled={isLoading || enumLoading}>
          {isLoading ? 'Processing...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
