'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DeleteOutline, Add, EditNoteOutlined, Search as SearchIcon, VisibilityOutlined } from '@mui/icons-material';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type {
  AdminDesignTemplateDetail,
  DesignTemplateTier,
  DesignTemplateTierItem,
  DesignTemplateTierItemCreateRequest,
} from '@/types/admin-design-template.types';
import {
  DESIGN_TEMPLATE_TIER_ITEM_TYPE_OPTIONS,
  formatCurrency,
  formControlDisabledSelectBlackTextSx,
  formControlLabelDisabledBlackTextSx,
  textFieldDisabledBlackInputSx,
} from './designTemplateManagement.constants';
import { formatCurrency as formatCurrencyLocale, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';
import { CustomLoading } from '@/components/CustomLoading';
import { searchAdminPlantsForCombo } from '@/lib/api/adminPlantCombosService';
import { searchAdminMaterials } from '@/lib/api/adminMaterialsService';
import type { Material, Plant } from '@/types/store-management.types';

const ITEM_TYPE_PLANT = 1;
const ITEM_TYPE_MATERIAL = 2;

const SEARCH_DEBOUNCE_MS = 500;
const PLANT_CATALOG_PAGE_SIZE = 1000;
const PLANT_SEARCH_PAGE_SIZE = 50;
const MATERIAL_CATALOG_PAGE_SIZE = 1000;
const MATERIAL_SEARCH_PAGE_SIZE = 20;
const MAX_VISIBLE_SUGGESTIONS = 5;
const FALLBACK_IMAGE = '/img/fallbackplant.avif';

const plantSelectMenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 48 * 5,
      overflowY: 'auto',
    },
  },
};

type UnknownRecord = Record<string, unknown>;

const stripEmptyStringFields = <T extends UnknownRecord>(value: T): T => {
  const next: UnknownRecord = {};
  Object.entries(value).forEach(([key, raw]) => {
    if (typeof raw === 'string' && raw.trim() === '') {
      return;
    }
    next[key] = raw;
  });
  return next as T;
};

const readPayload = <T,>(response: { data?: T; payload?: T }): T | undefined => {
  return response.payload ?? response.data;
};

export type DesignTemplateTierItemFormRow = DesignTemplateTierItemCreateRequest & {
  plantDisplayName?: string;
  materialDisplayName?: string;
};

export interface DesignTemplateTierFormValue {
  tierName: string;
  minArea: number;
  maxArea: number;
  packagePrice: number;
  scopedOfWork: string;
  estimatedDays: number;
  isActive: boolean;
  items: DesignTemplateTierItemFormRow[];
}

interface DesignTemplateTierDialogProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  template: AdminDesignTemplateDetail | null;
  tier: DesignTemplateTier | null;
  existingTiers: DesignTemplateTier[];
  detailLoading: boolean;
  detailError: string | null;
  /** When mode is create: false = list only; true = show add-tier form. Edit mode ignores this for fields. */
  showCreateTierForm: boolean;
  formValue: DesignTemplateTierFormValue;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onFormChange: (updater: (prev: DesignTemplateTierFormValue) => DesignTemplateTierFormValue) => void;
  onEditExistingTier: (tier: DesignTemplateTier) => void;
  onViewExistingTier: (tier: DesignTemplateTier) => void;
  onDeactivateExistingTier: (tier: DesignTemplateTier) => void;
  /** Leave tier detail and return to list-only (create manage state). */
  onBackToTierList?: () => void;
  /** Switch back to creating a new tier (e.g. after editing one tier in this dialog). */
  onStartCreateNewTier?: () => void;
  /** Hide add-tier form and reset draft (create mode only). */
  onCancelCreateTierForm?: () => void;
}

const createEmptyTierItem = (): DesignTemplateTierItemFormRow => ({
  materialId: null,
  plantId: null,
  itemType: ITEM_TYPE_PLANT,
  quantity: 1,
});

const formatTierItemTypeLabel = (item: DesignTemplateTierItem): string => {
  const fromApi = item.itemTypeName?.trim();
  if (fromApi) {
    return fromApi;
  }
  return DESIGN_TEMPLATE_TIER_ITEM_TYPE_OPTIONS.find((option) => option.value === item.itemType)?.label ?? `Type ${item.itemType}`;
};

