'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
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
import type {
  ImageUploadData,
  Plant,
  PlantCombo,
  PlantComboFormData,
} from '@/types/store-management.types';
import { FENG_SHUI_ELEMENT_OPTIONS } from '@/lib/utils/fengShui';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';
import Image from 'next/image';

interface OptionItem {
  id: number;
  name: string;
}

interface PlantComboFormDialogProps {
  open: boolean;
  editingData?: PlantCombo;
  plants: Plant[];
  plantsLoading?: boolean;
  tags: OptionItem[];
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
  suitableSpace: '',
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
  onPlantSearch,
  onClose,
  onSubmit,
  isLoading = false,
}: PlantComboFormDialogProps) {
  const locale = useLocale();
  const tCommon = useTranslations('common');
  const { control, handleSubmit, reset, setValue, getValues } = useForm<PlantComboFormData>({
    defaultValues: defaultCombo,
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: 'comboItems',
  });

  const suitableRooms = useWatch({ control, name: 'suitableRooms' }) || [];
  const watchedComboItems = useWatch({ control, name: 'comboItems' });
  const comboItems = useMemo(() => watchedComboItems ?? [], [watchedComboItems]);

  const [images, setImages] = useState<ImageUploadData[]>([]);
  const [roomDraft, setRoomDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPlantMap, setSelectedPlantMap] = useState<Record<number, string>>({});
  const lastSearchedKeywordRef = useRef<string | null>(null);
  const searchRootRef = useRef<HTMLDivElement | null>(null);
  const fallbackImage = '/img/fallbackplant.avif'
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

      reset({
        comboCode: editingData.comboCode || '',
        comboName: editingData.comboName || '',
        comboType: editingData.comboType || 1,
        description: editingData.description || '',
        suitableSpace: editingData.suitableSpace || '',
        suitableRooms: editingData.suitableRooms || [],
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
      setRoomDraft('');
      setKeyword('');
      setSearchOpen(false);
      setSelectedPlantMap({});
    });
    lastSearchedKeywordRef.current = null;
  }, [editingData, open, reset]);

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

  const handleAddRoom = () => {
    const value = roomDraft.trim();
    if (!value) {
      return;
    }

    const current = getValues('suitableRooms');
    if (current.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setRoomDraft('');
      return;
    }

    setValue('suitableRooms', [...current, value], { shouldDirty: true });
    setRoomDraft('');
  };

  const handleRemoveRoom = (index: number) => {
    const next = suitableRooms.filter((_, roomIndex) => roomIndex !== index);
    setValue('suitableRooms', next, { shouldDirty: true });
  };

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
      suitableRooms: data.suitableRooms.map((item) => item.trim()).filter(Boolean),
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
      <DialogTitle>{editingData ? 'Chỉnh sửa combo cây' : 'Thêm combo cây mới'}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboCode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mã combo" fullWidth required disabled={Boolean(editingData)} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboName"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Tên combo" fullWidth required />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comboType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Loại combo</InputLabel>
                      <Select
                        {...field}
                        value={field.value}
                        label="Loại combo"
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
                      <InputLabel>Mùa</InputLabel>
                      <Select
                        {...field}
                        value={field.value}
                        label="Mùa"
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
                  render={({ field }) => <TextField {...field} label="Mô tả" fullWidth multiline rows={3} />}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Điều kiện phù hợp
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="suitableSpace"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Không gian phù hợp" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Thêm phòng phù hợp"
                  fullWidth
                  value={roomDraft}
                  onChange={(event) => setRoomDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddRoom();
                    }
                  }}
                  helperText="Nhấn Enter hoặc nút Thêm"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {suitableRooms.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có phòng phù hợp
                    </Typography>
                  )}
                  {suitableRooms.map((room, index) => (
                    <Chip
                      key={`${room}-${index}`}
                      label={room}
                      onDelete={() => handleRemoveRoom(index)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" size="small" onClick={handleAddRoom}>
                  Thêm phòng
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Phong thủy và chủ đề
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fengShuiElement"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Yếu tố phong thủy</InputLabel>
                      <Select
                        {...field}
                        value={field.value}
                        label="Yếu tố phong thủy"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        <MenuItem value={0}>Chọn mệnh</MenuItem>
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
                  render={({ field }) => <TextField {...field} label="Mục đích phong thủy" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="themeName"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Tên chủ đề" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="themeDescription"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Mô tả chủ đề" fullWidth />}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Giá và tags
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
                      label="Giá combo"
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
              Danh sách cây trong combo
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
                Chưa có cây trong combo, vui lòng thêm ít nhất 1 cây.
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
                        <InputLabel>Cây</InputLabel>
                        <Select
                          {...field}
                          value={field.value || 0}
                          label="Cây"
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
                          <MenuItem value={0}>Chọn cây</MenuItem>
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
                        label="Số lượng"
                        type="number"
                        sx={{ width: 140 }}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    )}
                  />

                  <Controller
                    name={`comboItems.${index}.notes`}
                    control={control}
                    render={({ field }) => <TextField {...field} label="Ghi chú" sx={{ minWidth: 260, flex: 1 }} />}
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
              Thêm cây vào combo
            </Button>
          </Box>

          <Divider />

          <ImageUpload images={images} onImagesChange={setImages} label="Hình ảnh combo" maxImages={10} />

          <Box>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Chip
                  label={field.value ? 'Đang kích hoạt' : 'Đang vô hiệu'}
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
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" disabled={isLoading}>
          {isLoading ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
