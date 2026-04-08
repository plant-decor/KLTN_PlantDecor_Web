'use client';

import { Link, useRouter } from '@/i18n/navigation';
import ProductCard from '@/components/product/ProductCard';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ShopPlantSearchPayload } from '@/lib/api/shopPlantsService';
import {
  PAGE_SIZE_OPTIONS,
  type PlantStorePageQuery,
  type PlantStoreTab,
} from '@/lib/utils/plant-store/constants';
import { buildPaginationHref, buildSharedPageSizeHref } from '@/lib/utils/plant-store/url';

interface PlantStorePlantsResultsProps {
  locale: string;
  query: PlantStorePageQuery;
  payload: ShopPlantSearchPayload;
  pageSize: number;
  activeTab: PlantStoreTab;
  foundText: string;
  pageOfText: string;
  previousLabel: string;
  nextLabel: string;
  clearFiltersLabel: string;
  noPlantsLabel: string;
  itemsPerPageLabel: string;
}

export default function PlantStorePlantsResults({
  locale,
  query,
  payload,
  pageSize,
  activeTab,
  foundText,
  pageOfText,
  previousLabel,
  nextLabel,
  clearFiltersLabel,
  noPlantsLabel,
  itemsPerPageLabel,
}: PlantStorePlantsResultsProps) {
  const router = useRouter();
  const currentPage = payload.pageNumber || 1;
  const totalPages = Math.max(1, payload.totalPages || 1);

  const handlePageSizeChange = (event: SelectChangeEvent<string>) => {
    const nextPageSize = Number(event.target.value);
    if (!Number.isFinite(nextPageSize) || nextPageSize <= 0) return;

    const href = buildSharedPageSizeHref(query, nextPageSize, activeTab);
    router.replace(href, { locale, scroll: false });
  };

  return (
    <div className="md:col-span-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <p>{foundText}</p>
        <p>{pageOfText}</p>
      </div>

      {payload.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {payload.items.map((plant) => (
            <ProductCard key={plant.id} plant={plant} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-12">
          <p className="mb-4 text-lg text-gray-600">{noPlantsLabel}</p>
          <Link
            href={`/plant-store?tab=plants&pageSize=${pageSize}`}
            locale={locale}
            className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-green-700"
          >
            {clearFiltersLabel}
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-gray-700">{itemsPerPageLabel}</span>
          <FormControl size="small" sx={{ minWidth: 88 }}>
            <InputLabel id="plants-page-size-label">{itemsPerPageLabel}</InputLabel>
            <Select
              labelId="plants-page-size-label"
              id="plants-page-size"
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
