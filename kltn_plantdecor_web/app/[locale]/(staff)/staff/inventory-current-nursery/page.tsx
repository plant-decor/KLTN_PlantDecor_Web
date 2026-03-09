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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

// Mock data - Current Nursery (Green Garden - D1)
const CURRENT_NURSERY = 'Green Garden Nursery - District 1';

const MOCK_INVENTORY = [
  {
    id: 'INV-001',
    name: 'Monstera Deliciosa',
    category: 'Plant',
    sku: 'PLANT-001',
    quantity: 12,
    minStock: 5,
    expiryDate: '2025-12-31',
    location: 'Shelf A1',
    condition: 'Good',
  },
  {
    id: 'INV-002',
    name: 'Plant Pot (8cm)',
    category: 'Material',
    sku: 'POT-001',
    quantity: 45,
    minStock: 10,
    expiryDate: null,
    location: 'Shelf B2',
    condition: 'Good',
  },
  {
    id: 'INV-003',
    name: 'Philodendron Pink Princess',
    category: 'Plant',
    sku: 'PLANT-002',
    quantity: 6,
    minStock: 3,
    expiryDate: '2025-11-30',
    location: 'Shelf A2',
    condition: 'Fair',
  },
  {
    id: 'INV-004',
    name: 'Premium Fertilizer',
    category: 'Material',
    sku: 'FERT-001',
    quantity: 28,
    minStock: 8,
    expiryDate: '2025-09-15',
    location: 'Shelf C1',
    condition: 'Good',
  },
  {
    id: 'INV-005',
    name: 'Pothos',
    category: 'Plant',
    sku: 'PLANT-003',
    quantity: 2,
    minStock: 4,
    expiryDate: '2025-10-20',
    location: 'Shelf A3',
    condition: 'Poor',
  },
];

function getStockStatus(quantity: number, minStock: number): 'success' | 'warning' | 'error' {
  if (quantity === 0) return 'error';
  if (quantity <= minStock) return 'warning';
  return 'success';
}

function getConditionColor(condition: string): 'success' | 'warning' | 'error' {
  switch (condition) {
    case 'Good':
      return 'success';
    case 'Fair':
      return 'warning';
    case 'Poor':
      return 'error';
    default:
      return 'success';
  }
}

export default function CurrentNurseryInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<(typeof MOCK_INVENTORY)[0] | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const filteredInventory = MOCK_INVENTORY.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === 0) return matchesSearch;
    if (selectedTab === 1) return matchesSearch && item.category === 'Plant';
    if (selectedTab === 2) return matchesSearch && item.category === 'Material';
    if (selectedTab === 3) {
      const quantity = item.quantity;
      return matchesSearch && (quantity === 0 || quantity <= item.minStock);
    }
    return matchesSearch;
  });

  const handleViewDetail = (item: (typeof MOCK_INVENTORY)[0]) => {
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
          Search and manage inventory for {CURRENT_NURSERY}
        </Typography>
      </Box>

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
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontSize: '0.95rem' },
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
              <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Quantity
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Min Stock
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Condition</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell sx={{ fontWeight: 'bold' }}>{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={item.quantity}
                    color={getStockStatus(item.quantity, item.minStock)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">{item.minStock}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <Chip
                    label={item.condition}
                    color={getConditionColor(item.condition)}
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
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<EditIcon />}
                    >
                      Edit
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
                  SKU
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedItem.sku}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Category
                </Typography>
                <Chip label={selectedItem.category} size="small" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Stock
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedItem.quantity} units
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Minimum Stock
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedItem.minStock} units
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Location
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedItem.location}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Condition
                </Typography>
                <Chip
                  label={selectedItem.condition}
                  color={getConditionColor(selectedItem.condition)}
                  size="small"
                />
              </Grid>
              {selectedItem.expiryDate && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Expiry Date
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedItem.expiryDate}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Close</Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Edit Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
