'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import type {
  AdminLightRequirementOption,
  AdminPlantGuideDetail,
  AdminPlantGuideFormData,
} from '@/types/admin-plant-guide.types';
import type { Plant } from '@/types/store-management.types';
import Image from 'next/image';

interface PlantGuideFormDialogProps {
  open: boolean;
  editingData?: AdminPlantGuideDetail;
  plants: Plant[];
  plantsLoading?: boolean;
  onPlantSearch?: (keyword: string) => void;
  lightRequirementOptions: AdminLightRequirementOption[];
  enumLoading?: boolean;
  enumError?: string | null;
  onClose: () => void;
  onSubmit: (data: AdminPlantGuideFormData) => void;
  isLoading?: boolean;
}

const defaultValues: AdminPlantGuideFormData = {
  plantId: '',
  lightRequirement: '',
  watering: '',
  fertilizing: '',
  pruning: '',
  temperature: '',
  humidity: '',
  soil: '',
  careNotes: '',
};

const SEARCH_DEBOUNCE_MS = 300;
const MAX_VISIBLE_SUGGESTIONS = 5;

export default function PlantGuideFormDialog({
  open,
  editingData,
  plants,
  plantsLoading = false,
  onPlantSearch,
  lightRequirementOptions,
  enumLoading = false,
  enumError,
  onClose,
  onSubmit,
  isLoading = false,
}: PlantGuideFormDialogProps) {
   const fallbackImage = '/img/fallbackplant.avif';

  const { control, handleSubmit, reset, setValue, getValues } = useForm<AdminPlantGuideFormData>({
    defaultValues,
  });
  const [plantKeyword, setPlantKeyword] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRootRef = useRef<HTMLDivElement | null>(null);
  const lastSearchedKeywordRef = useRef<string | null>(null);

  const hasKeyword = plantKeyword.trim().length > 0;
  const showSuggestionDropdown = searchOpen && (hasKeyword || plantsLoading);
  const noResults = useMemo(
    () => hasKeyword && !plantsLoading && plants.length === 0,
    [hasKeyword, plants.length, plantsLoading]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingData) {
      reset({
        plantId: String(editingData.plantId),
        lightRequirement: editingData.lightRequirementName || '',
        watering: editingData.watering || '',
        fertilizing: editingData.fertilizing || '',
        pruning: editingData.pruning || '',
        temperature: editingData.temperature || '',
        humidity: editingData.humidity || '',
        soil: editingData.soil || '',
        careNotes: editingData.careNotes || '',
      });
      setPlantKeyword(editingData.plantName || `Plant #${editingData.plantId}`);
      setSearchOpen(false);
      lastSearchedKeywordRef.current = null;
      return;
    }

    reset(defaultValues);
    setPlantKeyword('');
    setSearchOpen(false);
    lastSearchedKeywordRef.current = null;
  }, [editingData, open, reset]);

  useEffect(() => {
    if (!open || !hasKeyword) {
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) {
        return;
      }

      const normalizedKeyword = plantKeyword.trim();
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
  }, [hasKeyword, onPlantSearch, open, plantKeyword]);

  const handleSelectPlant = (plant: Plant) => {
    setValue('plantId', String(plant.id), { shouldDirty: true });
    setPlantKeyword(plant.name);
    setSearchOpen(false);
  };

  const isDisabled = isLoading || enumLoading || lightRequirementOptions.length === 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{editingData ? 'Cập nhật Plant Guide' : 'Tạo Plant Guide mới'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {enumError && <Alert severity="error">{enumError}</Alert>}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="plantId"
                control={control}
                rules={{ required: true }}
                render={() => (
                  <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
                    <Box ref={searchRootRef} sx={{ position: 'relative' }}>
                      <TextField
                        label="Plant"
                        required
                        fullWidth
                        value={plantKeyword}
                        placeholder="Tìm và chọn cây"
                        onFocus={() => {
                          if (hasKeyword) {
                            setSearchOpen(true);
                          }
                        }}
                        onChange={(event) => {
                          setPlantKeyword(event.target.value);
                          const currentPlantId = getValues('plantId');
                          if (currentPlantId) {
                            setValue('plantId', '', { shouldDirty: true });
                          }
                        }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />

                      {showSuggestionDropdown && (
                        <Paper
                          elevation={6}
                          sx={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            zIndex: 1300,
                            borderRadius: '12px',
                            border: '1px solid var(--card-border)',
                            bgcolor: 'var(--background)',
                            maxHeight: `calc(${MAX_VISIBLE_SUGGESTIONS} * 64px)`,
                            overflowY: 'auto',
                          }}
                        >
                          <List disablePadding>
                            {plants.map((plant, index) => (
                              <ListItemButton
                                key={`${plant.id}-${index}`}
                                onClick={() => handleSelectPlant(plant)}
                                sx={{
                                  alignItems: 'flex-start',
                                  borderBottom:
                                    index === plants.length - 1 ? 'none' : '1px solid var(--card-border)',
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
                                </Box>
                                <Box>

                                <ListItemText
                                  primary={plant.name}
                                />
                                  </Box>
                              </ListItemButton>
                            ))}

                            {plantsLoading && (
                              <Box className="px-3 py-2">
                                <Typography variant="body2" color="text.secondary">
                                  Đang tìm cây...
                                </Typography>
                              </Box>
                            )}

                            {noResults && (
                              <Box className="px-3 py-2">
                                <Typography variant="body2" color="text.secondary">
                                  Không tìm thấy cây phù hợp
                                </Typography>
                              </Box>
                            )}
                          </List>
                        </Paper>
                      )}
                    </Box>
                  </ClickAwayListener>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="lightRequirement"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth required>
                    <InputLabel>Ánh sáng</InputLabel>
                    <Select {...field} label="Ánh sáng">
                      <MenuItem value="" disabled>
                        Chọn ánh sáng
                      </MenuItem>
                      {lightRequirementOptions.map((item) => (
                        <MenuItem key={item.value} value={item.name}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="watering"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Tưới nước" required fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="fertilizing"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Bón phân" required fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="pruning"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Cắt tỉa" required fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="temperature"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Nhiệt độ" required fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="humidity"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Độ ẩm" required fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="soil"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Đất trồng" required fullWidth />}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="careNotes"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label="Ghi chú chăm sóc" required fullWidth multiline minRows={4} />
                )}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isDisabled} className="bg-primary!">
          {isLoading ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
