'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Tabs,
  Tab,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  TablePagination,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import StorageIcon from '@mui/icons-material/Storage';
import {
  searchShopUnified,
  type ShopUnifiedComboItem,
  type ShopUnifiedMaterialItem,
  type ShopUnifiedPlantItem,
  type ShopUnifiedSearchItem,
  type UnifiedItemType,
} from '@/lib/api/shopUnifiedService';

type InventoryNurseryRow = { nursery: string; stock: number; status: string };

type ProductsInventoryRow = {
  id: string;
  numericId: number;
  name: string;
  category: UnifiedItemType;
  price: number;
  description?: string;
  totalStock: number;
  inventoryByNursery?: InventoryNurseryRow[];
  raw?: ShopUnifiedPlantItem | ShopUnifiedMaterialItem | ShopUnifiedComboItem;
};

function getStockStatus(stock: number): 'success' | 'warning' | 'error' {
  if (stock === 0) return 'error';
  if (stock < 10) return 'warning';
  return 'success';
}

const resolveUnifiedPrice = (
  item: ShopUnifiedPlantItem | ShopUnifiedMaterialItem | ShopUnifiedComboItem
): number => {
  const candidate =
    'basePrice' in item
      ? (item.basePrice ?? (item as ShopUnifiedPlantItem | ShopUnifiedMaterialItem).price)
      : (item as ShopUnifiedComboItem).price;

  const numeric = typeof candidate === 'string' ? Number(candidate) : Number(candidate ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function ProductsInventoryPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductsInventoryRow | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  const [rows, setRows] = useState<ProductsInventoryRow[]>([]);
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
      setDebouncedKeyword(keyword);
      setPage(0);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [keyword]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const response = await searchShopUnified(
          {
            pagination: { pageNumber: page + 1, pageSize },
            keyword: debouncedKeyword.trim() ? debouncedKeyword.trim() : undefined,
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

        const mapped: ProductsInventoryRow[] = items
          .map((item: ShopUnifiedSearchItem): ProductsInventoryRow | null => {
            if (item.type === 'Plant' && item.plant) {
              const stock = Math.max(0, Math.floor(item.plant.totalAvailableStock ?? 0));
              return {
                id: `PLANT-${item.plant.id}`,
                numericId: item.plant.id,
                name: item.plant.name,
                category: 'Plant',
                price: resolveUnifiedPrice(item.plant),
                totalStock: stock,
                raw: item.plant,
              };
            }

            if (item.type === 'Material' && item.material) {
              const stock = Math.max(0, Math.floor(item.material.availableQuantity ?? item.material.quantity ?? 0));
              return {
                id: item.material.materialCode || `MAT-${item.material.id}`,
                numericId: item.material.id,
                name: item.material.materialName,
                category: 'Material',
                price: resolveUnifiedPrice(item.material),
                totalStock: stock,
                raw: item.material,
              };
            }

            if (item.type === 'Combo' && item.combo) {
              const nurseries = item.combo.nurseries ?? [];
              const totalStock = nurseries.reduce((sum, n) => sum + Math.max(0, Math.floor(n.quantity ?? 0)), 0);
              const inventoryByNursery: InventoryNurseryRow[] = nurseries.map((n) => {
                const stock = Math.max(0, Math.floor(n.quantity ?? 0));
                return {
                  nursery: n.nurseryName,
                  stock,
                  status: stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'In Stock',
                };
              });

              return {
                id: `COMBO-${item.combo.id}`,
                numericId: item.combo.id,
                name: item.combo.name,
                category: 'Combo',
                price: resolveUnifiedPrice(item.combo),
                description: item.combo.description,
                totalStock,
                inventoryByNursery,
                raw: item.combo,
              };
            }

            return null;
          })
          .filter((row): row is ProductsInventoryRow => Boolean(row));

        setRows(mapped);
        setTotalCount(Number(payload?.items?.totalCount ?? mapped.length ?? 0));
      } catch {
        if (mounted) {
          setError('Failed to load products inventory.');
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
  }, [debouncedKeyword, includeCombos, includeMaterials, includePlants, page, pageSize, selectedTab]);

  const filteredProducts = useMemo(() => {
    if (selectedTab === 1) return rows.filter((p) => p.category === 'Plant');
    if (selectedTab === 2) return rows.filter((p) => p.category === 'Material');
    if (selectedTab === 3) return rows.filter((p) => p.category === 'Combo');
    return rows;
  }, [rows, selectedTab]);

  const handleViewDetail = (product: ProductsInventoryRow) => {
    setSelectedProduct(product);
    setOpenDetail(true);
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Products & Inventory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View product information and inventory availability across all nurseries (Read-only)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Info Alert */}
      <Card sx={{ mb: 3, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <LockIcon sx={{ color: 'info.main', mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Read-Only Access
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can view product and inventory information to assist customers with product recommendations and availability.
            </Typography>
          </Box>
        </CardContent>
      </Card>

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

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Search
          </Typography>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by product name..."
            className="flex-1 min-w-[260px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
          />
          {loading ? (
            <Typography variant="caption" color="text.secondary">
              Searching...
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Price
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Total Stock
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Chip label={product.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {Number(product.price ?? 0).toLocaleString('vi-VN')} VND
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={product.totalStock} color={getStockStatus(product.totalStock)} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetail(product)}
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

      {/* Product Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon fontSize="small" />
          Product Details - {selectedProduct?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedProduct && (
            <Box>
              {/* Product Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Product ID
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedProduct.id}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Category
                  </Typography>
                  <Chip label={selectedProduct.category} size="small" variant="outlined" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Price
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {selectedProduct.price.toLocaleString('vi-VN')} VND
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Stock
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedProduct.totalStock} units
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedProduct.description || '-'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Inventory by Nursery */}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon fontSize="small" />
                Inventory by Nursery
              </Typography>

              {selectedProduct.inventoryByNursery && selectedProduct.inventoryByNursery.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Nursery</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">
                          Stock
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProduct.inventoryByNursery.map((inv, idx) => (
                        <TableRow key={`${inv.nursery}-${idx}`}>
                          <TableCell>{inv.nursery}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            {inv.stock}
                          </TableCell>
                          <TableCell>
                            <Chip label={inv.status} size="small" color={getStockStatus(inv.stock)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  This item does not provide per-nursery stock breakdown. Showing total stock only.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
