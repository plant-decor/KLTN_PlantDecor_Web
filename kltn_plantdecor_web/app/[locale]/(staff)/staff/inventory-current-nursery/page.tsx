'use client';

import { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getMyManagerNursery, getManagerCommonPlants } from '@/lib/api/managerStoreCatalogService';
import { getMyManagerNurseryMaterials } from '@/lib/api/managerNurseryMaterialsService';
import type { CommonPlantInventoryItem, NurseryMaterialItem } from '@/types/manager-store-catalog.types';

type InventoryKind = 'Plant' | 'Material';

type InventoryRow = {
  kind: InventoryKind;
  id: string;
  name: string;
  code: string;
  quantity: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  isActive?: boolean;
};

function getStockStatus(quantity: number): 'success' | 'warning' | 'error' {
  if (quantity === 0) return 'error';
  if (quantity < 10) return 'warning';
  return 'success';
}

export default function CurrentNurseryInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<InventoryRow | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const [nurseryName, setNurseryName] = useState<string>('');
  const [nurseryId, setNurseryId] = useState<number | null>(null);

  const [items, setItems] = useState<InventoryRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    let mounted = true;

    const loadNursery = async () => {
      try {
        const response = await getMyManagerNursery(false);
        const payload = response.payload ?? response.data;
        if (!mounted) return;
        if (payload?.id) {
          setNurseryId(payload.id);
          setNurseryName(payload.name || '');
        }
      } catch {
        if (mounted) {
          setError('Failed to load nursery information.');
        }
      }
    };

    void loadNursery();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!nurseryId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    const loadInventory = async () => {
      try {
        const pageNumber = page + 1;
        const query = { pageNumber, pageSize };

        const shouldLoadPlants = selectedTab === 0 || selectedTab === 1 || selectedTab === 3;
        const shouldLoadMaterials = selectedTab === 0 || selectedTab === 2 || selectedTab === 3;

        const [plantsResponse, materialsResponse] = await Promise.all([
          shouldLoadPlants ? getManagerCommonPlants(nurseryId, query, false).catch(() => null) : Promise.resolve(null),
          shouldLoadMaterials ? getMyManagerNurseryMaterials(query, false).catch(() => null) : Promise.resolve(null),
        ]);

        if (!mounted) return;

        const plantPayload = plantsResponse?.payload ?? plantsResponse?.data;
        const materialPayload = materialsResponse?.payload ?? materialsResponse?.data;

        const plantRows: InventoryRow[] =
          (plantPayload?.items ?? []).map((item: CommonPlantInventoryItem) => ({
            kind: 'Plant',
            id: `plant-${item.id}`,
            name: item.plantName || `Plant #${item.plantId}`,
            code: `PLANT-${item.plantId}`,
            quantity: Math.max(0, Math.floor(item.quantity ?? 0)),
            reservedQuantity: Math.max(0, Math.floor(item.reservedQuantity ?? 0)),
            availableQuantity: Math.max(0, Math.floor(item.availableQuantity ?? 0)),
            isActive: item.isActive,
          })) ?? [];

        const materialRows: InventoryRow[] =
          (materialPayload?.items ?? []).map((item: NurseryMaterialItem) => ({
            kind: 'Material',
            id: `material-${item.id}`,
            name: item.materialName || `Material #${item.materialId}`,
            code: item.materialCode || `MAT-${item.materialId}`,
            quantity: Math.max(0, Math.floor(item.quantity ?? 0)),
            reservedQuantity: Math.max(0, Math.floor(item.reservedQuantity ?? 0)),
            availableQuantity: Math.max(0, Math.floor(item.availableQuantity ?? 0)),
            isActive: item.isActive,
          })) ?? [];

        const merged = [...plantRows, ...materialRows];
        setItems(merged);
        setTotalCount(
          Number(plantPayload?.totalCount ?? 0) + Number(materialPayload?.totalCount ?? 0)
        );
      } catch {
        if (mounted) {
          setError('Failed to load inventory.');
          setItems([]);
          setTotalCount(0);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadInventory();

    return () => {
      mounted = false;
    };
  }, [nurseryId, page, pageSize, selectedTab]);

  const filteredInventory = useMemo(() => {
    const normalizedTerm = debouncedSearchTerm.trim().toLowerCase();
    const matchesSearch = (row: InventoryRow) =>
      !normalizedTerm ||
      row.name.toLowerCase().includes(normalizedTerm) ||
      row.code.toLowerCase().includes(normalizedTerm);

    const matchesTab = (row: InventoryRow) => {
      if (selectedTab === 0) return true;
      if (selectedTab === 1) return row.kind === 'Plant';
      if (selectedTab === 2) return row.kind === 'Material';
      if (selectedTab === 3) {
        const available = typeof row.availableQuantity === 'number' ? row.availableQuantity : row.quantity;
        return available === 0;
      }
      return true;
    };

    return items.filter((row) => matchesSearch(row) && matchesTab(row));
  }, [items, debouncedSearchTerm, selectedTab]);

  const handleViewDetail = (item: InventoryRow) => {
    setSelectedItem(item);
    setOpenDetail(true);
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Current Nursery Inventory
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          View inventory for {nurseryName || 'your nursery'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by product name or SKU..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

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
          <Tab label="All Items" />
          <Tab label="Plants" />
          <Tab label="Materials" />
          <Tab label="Low Stock" />
        </Tabs>
      </Card>

      {/* Inventory Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Quantity
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Available
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Actions
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
              filteredInventory.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{item.name}</TableCell>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>
                    <Chip label={item.kind} size="small" variant="outlined" />
                  </TableCell>
                <TableCell align="center">
                  <Chip
                    label={item.quantity.toLocaleString('en-US')}
                    color={getStockStatus(item.quantity)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={(item.availableQuantity ?? item.quantity).toLocaleString('en-US')}
                    color={getStockStatus(item.availableQuantity ?? item.quantity)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetail(item)}
                    >
                      View
                    </Button>
                  </Box>
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
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Item Details - {selectedItem?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Product Name
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedItem.name}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Code
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedItem.code}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Category
                </Typography>
                <Chip label={selectedItem.kind} size="small" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Stock
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedItem.quantity.toLocaleString('en-US')} units
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Available Stock
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {(selectedItem.availableQuantity ?? selectedItem.quantity).toLocaleString('en-US')} units
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