const formatTierItemQuantity = (quantity: number): string => {
  if (!Number.isFinite(quantity)) {
    return '—';
  }
  const n = Number(quantity);
  return Number.isInteger(n) ? String(n) : String(n);
};

interface TierCreateItemPlantMaterialFieldsProps {
  item: DesignTemplateTierItemFormRow;
  disabled: boolean;
  catalogPlants: Plant[];
  catalogPlantsLoading: boolean;
  catalogMaterials: Material[];
  catalogMaterialsLoading: boolean;
  onPatch: (patch: Partial<DesignTemplateTierItemFormRow>) => void;
}

function TierCreateItemPlantMaterialFields({
  item,
  disabled,
  catalogPlants,
  catalogPlantsLoading,
  catalogMaterials,
  catalogMaterialsLoading,
  onPatch,
}: TierCreateItemPlantMaterialFieldsProps) {
  const locale = useLocale();
  const tCommon = useTranslations('common');

  const plantSearchRootRef = useRef<HTMLDivElement | null>(null);
  const plantSearchRequestRef = useRef(0);
  const lastPlantKeywordRef = useRef<string | null>(null);

  const [plantKeyword, setPlantKeyword] = useState('');
  const [plantSearchOpen, setPlantSearchOpen] = useState(false);
  const [plantSearchItems, setPlantSearchItems] = useState<Plant[]>([]);
  const [plantSearchLoading, setPlantSearchLoading] = useState(false);

  const materialSearchRootRef = useRef<HTMLDivElement | null>(null);
  const materialSearchRequestRef = useRef(0);
  const lastMaterialKeywordRef = useRef<string | null>(null);

  const [materialKeyword, setMaterialKeyword] = useState('');
  const [materialSearchOpen, setMaterialSearchOpen] = useState(false);
  const [materialSearchItems, setMaterialSearchItems] = useState<Material[]>([]);
  const [materialSearchLoading, setMaterialSearchLoading] = useState(false);

  const hasPlantKeyword = plantKeyword.trim().length > 0;
  const showPlantDropdown = plantSearchOpen && (hasPlantKeyword || plantSearchLoading);
  const plantNoResults = hasPlantKeyword && !plantSearchLoading && plantSearchItems.length === 0;

  const hasMaterialKeyword = materialKeyword.trim().length > 0;
  const showMaterialDropdown = materialSearchOpen && (hasMaterialKeyword || materialSearchLoading);
  const materialNoResults = hasMaterialKeyword && !materialSearchLoading && materialSearchItems.length === 0;

  /** Select: full catalog only (API without keyword); không gộp kết quả ô tìm kiếm. */
  const selectPlantOptions = useMemo(() => {
    const map = new Map<number, string>();
    catalogPlants.forEach((p) => map.set(p.id, p.name));
    const pid = item.plantId != null ? Number(item.plantId) : 0;
    if (pid > 0 && !map.has(pid)) {
      map.set(pid, item.plantDisplayName?.trim() || `Plant #${pid}`);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [catalogPlants, item.plantDisplayName, item.plantId]);

  const selectMaterialOptions = useMemo(() => {
    const map = new Map<number, { name: string; code?: string }>();
    catalogMaterials.forEach((m) => map.set(m.id, { name: m.name, code: m.materialCode }));
    const mid = item.materialId != null ? Number(item.materialId) : 0;
    if (mid > 0 && !map.has(mid)) {
      map.set(mid, { name: item.materialDisplayName?.trim() || `Material #${mid}` });
    }
    return Array.from(map.entries()).map(([id, meta]) => ({ id, name: meta.name, code: meta.code }));
  }, [catalogMaterials, item.materialDisplayName, item.materialId]);

  useEffect(() => {
    if (item.itemType !== ITEM_TYPE_PLANT) {
      return;
    }
    if (!hasPlantKeyword) {
      lastPlantKeywordRef.current = null;
      setPlantSearchItems([]);
      setPlantSearchOpen(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) {
        return;
      }
      const normalized = plantKeyword.trim();
      if (normalized === lastPlantKeywordRef.current) {
        setPlantSearchOpen(true);
        return;
      }
      lastPlantKeywordRef.current = normalized;
      const requestId = ++plantSearchRequestRef.current;
      setPlantSearchLoading(true);
      void (async () => {
        try {
          const response = await searchAdminPlantsForCombo(
            stripEmptyStringFields({
              pagination: { pageNumber: 1, pageSize: PLANT_SEARCH_PAGE_SIZE },
              keyword: normalized,
              isActive: true,
              isUniqueInstance: false,
              sortBy: '',
              sortDirection: '',
            }),
            false
          );
          const payload = readPayload(response);
          if (requestId === plantSearchRequestRef.current) {
            setPlantSearchItems(payload?.items ?? []);
          }
        } finally {
          if (requestId === plantSearchRequestRef.current) {
            setPlantSearchLoading(false);
          }
        }
      })();
      setPlantSearchOpen(true);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [hasPlantKeyword, item.itemType, plantKeyword]);

  useEffect(() => {
    if (item.itemType !== ITEM_TYPE_MATERIAL) {
      return;
    }
    if (!hasMaterialKeyword) {
      lastMaterialKeywordRef.current = null;
      setMaterialSearchItems([]);
      setMaterialSearchOpen(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) {
        return;
      }
      const normalized = materialKeyword.trim();
      if (normalized === lastMaterialKeywordRef.current) {
        setMaterialSearchOpen(true);
        return;
      }
      lastMaterialKeywordRef.current = normalized;
      const requestId = ++materialSearchRequestRef.current;
      setMaterialSearchLoading(true);
      void (async () => {
        try {
          const response = await searchAdminMaterials(
            {
              pagination: { pageNumber: 1, pageSize: MATERIAL_SEARCH_PAGE_SIZE },
              keyword: normalized,
              isActive: true,
            },
            false
          );
          const payload = readPayload(response);
          if (requestId === materialSearchRequestRef.current) {
            setMaterialSearchItems(payload?.items ?? []);
          }
        } finally {
          if (requestId === materialSearchRequestRef.current) {
            setMaterialSearchLoading(false);
          }
        }
      })();
      setMaterialSearchOpen(true);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [hasMaterialKeyword, item.itemType, materialKeyword]);

  const handlePickPlant = useCallback(
    (plant: Plant) => {
      onPatch({
        materialId: null,
        plantId: plant.id,
        plantDisplayName: plant.name,
        materialDisplayName: undefined,
      });
      setPlantKeyword('');
      setPlantSearchOpen(false);
    },
    [onPatch]
  );

  const handlePickMaterial = useCallback(
    (material: Material) => {
      onPatch({
        materialId: material.id,
        plantId: null,
        plantDisplayName: undefined,
        materialDisplayName: material.name,
      });
      setMaterialKeyword('');
      setMaterialSearchOpen(false);
    },
    [onPatch]
  );

  if (item.itemType === ITEM_TYPE_PLANT) {
    return (
      <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
        <ClickAwayListener onClickAway={() => setPlantSearchOpen(false)}>
          <Box ref={plantSearchRootRef} sx={{ position: 'relative', backgroundColor: '#f5f5f5', borderRadius: 1, px: 1 }}>
            <TextField
              placeholder={tCommon('searchPlaceholder')}
              variant="standard"
              fullWidth
              value={plantKeyword}
              disabled={disabled}
              onFocus={() => {
                if (hasPlantKeyword) {
                  setPlantSearchOpen(true);
                }
              }}
              onChange={(event) => setPlantKeyword(event.target.value)}
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
            {showPlantDropdown && (
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
                  {plantSearchLoading && (
                    <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <CustomLoading size={18} ariaLabel="Searching plants" />
                    </Box>
                  )}
                  {plantSearchItems.map((plant, idx) => (
                    <ListItemButton
                      key={`${plant.id}-${idx}`}
                      onClick={() => handlePickPlant(plant)}
                      sx={{
                        alignItems: 'flex-start',
                        borderBottom: idx === plantSearchItems.length - 1 ? 'none' : '1px solid var(--card-border)',
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
                          src={plant.primaryImageUrl ?? FALLBACK_IMAGE}
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
                              }}
                            >
                              {plant.name}
                            </Typography>
                          }
                          secondary={
                            plant.basePrice ? (
                              <Typography component="span" variant="caption" sx={{ color: 'var(--foreground)', fontWeight: 700 }}>
                                {formatCurrencyLocale(plant.basePrice, locale)}
                              </Typography>
                            ) : null
                          }
                        />
                      </Box>
                    </ListItemButton>
                  ))}
                  {plantNoResults && (
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

        <FormControl fullWidth sx={{ ...formControlDisabledSelectBlackTextSx, minWidth: { xs: '100%', sm: 260 }, mt: 0.5 }}>
          <InputLabel>Plant</InputLabel>
          <Select
            value={item.plantId != null && item.plantId > 0 ? item.plantId : 0}
            label="Plant"
            disabled={disabled || catalogPlantsLoading}
            onChange={(event) => {
              const nextId = Number(event.target.value);
              if (!nextId) {
                onPatch({
                  materialId: null,
                  plantId: null,
                  plantDisplayName: undefined,
                  materialDisplayName: undefined,
                });
                return;
              }
              const name =
                selectPlantOptions.find((o) => o.id === nextId)?.name ||
                item.plantDisplayName ||
                `Plant #${nextId}`;
              onPatch({
                materialId: null,
                plantId: nextId,
                plantDisplayName: name,
                materialDisplayName: undefined,
              });
            }}
            MenuProps={plantSelectMenuProps}
          >
            <MenuItem value={0}>
              <em>Select plant</em>
            </MenuItem>
            {selectPlantOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
      <ClickAwayListener onClickAway={() => setMaterialSearchOpen(false)}>
        <Box ref={materialSearchRootRef} sx={{ position: 'relative', backgroundColor: '#f5f5f5', borderRadius: 1, px: 1 }}>
          <TextField
            placeholder={tCommon('searchPlaceholder')}
            variant="standard"
            fullWidth
            value={materialKeyword}
            disabled={disabled}
            onFocus={() => {
              if (hasMaterialKeyword) {
                setMaterialSearchOpen(true);
              }
            }}
            onChange={(event) => setMaterialKeyword(event.target.value)}
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
          {showMaterialDropdown && (
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
                {materialSearchLoading && (
                  <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CustomLoading size={18} ariaLabel="Searching materials" />
                  </Box>
                )}
                {materialSearchItems.map((material, idx) => (
                  <ListItemButton
                    key={`${material.id}-${idx}`}
                    onClick={() => handlePickMaterial(material)}
                    sx={{
                      alignItems: 'flex-start',
                      borderBottom: idx === materialSearchItems.length - 1 ? 'none' : '1px solid var(--card-border)',
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
                        src={material.primaryImageUrl ?? FALLBACK_IMAGE}
                        alt={material.name}
                        width={40}
                        height={40}
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                      />
                      <Chip
                        size="small"
                        label="Material"
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
                            }}
                          >
                            {material.name}
                          </Typography>
                        }
                        secondary={
                          <Typography component="span" variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {[material.materialCode, material.basePrice != null ? formatCurrencyLocale(material.basePrice, locale) : '']
                              .filter(Boolean)
                              .join(' · ')}
                          </Typography>
                        }
                      />
                    </Box>
                  </ListItemButton>
                ))}
                {materialNoResults && (
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

      <FormControl fullWidth sx={{ ...formControlDisabledSelectBlackTextSx, minWidth: { xs: '100%', sm: 260 }, mt: 0.5 }}>
        <InputLabel>Material</InputLabel>
        <Select
          value={item.materialId != null && item.materialId > 0 ? item.materialId : 0}
          label="Material"
          disabled={disabled || catalogMaterialsLoading}
          onChange={(event) => {
            const nextId = Number(event.target.value);
            if (!nextId) {
              onPatch({
                materialId: null,
                plantId: null,
                plantDisplayName: undefined,
                materialDisplayName: undefined,
              });
              return;
            }
            const name =
              selectMaterialOptions.find((o) => o.id === nextId)?.name ||
              item.materialDisplayName ||
              `Material #${nextId}`;
            onPatch({
              materialId: nextId,
              plantId: null,
              plantDisplayName: undefined,
              materialDisplayName: name,
            });
          }}
          MenuProps={plantSelectMenuProps}
        >
          <MenuItem value={0}>
            <em>Select material</em>
          </MenuItem>
          {selectMaterialOptions.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.code ? `${m.code} — ${m.name}` : m.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

export default function DesignTemplateTierDialog({
  open,
  mode,
  template,
  tier,
  existingTiers,
  showCreateTierForm,
  detailLoading,
  detailError,
  formValue,
  submitting,
  onClose,
  onSubmit,
  onFormChange,
  onEditExistingTier,
  onViewExistingTier,
  onDeactivateExistingTier,
  onStartCreateNewTier,
  onCancelCreateTierForm,
  onBackToTierList,
}: DesignTemplateTierDialogProps) {
  const isView = mode === 'view';
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  /** Main tier fields: add form (create+visible) or edit/view with selected tier. */
  const showTierMainFields = (isCreate && showCreateTierForm) || (!isCreate && Boolean(tier));
  /** Chỉnh tier items: tạo tier mới hoặc đang sửa tier (không phải view). */
  const showTierItemsEditor = !isView && ((isCreate && showCreateTierForm) || (isEdit && Boolean(tier)));

  const [catalogPlants, setCatalogPlants] = useState<Plant[]>([]);
  const [catalogPlantsLoading, setCatalogPlantsLoading] = useState(false);
  const [catalogMaterials, setCatalogMaterials] = useState<Material[]>([]);
  const [catalogMaterialsLoading, setCatalogMaterialsLoading] = useState(false);

  const shouldLoadItemCatalogs = open && showTierItemsEditor;

  useEffect(() => {
    if (!shouldLoadItemCatalogs) {
      return;
    }

    let active = true;
    setCatalogPlantsLoading(true);
    void (async () => {
      try {
        const response = await searchAdminPlantsForCombo(
          stripEmptyStringFields({
            pagination: { pageNumber: 1, pageSize: PLANT_CATALOG_PAGE_SIZE },
            isActive: true,
            isUniqueInstance: false,
            sortBy: '',
            sortDirection: '',
          }),
          false
        );
        const payload = readPayload(response);
        if (active) {
          setCatalogPlants(payload?.items ?? []);
        }
      } catch {
        if (active) {
          setCatalogPlants([]);
        }
      } finally {
        if (active) {
          setCatalogPlantsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [shouldLoadItemCatalogs]);

  useEffect(() => {
    if (!shouldLoadItemCatalogs) {
      return;
    }

    let active = true;
    setCatalogMaterialsLoading(true);
    void (async () => {
      try {
        const response = await searchAdminMaterials(
          {
            pagination: { pageNumber: 1, pageSize: MATERIAL_CATALOG_PAGE_SIZE },
            isActive: true,
          },
          false
        );
        const payload = readPayload(response);
        if (active) {
          setCatalogMaterials(payload?.items ?? []);
        }
      } catch {
        if (active) {
          setCatalogMaterials([]);
        }
      } finally {
        if (active) {
          setCatalogMaterialsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [shouldLoadItemCatalogs]);

  const handleChangeField = <K extends keyof DesignTemplateTierFormValue>(field: K, value: DesignTemplateTierFormValue[K]) => {
    onFormChange((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, value: Partial<DesignTemplateTierItemFormRow>) => {
    onFormChange((prev) => ({
      ...prev,
      items: prev.items.map((row, itemIndex) => (itemIndex === index ? { ...row, ...value } : row)),
    }));
  };

  const addItem = () => {
    onFormChange((prev) => ({ ...prev, items: [...prev.items, createEmptyTierItem()] }));
  };

  const removeItem = (index: number) => {
    onFormChange((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleItemTypeChange = (index: number, nextType: number) => {
    if (nextType === ITEM_TYPE_PLANT) {
      updateItem(index, {
        itemType: ITEM_TYPE_PLANT,
        materialId: null,
        materialDisplayName: undefined,
      });
      return;
    }
    updateItem(index, {
      itemType: ITEM_TYPE_MATERIAL,
      plantId: null,
      plantDisplayName: undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        {isView
          ? `View tier · ${tier?.tierName ?? `#${tier?.id ?? ''}`}`
          : isCreate && !showCreateTierForm
            ? 'Manage tiers'
            : isCreate
              ? 'Add tier'
              : `Edit Tier #${tier?.id ?? ''}`}
      </DialogTitle>
      <DialogContent dividers>
        {detailLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CustomLoading />
          </Box>
        ) : detailError ? (
          <Alert severity="error">{detailError}</Alert>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Template: {template?.name ?? 'Unknown template'}
            </Typography>
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Existing Tiers</Typography>
                <Box className="flex-col">
                  <Box className="flex justify-end">
                  {isView && onBackToTierList ? (
                    <Button size="small" sx={{ mr: 1 }} variant="outlined" onClick={() => onBackToTierList()} disabled={submitting}>
                      Back to list
                    </Button>
                  ) : null}
                  {onStartCreateNewTier && !(isCreate && showCreateTierForm) ? (
                    <Button size="small" variant="contained" sx={{bgcolor: 'var(--primary)'}} startIcon={<Add />} onClick={() => onStartCreateNewTier()} disabled={submitting}>
                      Add tier
                    </Button>
                  ) : null}
                  </Box>
                  {!isView ? (
                    <Typography variant="caption" color="text.secondary">
                      {isCreate && !showCreateTierForm
                        ? 'Press Add tier to enter details, then save.'
                        : 'Use View / Edit / Deactivate to manage tiers.'}
                    </Typography>
                  ) : (
                    <Box>
                    <Typography variant="caption" color="text.secondary">
                      Viewing tier detail. Use View on another row to switch, or Back to list.
                    </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
              <Stack spacing={1.5}>
                {existingTiers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No tiers available for this template.
                  </Typography>
                ) : (
                  existingTiers.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        border: '1px solid var(--card-border)',
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        ...(isView && tier?.id === item.id
                          ? { borderColor: 'primary.main', borderWidth: 2, boxShadow: 1 }
                          : {}),
                      }}
                    >
                      <Box>
                        <Typography fontWeight={700}>{item.tierName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.minArea} - {item.maxArea} m2 | {formatCurrency(item.packagePrice)} | {item.estimatedDays} days
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="View detail">
                          <IconButton
                            size="medium"
                            color={isView && tier?.id === item.id ? 'primary' : 'default'}
                            onClick={() => onViewExistingTier(item)}
                            disabled={submitting}
                            aria-label="View tier"
                          >
                            <VisibilityOutlined />
                          </IconButton>
                        </Tooltip>
                        {!isView ? (
                          <>
                            <Tooltip title="Edit">
                              <IconButton size="medium" onClick={() => onEditExistingTier(item)} disabled={submitting} aria-label="Edit tier">
                                <EditNoteOutlined />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Deactivate">
                              <IconButton
                                size="medium"
                                color="error"
                                onClick={() => onDeactivateExistingTier(item)}
                                disabled={submitting || !item.isActive}
                                aria-label="Deactivate tier"
                              >
                                <DeleteOutline />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : null}
                      </Stack>
                    </Box>
                  ))
                )}
              </Stack>
            </Box>

            {showTierMainFields ? (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Tier Name"
                    value={formValue.tierName}
                    onChange={(event) => handleChangeField('tierName', event.target.value)}
                    disabled={isView || submitting}
                    fullWidth
                    required
                    sx={textFieldDisabledBlackInputSx}
                  />
                  <TextField
                    required
                    label="Estimated Days"
                    type="number"
                    value={formValue.estimatedDays}
                    onChange={(event) => handleChangeField('estimatedDays', Number(event.target.value))}
                    disabled={isView || submitting}
                    fullWidth
                    inputProps={{ min: 1 }}
                    sx={textFieldDisabledBlackInputSx}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    required
                    label="Min Area"
                    type="number"
                    value={formValue.minArea}
                    onChange={(event) => handleChangeField('minArea', Number(event.target.value))}
                    disabled={isView || submitting}
                    fullWidth
                    inputProps={{ min: 0 }}
                    sx={textFieldDisabledBlackInputSx}
                  />
                  <TextField
                    required
                    label="Max Area"
                    type="number"
                    value={formValue.maxArea}
                    onChange={(event) => handleChangeField('maxArea', Number(event.target.value))}
                    disabled={isView || submitting}
                    fullWidth
                    inputProps={{ min: 0 }}
                    sx={textFieldDisabledBlackInputSx}
                  />
                  <TextField
                    required
                    label="Package Price"
                    type="text"
                    value={formatCurrencyInput(formValue.packagePrice, 'vi')}
                    onChange={(event) => handleChangeField('packagePrice', parseCurrencyInput(event.target.value))}
                    disabled={isView || submitting}
                    fullWidth
                    inputProps={{ inputMode: 'numeric' }}
                    sx={textFieldDisabledBlackInputSx}
                  />
                </Stack>

                <TextField
                  label="Scope of Work"
                  value={formValue.scopedOfWork}
                  onChange={(event) => handleChangeField('scopedOfWork', event.target.value)}
                  disabled={isView || submitting}
                  fullWidth
                  multiline
                  minRows={3}
                  required
                  sx={textFieldDisabledBlackInputSx}
                />

                <Stack direction="column" alignItems="left" justifyContent="left">
                  <Typography variant="body2" fontWeight={600}>
                    Status
                  </Typography>
                  <FormControlLabel
                    sx={formControlLabelDisabledBlackTextSx}
                    control={
                      <Switch
                        checked={formValue.isActive}
                        onChange={(event) => handleChangeField('isActive', event.target.checked)}
                        disabled={isView || submitting}
                        color="success"
                      />
                    }
                    label={formValue.isActive ? 'Active' : 'Inactive'}
                  />
                </Stack>
              </>
            ) : null}

            {showTierItemsEditor ? (
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Tier Items</Typography>
                  <Button size="small" startIcon={<Add />} onClick={addItem} disabled={submitting || isView}>
                    Add item
                  </Button>
                </Stack>
                <Stack spacing={2}>
                  {formValue.items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Add at least one plant/material item for this tier.
                    </Typography>
                  ) : (
                    formValue.items.map((item, index) => (
                      <Box
                        key={`${index}-${item.itemType}-${item.plantId ?? ''}-${item.materialId ?? ''}`}
                        sx={{ border: '1px solid var(--card-border)', borderRadius: 2, p: 2 }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">Item {index + 1}</Typography>
                          <IconButton size="small" color="error" onClick={() => removeItem(index)} disabled={submitting || isView}>
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Stack spacing={2}>
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                            <FormControl sx={{ ...formControlDisabledSelectBlackTextSx, minWidth: 200, maxWidth: { xs: '100%', md: 220 } }} fullWidth={false}>
                              <InputLabel id={`tier-item-type-${index}`}>Item Type</InputLabel>
                              <Select
                                labelId={`tier-item-type-${index}`}
                                label="Item Type"
                                value={item.itemType}
                                disabled={isView || submitting}
                                onChange={(event) => handleItemTypeChange(index, Number(event.target.value))}
                              >
                                {DESIGN_TEMPLATE_TIER_ITEM_TYPE_OPTIONS.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <TierCreateItemPlantMaterialFields
                              item={item}
                              disabled={isView || submitting}
                              catalogPlants={catalogPlants}
                              catalogPlantsLoading={catalogPlantsLoading}
                              catalogMaterials={catalogMaterials}
                              catalogMaterialsLoading={catalogMaterialsLoading}
                              onPatch={(patch) => updateItem(index, patch)}
                            />

                            <TextField
                              label="Quantity"
                              type="number"
                              value={item.quantity}
                              onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
                              disabled={isView || submitting}
                              inputProps={{ min: 1 }}
                              sx={{ ...textFieldDisabledBlackInputSx, width: { xs: '100%', md: 140 }, flexShrink: 0 }}
                            />
                          </Stack>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </Box>
            ) : null}

            {isView && tier && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Existing Items
                </Typography>
                <Stack spacing={1}>
                  {tier.items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No items found for this tier.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'var(--primary)' }}>
                            <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Item Type</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">
                              Quantity
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tier.items.map((item) => (
                            <TableRow
                              key={item.id ?? `${item.designTemplateTierId}-${item.itemType}-${item.plantId ?? ''}-${item.materialId ?? ''}`}
                            >
                              <TableCell>{item.id ?? '—'}</TableCell>
                              <TableCell>{formatTierItemTypeLabel(item)}</TableCell>
                              <TableCell>{item.name ?? '—'}</TableCell>
                              <TableCell align="center">{formatTierItemQuantity(item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {isCreate && showCreateTierForm && onCancelCreateTierForm ? (
          <Button onClick={() => onCancelCreateTierForm()} disabled={submitting} color="inherit">
            Cancel
          </Button>
        ) : null}
        {isView && onBackToTierList ? (
          <Button onClick={() => onBackToTierList()} disabled={submitting} color="inherit">
            Back to list
          </Button>
        ) : null}
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
        {!isView && ((isCreate && showCreateTierForm) || (isEdit && tier)) ? (
          <Button onClick={() => void onSubmit()} variant="contained" disabled={submitting || detailLoading}>
            {submitting ? 'Processing...' : isCreate ? 'Create' : 'Save'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
