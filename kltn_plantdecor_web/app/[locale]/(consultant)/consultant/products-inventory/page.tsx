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
  Tabs,
  Tab,
  Grid,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import StorageIcon from '@mui/icons-material/Storage';

// Mock data
const MOCK_PRODUCTS = [
  {
    id: 'PRD-001',
    name: 'Monstera Deliciosa',
    category: 'Plant',
    price: 150000,
    description: 'Large tropical plant with split leaves',
    inventory: [
      { nursery: 'Green Garden - D1', stock: 12, status: 'In Stock' },
      { nursery: 'Tropical Plants - D3', stock: 5, status: 'Low Stock' },
      { nursery: 'Urban Garden - D7', stock: 0, status: 'Out of Stock' },
    ],
  },
  {
    id: 'PRD-002',
    name: 'Plant Pot (8cm)',
    category: 'Material',
    price: 50000,
    description: 'Ceramic pot for small plants',
    inventory: [
      { nursery: 'Green Garden - D1', stock: 45, status: 'In Stock' },
      { nursery: 'Tropical Plants - D3', stock: 28, status: 'In Stock' },
      { nursery: 'Urban Garden - D7', stock: 15, status: 'In Stock' },
    ],
  },
  {
    id: 'PRD-003',
    name: 'Premium Plant Combo',
    category: 'Combo',
    price: 300000,
    description: 'Bundle with plant, pot, and soil',
    inventory: [
      { nursery: 'Green Garden - D1', stock: 3, status: 'Low Stock' },
      { nursery: 'Tropical Plants - D3', stock: 8, status: 'In Stock' },
      { nursery: 'Urban Garden - D7', stock: 2, status: 'Low Stock' },
    ],
  },
  {
    id: 'PRD-004',
    name: 'Philodendron Pink Princess',
    category: 'Plant',
    price: 180000,
    description: 'Beautiful pink variegated philodendron',
    inventory: [
      { nursery: 'Green Garden - D1', stock: 6, status: 'Low Stock' },
      { nursery: 'Tropical Plants - D3', stock: 9, status: 'In Stock' },
      { nursery: 'Urban Garden - D7', stock: 0, status: 'Out of Stock' },
    ],
  },
];

function getStockStatus(stock: number): 'success' | 'warning' | 'error' {
  if (stock === 0) return 'error';
  if (stock < 10) return 'warning';
  return 'success';
}

export default function ProductsInventoryPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<(typeof MOCK_PRODUCTS)[0] | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    if (selectedTab === 0) return true;
    if (selectedTab === 1) return p.category === 'Plant';
    if (selectedTab === 2) return p.category === 'Material';
    if (selectedTab === 3) return p.category === 'Combo';
    return true;
  });

  const handleViewDetail = (product: (typeof MOCK_PRODUCTS)[0]) => {
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
          <Tab label="Combos" />
        </Tabs>
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
            {filteredProducts.map((product) => {
              const totalStock = product.inventory.reduce((sum, inv) => sum + inv.stock, 0);

              return (
                <TableRow key={product.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Chip label={product.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {product.price.toLocaleString('vi-VN')} VND
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={totalStock}
                      color={getStockStatus(totalStock)}
                      size="small"
                    />
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
                    {selectedProduct.inventory.reduce((sum, inv) => sum + inv.stock, 0)} units
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedProduct.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Inventory by Nursery */}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon fontSize="small" />
                Inventory by Nursery
              </Typography>

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
                    {selectedProduct.inventory.map((inv, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{inv.nursery}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          {inv.stock}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={inv.status}
                            size="small"
                            color={getStockStatus(inv.stock)}
                          />
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
          <Button onClick={() => setOpenDetail(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
