'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import {
  Box,
  Chip,
  CircularProgress,
  ClickAwayListener,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  searchShopUnified,
  type ShopUnifiedSearchItem,
  type ShopUnifiedSearchRequest,
} from '@/lib/api/shopUnifiedService';
import { formatCurrency } from '@/lib/utils/formatUtil';
import Image from 'next/image';

const SEARCH_DEBOUNCE_MS = 300;
const MAX_VISIBLE_ITEMS = 5;
const SUGGESTION_PAGE_SIZE = 20;

const getPayload = <T,>(response: { payload?: T; data?: T } | null | undefined): T | null => {
  if (!response) return null;
  return response.payload ?? response.data ?? null;
};

const buildPlantStoreHref = (keyword: string) => {
  const params = new URLSearchParams();
  if (keyword.trim()) {
    params.set('q', keyword.trim());
  }
  params.set('includePlants', 'true');
  params.set('includeMaterials', 'true');
  params.set('includeCombos', 'true');
  return `/plant-store?${params.toString()}`;
};

const getSuggestionLabel = (item: ShopUnifiedSearchItem) => {
  if (item.type === 'Plant') {
    return item.plant?.name ?? '';
  }

  if (item.type === 'Material') {
    return item.material?.materialName ?? '';
  }

  return item.combo?.name ?? '';
};

const getSuggestionHref = (item: ShopUnifiedSearchItem) => {
  if (item.type === 'Plant' && item.plant?.id) {
    return `/products/${item.plant.id}`;
  }

  if (item.type === 'Material') {
    const materialId = item.material?.materialId ?? item.material?.id;
    if (materialId) {
      return `/materials/${materialId}`;
    }
  }

  if (item.type === 'Combo' && item.combo?.id) {
    return `/combo/${item.combo.id}`;
  }

  return buildPlantStoreHref(getSuggestionLabel(item));
};

const getSuggestionPrice = (item: ShopUnifiedSearchItem): number | null => {
  if (item.type === 'Plant') {
    return Number.isFinite(item.plant?.basePrice) ? (item.plant?.basePrice ?? null) : null;
  }

  if (item.type === 'Combo') {
    return Number.isFinite(item.combo?.price) ? (item.combo?.price ?? null) : null;
  }

  if (item.type === 'Material' && Number.isFinite(item.material?.basePrice)) {
    return item.material?.basePrice ?? null;
  }

  return null;
};

interface HeaderUnifiedSearchProps {
  width?: string | number;
  onNavigate?: () => void;
}

export default function HeaderUnifiedSearch({ width, onNavigate }: HeaderUnifiedSearchProps) {
  const locale = useLocale();
  const router = useRouter();
  const tCommon = useTranslations('common');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ShopUnifiedSearchItem[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fallbackImage = '/img/fallbackplant.avif';
  const hasKeyword = keyword.trim().length > 0;

  useEffect(() => {
    if (!hasKeyword) {
      setItems([]);
      setOpen(false);
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        const body: ShopUnifiedSearchRequest = {
          pagination: {
            pageNumber: 1,
            pageSize: SUGGESTION_PAGE_SIZE,
          },
          keyword: keyword.trim(),
          sortBy: 'CreatedAt',
          sortDirection: 'Desc',
          includePlants: true,
          includeMaterials: true,
          includeCombos: true,
        };

        const response = await searchShopUnified(body, false, false);
        if (!active) return;

        const payload = getPayload(response);
        const nextItems = payload?.items?.items ?? [];
        setItems(nextItems);
        setOpen(true);
      } catch (error) {
        if (!active) return;
        console.error('Unified header search error:', error);
        setItems([]);
        setOpen(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [hasKeyword, keyword]);

  const noResults = useMemo(() => hasKeyword && !loading && items.length === 0, [hasKeyword, loading, items.length]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const href = buildPlantStoreHref(keyword);
    setOpen(false);
    router.push(href, { locale });
    onNavigate?.();
  };

  const handleClickSuggestion = (item: ShopUnifiedSearchItem) => {
    setOpen(false);
    router.push(getSuggestionHref(item), { locale });
    onNavigate?.();
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box ref={rootRef} className="relative" sx={{ width: width ?? { md: '28ch', lg: '38ch' } }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            id="header-unified-search"
            variant="standard"
            fullWidth
            value={keyword}
            onFocus={() => {
              if (hasKeyword) {
                setOpen(true);
              }
            }}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={tCommon('searchPlaceholder')}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'var(--foreground)' }} />
                  </InputAdornment>
                ),
                endAdornment: loading ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} sx={{ color: 'var(--primary)' }} />
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Box>

        {open && (hasKeyword || loading) && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 1300,
              borderRadius: '12px',
              border: '1px solid var(--card-border)',
              bgcolor: 'var(--background)',
              maxHeight: `calc(${MAX_VISIBLE_ITEMS} * 64px)`,
              overflowY: 'auto',
            }}
          >
            <List disablePadding>
              {items.map((item, index) => {
                const label = getSuggestionLabel(item);
                const price = getSuggestionPrice(item);

                return (
                  <ListItemButton
                    key={`${item.type}-${label}-${index}`}
                    onClick={() => handleClickSuggestion(item)}
                    sx={{
                      px: 0.5,
                      py: 0.75,
                      alignItems: 'stretch',
                      gap: 0.25,
                      borderBottom:
                        index === items.length - 1 ? 'none' : '1px solid var(--card-border)',
                      '&:hover': {
                        bgcolor: 'color-mix(in srgb, var(--primary) 50%, white)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '30%',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',

                      }}
                    >
                      <Image
                        src={item.imageUrl ?? fallbackImage}
                        alt={label}
                        width={40}
                        height={40}
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                      />
                      <Chip
                        size="small"
                        label={item.type}
                        sx={{
                          height: 20,
                          maxWidth: '100%',
                          fontSize: '0.7rem',
                          bgcolor: 'color-mix(in srgb, var(--primary) 18%, white)',
                          color: 'var(--foreground)',
                        }}
                      />
                    </Box>
                    <Box sx={{ width: '70%', minWidth: 0, display: 'flex', alignItems: 'center' }}>
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
                              textOverflow: 'ellipsis',
                              whiteSpace: 'normal',
                            }}
                          >
                            {label}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 700 }}
                          >
                            {price !== null ? formatCurrency(price, locale) : ''}
                          </Typography>
                        }
                      />
                    </Box>
                  </ListItemButton>
                );
              })}

              {loading && (
                <Box className="px-3 py-2">
                  <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                    {tCommon('loading')}
                  </Typography>
                </Box>
              )}

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
  );
}
