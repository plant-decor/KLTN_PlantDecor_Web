'use client';

import { useState, useMemo, Fragment } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import type { Product, Category, Tag, PlantInstance } from '@/data/storeCatalogData';
import InstanceModal from './InstanceModal';

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  tags: Tag[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onUpdateInstances: (productId: string, instances: PlantInstance[]) => void;
  onUpdateThumbnail: (productId: string, instanceId: string) => void;
}

export default function ProductTable({
  products,
  categories,
  tags,
  onEdit,
  onDelete,
  onUpdateInstances,
  onUpdateThumbnail,
}: ProductTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [instanceModalOpen, setInstanceModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<PlantInstance | undefined>();
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.scientificName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter.length === 0 ||
        categoryFilter.some((catId) => product.categoryIds.includes(catId));

      const matchesTags =
        tagFilter.length === 0 ||
        tagFilter.some((tagId) => product.tagIds.includes(tagId));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [products, searchQuery, categoryFilter, tagFilter]);

  const handleInstanceSave = (instance: PlantInstance) => {
    if (!currentProductId) return;

    const product = products.find((p) => p.id === currentProductId);
    if (!product) return;

    let newInstances: PlantInstance[];
    if (editingInstance) {
      newInstances = product.instances.map((inst) =>
        inst.id === editingInstance.id ? instance : inst
      );
    } else {
      newInstances = [...product.instances, instance];
    }

    onUpdateInstances(currentProductId, newInstances);
    setInstanceModalOpen(false);
    setEditingInstance(undefined);
  };

  const handleDeleteInstance = (productId: string, instanceId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newInstances = product.instances.filter((inst) => inst.id !== instanceId);
    onUpdateInstances(productId, newInstances);
  };

  const handleDeleteProduct = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <Box>
      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Search by name or scientific name"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Filter by Category:</p>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  onClick={() =>
                    setCategoryFilter((prev) =>
                      prev.includes(category.id)
                        ? prev.filter((id) => id !== category.id)
                        : [...prev, category.id]
                    )
                  }
                  variant={categoryFilter.includes(category.id) ? 'filled' : 'outlined'}
                  color={categoryFilter.includes(category.id) ? 'primary' : 'default'}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 250 }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Filter by Tags:</p>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  onClick={() =>
                    setTagFilter((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    )
                  }
                  variant={tagFilter.includes(tag.id) ? 'filled' : 'outlined'}
                  sx={{
                    backgroundColor: tagFilter.includes(tag.id) ? tag.color : 'transparent',
                    color: tagFilter.includes(tag.id) ? '#fff' : tag.color,
                    borderColor: tag.color,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '8%', minWidth: 80 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '12%', minWidth: 120 }}>Plant Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '12%', minWidth: 120 }}>Scientific Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '10%', minWidth: 90 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '16%', minWidth: 140 }}>Categories</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '16%', minWidth: 140 }}>Tags</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '10%', minWidth: 80, textAlign: 'center' }}>Total Stock</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '14%', minWidth: 110, textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => {
              const totalStock = product.instances.reduce((sum, inst) => sum + inst.quantity, 0);
              const isExpanded = expandedProduct === product.id;
              const thumbnailInstance = product.instances.find(inst => inst.id === product.thumbnailInstanceId);
              const displayImage = thumbnailInstance?.imageUrl || product.imageUrl;
              // Calculate minimum price from instances
              const minPrice = product.instances.length > 0 
                ? Math.min(...product.instances.map(inst => inst.price))
                : product.price; // Fallback to product price if no instances

              return (
                <Fragment key={product.id}>
                  <TableRow sx={{ verticalAlign: 'top' }}>
                    <TableCell sx={{ width: '8%', minWidth: 80 }}>
                      {displayImage && (
                        <Box
                          component="img"
                          src={displayImage}
                          alt={product.name}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ width: '12%', minWidth: 120 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '12%', minWidth: 120 }}>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {product.scientificName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '10%', minWidth: 90 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {product.instances.length > 1 && 'From '}
                        {minPrice.toLocaleString('vi-VN')}₫
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '16%', minWidth: 140 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {product.categoryIds.map((catId) => {
                          const category = categories.find((c) => c.id === catId);
                          return (
                            <Chip
                              key={catId}
                              label={category?.name}
                              size="small"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '16%', minWidth: 140 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {product.tagIds.map((tagId) => {
                          const tag = tags.find((t) => t.id === tagId);
                          return (
                            <Chip
                              key={tagId}
                              label={tag?.name}
                              size="small"
                              sx={{
                                backgroundColor: tag?.color,
                                color: '#fff',
                              }}
                            />
                          );
                        })}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '10%', minWidth: 80, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {totalStock}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '14%', minWidth: 110, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setExpandedProduct(isExpanded ? null : product.id)
                          }
                          title="View/Edit Instances"
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(product)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeleteTargetId(product.id);
                            setDeleteConfirmOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Instance Section */}
                  {isExpanded && (
                    <TableRow sx={{ backgroundColor: '#fafafa' }}>
                      <TableCell colSpan={8} sx={{ p: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <h4>Plant Instances</h4>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => {
                                setCurrentProductId(product.id);
                                setEditingInstance(undefined);
                                setInstanceModalOpen(true);
                              }}
                            >
                              Add Instance
                            </Button>
                          </Box>

                          {product.instances.length > 0 ? (
                            <TableContainer component={Paper} elevation={0}>
                              <Table size="small" sx={{ backgroundColor: '#fff' }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Image</TableCell>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>Quantity</TableCell>
                                                                        <TableCell>Price</TableCell>
                                    <TableCell>Condition</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Date Added</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                      Thumbnail
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                      Actions
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {product.instances.map((instance) => {
                                    const isThumbnail = product.thumbnailInstanceId === instance.id;
                                    return (
                                    <TableRow 
                                      key={instance.id}
                                      sx={{ 
                                        backgroundColor: isThumbnail ? '#e8f5e9' : 'transparent'
                                      }}
                                    >
                                      <TableCell>
                                        {instance.imageUrl && (
                                          <Box
                                            component="img"
                                            src={instance.imageUrl}
                                            alt={instance.sku}
                                            sx={{
                                              width: 50,
                                              height: 50,
                                              objectFit: 'cover',
                                              borderRadius: 1,
                                            }}
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell>{instance.sku}</TableCell>
                                      <TableCell>{instance.quantity}</TableCell>
                                                                            <TableCell>
                                                                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                                {instance.price.toLocaleString('vi-VN')}₫
                                                                              </Typography>
                                                                            </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={
                                            instance.condition.charAt(0).toUpperCase() +
                                            instance.condition.slice(1)
                                          }
                                          size="small"
                                          color={
                                            instance.condition === 'excellent'
                                              ? 'success'
                                              : instance.condition === 'good'
                                                ? 'primary'
                                                : 'warning'
                                          }
                                          variant="outlined"
                                        />
                                      </TableCell>
                                      <TableCell>{instance.location}</TableCell>
                                      <TableCell>{instance.dateAdded}</TableCell>
                                      <TableCell sx={{ textAlign: 'center' }}>
                                        <Button
                                          size="small"
                                          variant={isThumbnail ? 'contained' : 'outlined'}
                                          color={isThumbnail ? 'success' : 'primary'}
                                          onClick={() => onUpdateThumbnail(product.id, instance.id)}
                                          disabled={isThumbnail}
                                        >
                                          {isThumbnail ? '✓ Thumbnail' : 'Set as Thumbnail'}
                                        </Button>
                                      </TableCell>
                                      <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            setCurrentProductId(product.id);
                                            setEditingInstance(instance);
                                            setInstanceModalOpen(true);
                                          }}
                                          color="primary"
                                        >
                                          <EditIcon />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleDeleteInstance(product.id, instance.id)
                                          }
                                          color="error"
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <p style={{ color: '#999' }}>No instances yet</p>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Instance Modal */}
      <InstanceModal
        open={instanceModalOpen}
        onClose={() => {
          setInstanceModalOpen(false);
          setEditingInstance(undefined);
        }}
        onSave={handleInstanceSave}
        instance={editingInstance}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this plant? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
