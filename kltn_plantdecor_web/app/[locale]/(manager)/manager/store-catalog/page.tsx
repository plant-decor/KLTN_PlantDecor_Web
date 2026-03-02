'use client';

import { useState, useMemo } from 'react';
import { Box, Button, Container, Typography, TextField, Paper } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  mockProducts,
  mockCategories,
  mockTags,
  type Product,
  type PlantInstance,
} from '@/data/storeCatalogData';
import ProductModal from '@/components/store-catalog/ProductModal';
import ProductTable from '@/components/store-catalog/ProductTable';
import { useProductFilter } from '@/hooks/useProductFilter';

export default function StoreCatalogPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories] = useState(mockCategories);
  const [tags] = useState(mockTags);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  // Use the shared filter hook
  const {
    filters,
    filteredItems: filteredProducts,
    updateFilters,
    resetFilters,
  } = useProductFilter(products);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchQuery: e.target.value });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );
    } else {
      setProducts((prev) => [...prev, product]);
    }
    setProductModalOpen(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateInstances = (productId: string, instances: PlantInstance[]) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, instances, updatedAt: new Date().toISOString().split('T')[0] } : p
      )
    );
  };

  const handleUpdateThumbnail = (productId: string, instanceId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, thumbnailInstanceId: instanceId, updatedAt: new Date().toISOString().split('T')[0] } : p
      )
    );
  };

  const totalProducts = products.length;
  const totalStock = useMemo(
    () => products.reduce((sum, p) => sum + p.instances.reduce((s, i) => s + i.quantity, 0), 0),
    [products]
  );

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Store Catalog
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Manage your plant inventory, instances, and stock levels
        </Typography>
      </Box>

      {/* Statistics */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: '#e8f5e9',
            borderRadius: 1,
            border: '1px solid #4caf50',
          }}
        >
          <Typography variant="body2" sx={{ color: '#666' }}>
            Total Plants
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            {totalProducts}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 2,
            backgroundColor: '#e3f2fd',
            borderRadius: 1,
            border: '1px solid #2196f3',
          }}
        >
          <Typography variant="body2" sx={{ color: '#666' }}>
            Total Stock
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
            {totalStock}
          </Typography>
        </Box>
      </Box>

      {/* Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingProduct(undefined);
            setProductModalOpen(true);
          }}
        >
          Add New Plant
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search products by name, description..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} />,
            }}
            variant="outlined"
            size="small"
          />
          <Button
            variant="outlined"
            onClick={resetFilters}
            sx={{ minWidth: '120px' }}
          >
            Clear Filters
          </Button>
        </Box>
        {filters.searchQuery && (
          <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
            Found {filteredProducts.length} product(s)
          </Typography>
        )}
      </Paper>

      {/* Products Table */}
      <ProductTable
        products={filteredProducts}
        categories={categories}
        tags={tags}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onUpdateInstances={handleUpdateInstances}
        onUpdateThumbnail={handleUpdateThumbnail}
      />

      {/* Product Modal */}
      <ProductModal
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(undefined);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
        tags={tags}
      />
    </Container>
  );
}
