'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { Product, Category, Tag, PlantInstance } from '@/data/storeCatalogData';
import InstanceModal from './InstanceModal';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product;
  categories: Category[];
  tags: Tag[];
}

export default function ProductModal({
  open,
  onClose,
  onSave,
  product,
  categories,
  tags,
}: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      scientificName: '',
      imageUrl: '',
      price: 0,
      categoryIds: [],
      tagIds: [],
      instances: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.imageUrl || '');
  const [instanceModalOpen, setInstanceModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<PlantInstance | undefined>();

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product.imageUrl || '');
      setImageFile(null);
    } else {
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        description: '',
        scientificName: '',
        imageUrl: '',
        price: 0,
        categoryIds: [],
        tagIds: [],
        instances: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [product, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string, // In production, this would be uploaded to server
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (categoryIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds,
    }));
  };

  const handleTagChange = (tagIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      tagIds,
    }));
  };

  const handleSave = () => {
    if (
      formData.name &&
      formData.description &&
      formData.scientificName &&
      formData.price !== undefined
    ) {
      onSave({
        ...formData,
        updatedAt: new Date().toISOString().split('T')[0],
      } as Product);
    }
  };

  const handleInstanceSave = (instance: PlantInstance) => {
    const instances = formData.instances || [];
    const updatedInstances = editingInstance
      ? instances.map((inst) => (inst.id === editingInstance.id ? instance : inst))
      : [...instances, instance];

    setFormData((prev) => ({
      ...prev,
      instances: updatedInstances,
    }));
    setInstanceModalOpen(false);
    setEditingInstance(undefined);
  };

  const handleDeleteInstance = (instanceId: string) => {
    const instances = formData.instances || [];
    setFormData((prev) => ({
      ...prev,
      instances: instances.filter((inst) => inst.id !== instanceId),
      thumbnailInstanceId:
        prev.thumbnailInstanceId === instanceId ? undefined : prev.thumbnailInstanceId,
    }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{product ? 'Edit Plant' : 'Add New Plant'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Plant Name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Scientific Name"
            name="scientificName"
            value={formData.scientificName || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Price (VND)"
            name="price"
            type="number"
            value={formData.price || 0}
            onChange={handleChange}
            fullWidth
          />

          {/* Image Upload */}
          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUploadIcon />}
            >
              Upload Plant Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                />
              </Box>
            )}
          </Box>

          <FormControl fullWidth>
            <InputLabel>Categories</InputLabel>
            <Select
              multiple
              name="categoryIds"
              value={formData.categoryIds || []}
              onChange={(e) =>
                handleCategoryChange(
                  typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                )
              }
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={categories.find((c) => c.id === value)?.name}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Tags</InputLabel>
            <Select
              multiple
              name="tagIds"
              value={formData.tagIds || []}
              onChange={(e) =>
                handleTagChange(
                  typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                )
              }
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => {
                    const tag = tags.find((t) => t.id === value);
                    return (
                      <Chip
                        key={value}
                        label={tag?.name}
                        size="small"
                        sx={{ backgroundColor: tag?.color }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {tags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Instances Section */}
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Instances
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingInstance(undefined);
                  setInstanceModalOpen(true);
                }}
              >
                Add Instance
              </Button>
            </Box>

            {(formData.instances || []).length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align="center">Thumbnail</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(formData.instances || []).map((instance) => (
                    <TableRow key={instance.id}>
                      <TableCell>{instance.sku}</TableCell>
                      <TableCell>{instance.quantity}</TableCell>
                      <TableCell>
                        {instance.price.toLocaleString('vi-VN')}₫
                      </TableCell>
                      <TableCell>
                        {instance.condition.charAt(0).toUpperCase() +
                          instance.condition.slice(1)}
                      </TableCell>
                      <TableCell>{instance.location}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant={
                            formData.thumbnailInstanceId === instance.id
                              ? 'contained'
                              : 'outlined'
                          }
                          color={
                            formData.thumbnailInstanceId === instance.id
                              ? 'success'
                              : 'primary'
                          }
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              thumbnailInstanceId: instance.id,
                            }))
                          }
                          disabled={formData.thumbnailInstanceId === instance.id}
                        >
                          {formData.thumbnailInstanceId === instance.id
                            ? '✓ Thumbnail'
                            : 'Set'}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingInstance(instance);
                            setInstanceModalOpen(true);
                          }}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteInstance(instance.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" sx={{ color: '#888' }}>
                No instances added yet.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {product ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      <InstanceModal
        open={instanceModalOpen}
        onClose={() => {
          setInstanceModalOpen(false);
          setEditingInstance(undefined);
        }}
        onSave={handleInstanceSave}
        instance={editingInstance}
      />
    </>
  );
}
