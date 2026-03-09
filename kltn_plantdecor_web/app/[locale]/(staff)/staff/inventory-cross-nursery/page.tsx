'use client';

import { useState } from 'react';
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
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LogisticsIcon from '@mui/icons-material/LocalShipping';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Mock data
const NURSERIES = [
  { id: 1, name: 'Green Garden Nursery - District 1' },
  { id: 2, name: 'Tropical Plants Center - District 3' },
  { id: 3, name: 'Urban Garden Store - District 7' },
  { id: 4, name: 'Plant Paradise - Thu Duc City' },
];

const MOCK_CROSS_INVENTORY = [
  {
    id: 'CRD-001',
    productName: 'Monstera Deliciosa',
    sku: 'PLANT-001',
    category: 'Plant',
    inventory: [
      { nurseryId: 1, nurseryName: 'Green Garden - D1', quantity: 12, status: 'Available' },
      { nurseryId: 2, nurseryName: 'Tropical Plants - D3', quantity: 5, status: 'Low Stock' },
      { nurseryId: 3, nurseryName: 'Urban Garden - D7', quantity: 0, status: 'Out of Stock' },
      { nurseryId: 4, nurseryName: 'Plant Paradise - TD', quantity: 8, status: 'Available' },
    ],
  },
  {
    id: 'CRD-002',
    productName: 'Philodendron Pink Princess',
    sku: 'PLANT-002',
    category: 'Plant',
    inventory: [
      { nurseryId: 1, nurseryName: 'Green Garden - D1', quantity: 6, status: 'Low Stock' },
      { nurseryId: 2, nurseryName: 'Tropical Plants - D3', quantity: 9, status: 'Available' },
      { nurseryId: 3, nurseryName: 'Urban Garden - D7', quantity: 0, status: 'Out of Stock' },
      { nurseryId: 4, nurseryName: 'Plant Paradise - TD', quantity: 4, status: 'Low Stock' },
    ],
  },
  {
    id: 'CRD-003',
    productName: 'Premium Fertilizer',
    sku: 'FERT-001',
    category: 'Material',
    inventory: [
      { nurseryId: 1, nurseryName: 'Green Garden - D1', quantity: 28, status: 'Available' },
      { nurseryId: 2, nurseryName: 'Tropical Plants - D3', quantity: 15, status: 'Available' },
      { nurseryId: 3, nurseryName: 'Urban Garden - D7', quantity: 32, status: 'Available' },
      { nurseryId: 4, nurseryName: 'Plant Paradise - TD', quantity: 20, status: 'Available' },
    ],
  },
  {
    id: 'CRD-004',
    productName: 'Plant Pot (8cm)',
    sku: 'POT-001',
    category: 'Material',
    inventory: [
      { nurseryId: 1, nurseryName: 'Green Garden - D1', quantity: 45, status: 'Available' },
      { nurseryId: 2, nurseryName: 'Tropical Plants - D3', quantity: 28, status: 'Available' },
      { nurseryId: 3, nurseryName: 'Urban Garden - D7', quantity: 15, status: 'Available' },
      { nurseryId: 4, nurseryName: 'Plant Paradise - TD', quantity: 52, status: 'Available' },
    ],
  },
];

function getStockStatusChip(quantity: number): 'success' | 'warning' | 'error' {
  if (quantity === 0) return 'error';
  if (quantity < 10) return 'warning';
  return 'success';
}

export default function CrossNurseryInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedNursery, setSelectedNursery] = useState('all');
  const [selectedItem, setSelectedItem] = useState<(typeof MOCK_CROSS_INVENTORY)[0] | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const filteredInventory = MOCK_CROSS_INVENTORY.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === 0) return matchesSearch;
    if (selectedTab === 1) return matchesSearch && item.category === 'Plant';
    if (selectedTab === 2) return matchesSearch && item.category === 'Material';
    return matchesSearch;
  });

  const handleViewDetail = (item: (typeof MOCK_CROSS_INVENTORY)[0]) => {
    setSelectedItem(item);
    setOpenDetail(true);
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Cross-Nursery Inventory
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Search inventory across all nurseries to coordinate stock and reorder
        </Typography>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 8 }}>
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
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Nursery Filter</InputLabel>
            <Select
              value={selectedNursery}
              onChange={(e) => setSelectedNursery(e.target.value)}
              label="Nursery Filter"
            >
              <MenuItem value="all">All Nurseries</MenuItem>
              {NURSERIES.map((nursery) => (
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
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontSize: '0.95rem' },
          }}
        >
          <Tab label="All Products" />
          <Tab label="Plants" />
          <Tab label="Materials" />
        </Tabs>
      </Card>

      {/* Inventory Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 2, mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Total Stock
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Available Nurseries
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.map((item) => {
              const totalStock = item.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
              const availableCount = item.inventory.filter((inv) => inv.quantity > 0).length;

              return (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{item.productName}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={totalStock} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={availableCount} color="primary" size="small" variant="outlined" />
                  </TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SKU
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedItem.sku}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Category
                  </Typography>
                  <Chip label={selectedItem.category} size="small" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Stock
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedItem.inventory.reduce((sum, inv) => sum + inv.quantity, 0)} units
                  </Typography>
                </Grid>
              </Grid>

              {/* Inventory by Nursery Table */}
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Stock by Nursery
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nursery</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        Quantity
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        Reorder
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedItem.inventory.map((inv, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{inv.nurseryName}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          {inv.quantity}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={inv.status}
                            size="small"
                            color={getStockStatusChip(inv.quantity)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button size="small" variant="outlined">
                            Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Close</Button>
          <Button variant="contained" startIcon={<LogisticsIcon />}>
            Initiate Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
