'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Alert,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LogisticsIcon from '@mui/icons-material/LocalShipping';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  searchShopUnified,
  type ShopUnifiedSearchItem,
  type UnifiedItemType,
} from '@/lib/api/shopUnifiedService';
import {
  getShopPlantCommonNurseries,
  searchShopNurseries,
  type ShopNurseryListItem,
  getPlantNurseries,
} from '@/lib/api/shopPlantsService';
import { formatCurrency } from '@/lib/utils/formatUtil';
import { getMaterialNurseries } from '@/lib/api/shopMaterialsService';
import { CustomLoading } from '@/components/CustomLoading';
import ManagementHeader from '@/components/layout/ManagementHeader';

type CrossInventoryRow = {
  id: string;
  productName: string;
  sku: string;
  basePrice: number;
  fengShuiElementName?: string;
  careLevelTypeName?: string;
  category: UnifiedItemType;
  numericId: number;
  isUniqueInstance?: boolean;
  totalStock: number;
  inventoryByNursery?: Array<{ nurseryId: number; nurseryName: string; quantity: number }>;
};

type NurseryStockRow = {
  nurseryId: number;
  nurseryName: string;
  commonQuantity: number;
  availableInstances: number;
  totalAvailableStock: number;
};

type StockCacheEntry = {
  loading: boolean;
  error: string | null;
  rows: NurseryStockRow[];
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms: ${label}`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
};

const resolveUnifiedPrice = (candidate: unknown): number => {
  const numeric = typeof candidate === 'string' ? Number(candidate) : Number(candidate ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function ProductsInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedNursery, setSelectedNursery] = useState<number | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<CrossInventoryRow | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [nurseries, setNurseries] = useState<ShopNurseryListItem[]>([]);
  const [stockByNurseryCache, setStockByNurseryCache] = useState<Record<string, StockCacheEntry>>({});
  const stockByNurseryRequestIdRef = useRef(0);
  const stockByNurseryCacheRef = useRef<Record<string, StockCacheEntry>>({});
  stockByNurseryCacheRef.current = stockByNurseryCache;

  const [rows, setRows] = useState<CrossInventoryRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const includePlants = selectedTab === 0 || selectedTab === 1;
  const includeMaterials = selectedTab === 0 || selectedTab === 2;
  const includeCombos = selectedTab === 0 || selectedTab === 3;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    let mounted = true;

    const loadNurseries = async () => {
      try {
        const response = await searchShopNurseries(
          {
            pagination: { pageNumber: 1, pageSize: 100 },
            isActive: true,
          },
          false,
          true,
          false
        );

        if (!mounted) return;

        const payload = response.payload ?? response.data;
        const items = payload?.items ?? [];
        setNurseries(items.filter((n) => n.isActive));
      } catch {
        if (mounted) {
          setNurseries([]);
        }
      }
    };

    void loadNurseries();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const response = await searchShopUnified(
          {
            pagination: { pageNumber: page + 1, pageSize },
            keyword: debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : undefined,
            nurseryId: selectedNursery === 'all' ? undefined : selectedNursery,
            includePlants,
            includeMaterials,
            includeCombos,
            sortBy: 'CreatedAt',
            sortDirection: 'Desc',
          },
          false,
          true
        );

        if (!mounted) return;

        const payload = response.payload ?? response.data;
        const items = payload?.items?.items ?? [];

        const mapped: CrossInventoryRow[] = items
          .map((item: ShopUnifiedSearchItem): CrossInventoryRow | null => {
            if (item.type === 'Plant' && item.plant) {
              return {
                id: `plant-${item.plant.id}`,
                numericId: item.plant.id,
                productName: item.plant.name,
                sku: `PLANT-${item.plant.id}`,
                basePrice: resolveUnifiedPrice(item.plant.basePrice ?? item.plant.price),
                fengShuiElementName: item.plant.fengShuiElementName ?? '-',
                careLevelTypeName: item.plant.careLevelTypeName ?? '-',
                category: 'Plant',
                isUniqueInstance: Boolean(item.plant.isUniqueInstance),
                totalStock: Math.max(0, Math.floor(item.plant.totalAvailableStock ?? 0)),
              };
            }

            if (item.type === 'Material' && item.material) {
              return {
                id: `material-${item.material.id}`,
                numericId: item.material.materialId ?? item.material.id,
                productName: item.material.materialName,
                sku: item.material.materialCode || `MAT-${item.material.id}`,
                basePrice: resolveUnifiedPrice(item.material.basePrice ?? item.material.price),
                fengShuiElementName: 'Material',
                careLevelTypeName: '-',
                category: 'Material',
                totalStock: Math.max(0, Math.floor(item.material.availableQuantity ?? item.material.quantity ?? 0)),
              };
            }

            if (item.type === 'Combo' && item.combo) {
              const nurseries = item.combo.nurseries ?? [];
              const totalStock = nurseries.reduce((sum, n) => sum + Math.max(0, Math.floor(n.quantity ?? 0)), 0);

              return {
                id: `combo-${item.combo.id}`,
                numericId: item.combo.id,
                productName: item.combo.name,
                sku: `COMBO-${item.combo.id}`,
                basePrice: resolveUnifiedPrice(item.combo.price),
                fengShuiElementName: '-',
                careLevelTypeName: '-',
                category: 'Combo',
                totalStock,
                inventoryByNursery: nurseries.map((n) => ({
                  nurseryId: n.nurseryId,
                  nurseryName: n.nurseryName,
                  quantity: Math.max(0, Math.floor(n.quantity ?? 0)),
                })),
              };
            }

            return null;
          })
          .filter((r): r is CrossInventoryRow => Boolean(r));

        setRows(mapped);
        setTotalCount(Number(payload?.items?.totalCount ?? mapped.length ?? 0));
      } catch {
        if (mounted) {
          setError('Failed to load cross-nursery inventory.');
          setRows([]);
          setTotalCount(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [debouncedSearchTerm, includeCombos, includeMaterials, includePlants, page, pageSize, selectedNursery]);

  const filteredInventory = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    const base = rows.filter(
      (item) =>
        !term || item.productName.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term)
    );

    if (selectedTab === 1) return base.filter((item) => item.category === 'Plant');
    if (selectedTab === 2) return base.filter((item) => item.category === 'Material');
    if (selectedTab === 3) return base.filter((item) => item.category === 'Combo');
    return base;
  }, [rows, debouncedSearchTerm, selectedTab]);

  useEffect(() => {
    if (!openDetail || !selectedItem) return;

    const cacheKey = `${selectedItem.category}:${selectedItem.numericId}`;
    const requestId = ++stockByNurseryRequestIdRef.current;
    const existing = stockByNurseryCacheRef.current[cacheKey];

    console.log('[StockByNursery] effect start', {
      requestId,
      openDetail,
      cacheKey,
      category: selectedItem.category,
      numericId: selectedItem.numericId,
      isUniqueInstance: selectedItem.isUniqueInstance,
      existing,
    });

    if (existing && (existing.loading || existing.rows.length > 0 || existing.error)) {
      console.log('[StockByNursery] skip fetch (cached or loading)', { requestId, cacheKey, existing });
      return;
    }

    console.log('[StockByNursery] set loading true', { requestId, cacheKey });
    setStockByNurseryCache((prev) => ({ ...prev, [cacheKey]: { loading: true, error: null, rows: [] } }));

    const loadStockByNursery = async () => {
      try {
        console.log('[StockByNursery] load start', { requestId, cacheKey, category: selectedItem.category });
        if (selectedItem.category === 'Combo') {
          const rows: NurseryStockRow[] = (selectedItem.inventoryByNursery ?? []).map((inv) => {
            const commonQuantity = Math.max(0, Math.floor(inv.quantity ?? 0));
            return {
              nurseryId: inv.nurseryId,
              nurseryName: inv.nurseryName,
              commonQuantity,
              availableInstances: 0,
              totalAvailableStock: commonQuantity,
            };
          });

          if (stockByNurseryRequestIdRef.current !== requestId) return;
          console.log('[StockByNursery] set cache (combo)', { requestId, cacheKey, rowsCount: rows.length });
          setStockByNurseryCache((prev) => ({
            ...prev,
            [cacheKey]: { loading: false, error: null, rows },
          }));
          return;
        }

        if (selectedItem.category === 'Material') {
          const response = await withTimeout(
            getMaterialNurseries(selectedItem.numericId, false, true),
            15000,
            `getMaterialNurseries(materialId=${selectedItem.numericId})`
          );
          const payload = response.payload ?? response.data ?? [];
          console.log('[StockByNursery] material nurseries payload', { requestId, cacheKey, length: payload.length });
          const rows: NurseryStockRow[] = payload.map((nursery) => {
            const commonQuantity = Math.max(0, Math.floor(Number(nursery.quantity ?? 0)));
            return {
              nurseryId: nursery.id,
              nurseryName: nursery.name,
              commonQuantity,
              availableInstances: 0,
              totalAvailableStock: commonQuantity,
            };
          });

          if (stockByNurseryRequestIdRef.current !== requestId) return;
          console.log('[StockByNursery] set cache (material)', { requestId, cacheKey, rowsCount: rows.length });
          setStockByNurseryCache((prev) => ({
            ...prev,
            [cacheKey]: { loading: false, error: null, rows },
          }));
          return;
        }

        const isUnique = Boolean(selectedItem.isUniqueInstance);
        console.log('[StockByNursery] plant branch', { requestId, cacheKey, isUnique });

        if (!isUnique) {
          const commonResponse = await withTimeout(
            getShopPlantCommonNurseries(selectedItem.numericId, false, true),
            15000,
            `getShopPlantCommonNurseries(plantId=${selectedItem.numericId})`
          );
          const commonPayload = commonResponse.payload ?? commonResponse.data ?? [];
          console.log('[StockByNursery] common plant nurseries payload', { requestId, cacheKey, length: commonPayload.length });

          const rows: NurseryStockRow[] = commonPayload.map((nursery) => {
            const commonQuantity = Math.max(0, Math.floor(Number(nursery.availableCommonQuantity ?? 0)));
            const availableInstances = Math.max(0, Math.floor(Number(nursery.availableInstanceCount ?? 0)));
            return {
              nurseryId: nursery.nurseryId,
              nurseryName: nursery.nurseryName,
              commonQuantity,
              availableInstances,
              totalAvailableStock: commonQuantity + availableInstances,
            };
          });

          if (stockByNurseryRequestIdRef.current !== requestId) return;
          console.log('[StockByNursery] set cache (plant common)', { requestId, cacheKey, rowsCount: rows.length });
          setStockByNurseryCache((prev) => ({
            ...prev,
            [cacheKey]: { loading: false, error: null, rows },
          }));
          return;
        }

        const nurseryResponse = await withTimeout(
          getPlantNurseries(selectedItem.numericId, false, true),
          15000,
          `getPlantNurseries(plantId=${selectedItem.numericId})`
        );
        const payload = nurseryResponse.payload ?? nurseryResponse.data ?? [];
        console.log('[StockByNursery] unique plant nurseries payload', { requestId, cacheKey, length: payload.length });

        const rows: NurseryStockRow[] = payload.map((nursery) => {
          const availableInstances = Math.max(0, Math.floor(Number(nursery.availableInstanceCount ?? 0)));
          return {
            nurseryId: nursery.nurseryId,
            nurseryName: nursery.nurseryName,
            commonQuantity: 0,
            availableInstances,
            totalAvailableStock: availableInstances,
          };
        });

        if (stockByNurseryRequestIdRef.current !== requestId) return;
        console.log('[StockByNursery] set cache (plant unique)', { requestId, cacheKey, rowsCount: rows.length });
        setStockByNurseryCache((prev) => ({
          ...prev,
          [cacheKey]: { loading: false, error: null, rows },
        }));
      } catch (e) {
        console.error('[StockByNursery] load error', { requestId, cacheKey, error: e });
        if (stockByNurseryRequestIdRef.current !== requestId) return;
        setStockByNurseryCache((prev) => ({
          ...prev,
          [cacheKey]: {
            loading: false,
            error: e instanceof Error ? e.message : 'Failed to load stock by nursery.',
            rows: [],
          },
        }));
      }
    };

    void loadStockByNursery();
  }, [openDetail, selectedItem]);

  const handleViewDetail = (item: CrossInventoryRow) => {
    setSelectedItem(item);
    setOpenDetail(true);
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <ManagementHeader
        title="Cross-Nursery Inventory"
        description="Search inventory across all nurseries to coordinate stock and reorder"
        entityLabel="cross-nursery inventory"
        count={totalCount}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            fullWidth
            placeholder="Search by product name ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Nursery Filter</InputLabel>
            <Select
              value={selectedNursery}
              onChange={(e) => {
                const next = e.target.value;
                if (next === 'all') {
                  setSelectedNursery('all');
                } else {
                  setSelectedNursery(Number(next));
                }
                setPage(0);
              }}
              label="Nursery Filter"
            >
              <MenuItem value="all">All Nurseries</MenuItem>
              {nurseries.map((nursery) => (
                <MenuItem key={nursery.id} value={nursery.id}>
                  {nursery.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Category Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => {
            setSelectedTab(newValue);
            setPage(0);
          }}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
            '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
          }}
        >
          <Tab label="All Products" />
          <Tab label="Plants" />
          <Tab label="Materials" />
          <Tab label="Combos" />
        </Tabs>
      </Card>

      {/* Inventory Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 2, mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              {/* <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell> */}
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Base Price</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Feng Shui Element</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Care level</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Total Stock
              </TableCell>
              {/* <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Stock Status
              </TableCell> */}
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{item.productName}</TableCell>
                  {/* <TableCell>{item.sku}</TableCell> */}
                  <TableCell align="center">{formatCurrency(item.basePrice ?? 0, 'vi-VN')}</TableCell>
                  <TableCell align='center'> 
                    <Chip label={item.fengShuiElementName} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">{item.careLevelTypeName ?? '-'}</TableCell>
                  <TableCell align="center">
                    <Chip label={item.totalStock} size="small" />
                  </TableCell>
                  {/* <TableCell align="center">
                    <Chip
                      label={item.totalStock === 0 ? 'Out of Stock' : item.totalStock < 10 ? 'Low Stock' : 'Available'}
                      color={getStockStatusChip(item.totalStock)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell> */}
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetail(item)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={Math.max(0, totalCount)}
        page={page}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => {
          const next = Number(event.target.value);
          setPageSize(Number.isFinite(next) && next > 0 ? next : 10);
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LogisticsIcon />
          Cross-Nursery Inventory - {selectedItem?.productName}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedItem && (
            <Box>
              {/* Product Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Product Name
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedItem.productName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Type: <Chip label={selectedItem.category} size="small" />
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Stock
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedItem.totalStock} units
                  </Typography>
                </Grid>
              </Grid>

              {/* Inventory by Nursery Table */}
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Stock by Nursery
              </Typography>
              {(() => {
                const cacheKey = selectedItem ? `${selectedItem.category}:${selectedItem.numericId}` : '';
                const entry = cacheKey ? stockByNurseryCache[cacheKey] : undefined;

                if (!entry || entry.loading) {
                  return (
                    <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CustomLoading size={18} />
                      <Typography variant="body2" color="text.secondary">
                        Loading stock by nursery...
                      </Typography>
                    </Box>
                  );
                }

                if (entry.error) {
                  return (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {entry.error}
                    </Alert>
                  );
                }

                if (!entry.rows || entry.rows.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      No nursery stock data available.
                    </Typography>
                  );
                }

                return (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Nursery</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }} align="center">
                            Total available stock
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {entry.rows.map((row) => (
                          <TableRow key={row.nurseryId}>
                            <TableCell>{row.nurseryName}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                              {row.totalAvailableStock}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
