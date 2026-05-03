'use client';

import { Link, useRouter } from '@/i18n/navigation';
import ProductCard from '@/components/product/ProductCard';
import MaterialCard from '@/components/product/MaterialCard';
import ComboCard from '@/components/product/ComboCard';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from '@mui/material';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type {
  ShopUnifiedSearchItem,
  ShopUnifiedPagedItems,
} from '@/lib/api/shopUnifiedService';
import { PAGE_SIZE_OPTIONS, type PlantStorePageQuery } from '@/lib/utils/plant-store/constants';
import { buildPaginationHref } from '@/lib/utils/plant-store/url';
import { cloneQuery } from '@/lib/utils/plant-store/query';
import { toMaterialCardMaterial, toProductCardPlant } from '@/lib/utils/shop-unified-card-mappers';

export interface PlantStoreSortByOption {
  value: string;
  label: string;
}

interface PlantStoreUnifiedResultsProps {
  locale: string;
  query: PlantStorePageQuery;
  payload: ShopUnifiedPagedItems;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
  sortByOptions: PlantStoreSortByOption[];
  foundText: string;
  pageOfText: string;
  previousLabel: string;
  nextLabel: string;
  noProductsLabel: string;
  itemsPerPageLabel: string;
  sortLabel: string;
  sortDirectionAriaAscending: string;
  sortDirectionAriaDescending: string;
  initialWishlistState?: Record<string, boolean>;
}

const buildWishlistKey = (itemType: 'Plant' | 'Material' | 'PlantCombo', itemId: number): string =>
  `${itemType}:${itemId}`;

const applySortQueryParams = (params: URLSearchParams, nextSortBy: string, nextSortDirection: string) => {
  const normalizedBy = nextSortBy.trim();
  const normalizedDir =
    nextSortDirection.trim().toLowerCase() === 'asc' ? 'Asc' : 'Desc';
  params.set('sort', `${normalizedBy}:${normalizedDir}`);
  params.set('sortBy', normalizedBy);
  params.set('sortDirection', normalizedDir);
};

export default function PlantStoreUnifiedResults({
  locale,
  query,
  payload,
  pageSize,
  sortBy,
  sortDirection,
  sortByOptions,
  foundText,
  pageOfText,
  previousLabel,
  nextLabel,
  noProductsLabel,
  itemsPerPageLabel,
  sortLabel,
  sortDirectionAriaAscending,
  sortDirectionAriaDescending,
  initialWishlistState = {},
}: PlantStoreUnifiedResultsProps) {
  const router = useRouter();
  const currentPage = payload.pageNumber || 1;
  const totalPages = Math.max(1, payload.totalPages || 1);

  const handlePageSizeChange = (event: SelectChangeEvent<string>) => {
    const nextPageSize = Number(event.target.value);
    if (!Number.isFinite(nextPageSize) || nextPageSize <= 0) return;

    const params = cloneQuery(query);
    params.set('pageSize', String(nextPageSize));
    params.set('page', '1');
    router.replace(`/plant-store?${params.toString()}`, { locale, scroll: false });
  };

  const normalizedDirection = sortDirection.trim().toLowerCase() === 'asc' ? 'Asc' : 'Desc';
  const isAscending = normalizedDirection === 'Asc';

  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    const nextSortBy = event.target.value.trim();
    if (!nextSortBy) return;

    const params = cloneQuery(query);
    applySortQueryParams(params, nextSortBy, normalizedDirection);
    params.set('page', '1');
    router.replace(`/plant-store?${params.toString()}`, { locale, scroll: false });
  };

  const handleSortDirectionToggle = () => {
    const nextDir = isAscending ? 'Desc' : 'Asc';
    const params = cloneQuery(query);
    applySortQueryParams(params, sortBy.trim() || 'CreatedAt', nextDir);
    params.set('page', '1');
    router.replace(`/plant-store?${params.toString()}`, { locale, scroll: false });
  };

  const sortBySelectValue = sortByOptions.some((o) => o.value === sortBy)
    ? sortBy
    : sortByOptions[0]?.value ?? '';

  return (
    <div className="md:col-span-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <p>{foundText}</p>
        <div className="flex items-center gap-3">
          <p>{pageOfText}</p>
          {sortByOptions.length > 0 ? (
            <div className="flex items-center gap-1">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="unified-sort-by-label">{sortLabel}</InputLabel>
                <Select
                  labelId="unified-sort-by-label"
                  id="unified-sort-by"
                  value={sortBySelectValue}
                  label={sortLabel}
                  onChange={handleSortByChange}
                >
                  {sortByOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                type="button"
                size="small"
                color="primary"
                onClick={handleSortDirectionToggle}
                aria-label={isAscending ? sortDirectionAriaAscending : sortDirectionAriaDescending}
              >
                {isAscending ? <ArrowUpward /> : <ArrowDownward />}
              </IconButton>
            </div>
          ) : null}
        </div>
      </div>

      {payload.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {payload.items.map((item: ShopUnifiedSearchItem, index) => {
            if (item.type === 'Plant' && item.plant) {
              return (
                <ProductCard
                  key={`plant-${item.plant.id}-${index}`}
                  plant={toProductCardPlant(item.plant)}
                  initialWishlisted={Boolean(initialWishlistState[buildWishlistKey('Plant', item.plant.id)])}
                />
              );
            }

            if (item.type === 'Material' && item.material) {
              const materialId = item.material.materialId ?? item.material.id;
              return (
                <MaterialCard
                  key={`material-${item.material.id}-${index}`}
                  material={toMaterialCardMaterial(item.material)}
                  initialWishlisted={Boolean(initialWishlistState[buildWishlistKey('Material', materialId)])}
                />
              );
            }

            if (item.type === 'Combo' && item.combo) {
              return (
                <ComboCard
                  key={`combo-${item.combo.id}-${index}`}
                  combo={item.combo}
                  initialWishlisted={Boolean(initialWishlistState[buildWishlistKey('PlantCombo', item.combo.id)])}
                />
              );
            }

            return null;
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-12">
          <p className="mb-4 text-lg text-gray-600">{noProductsLabel}</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-gray-700">{itemsPerPageLabel}</span>
          <FormControl size="small" sx={{ minWidth: 88 }}>
            <InputLabel id="unified-page-size-label">{itemsPerPageLabel}</InputLabel>
            <Select
              labelId="unified-page-size-label"
              id="unified-page-size"
              value={String(pageSize)}
              label={itemsPerPageLabel}
              onChange={handlePageSizeChange}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <MenuItem key={option} value={String(option)}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <Pagination
          count={totalPages}
          page={Math.min(currentPage, totalPages)}
          shape="rounded"
          color="primary"
          showFirstButton
          showLastButton
          renderItem={(item) => {
            if (
              item.type === 'start-ellipsis' ||
              item.type === 'end-ellipsis' ||
              item.page == null
            ) {
              return <PaginationItem {...item} />;
            }

            return (
              <PaginationItem
                {...item}
                component={Link}
                locale={locale}
                href={buildPaginationHref(query, 'page', item.page)}
                aria-label={
                  item.type === 'previous'
                    ? previousLabel
                    : item.type === 'next'
                      ? nextLabel
                      : undefined
                }
              />
            );
          }}
        />
      </div>
    </div>
  );
}
