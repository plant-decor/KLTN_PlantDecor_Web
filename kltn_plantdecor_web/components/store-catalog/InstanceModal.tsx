'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  type SelectChangeEvent,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import type { PlantInstance } from '@/data/storeCatalogData';

interface InstanceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (instance: PlantInstance) => void;
  instance?: PlantInstance;
}

export default function InstanceModal({
  open,
  onClose,
  onSave,
  instance,
}: InstanceModalProps) {
  const createEmptyInstance = (): PlantInstance => ({
    id: '',
    sku: '',
    quantity: 0,
    price: 0,
    condition: 'good',
    location: '',
    dateAdded: new Date().toISOString().split('T')[0],
    imageUrl: '',
  });

  const [formData, setFormData] = useState<PlantInstance>(
    instance || createEmptyInstance()
  );
  const [imagePreview, setImagePreview] = useState<string>(instance?.imageUrl || '');

  useEffect(() => {
    if (instance) {
      queueMicrotask(() => {
        setFormData(instance);
        setImagePreview(instance.imageUrl || '');
      });
    } else {
      queueMicrotask(() => {
        setFormData(createEmptyInstance());
        setImagePreview('');
      });
    }
  }, [instance, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as { name?: string; value: string };
    if (!name) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (formData.sku && formData.location) {
      onSave({
        ...formData,
        id: formData.id || `instance-${Date.now()}`,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{instance ? 'Edit Instance' : 'Add New Instance'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          fullWidth
          placeholder="e.g., MON-001-001"
        />
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Price (VND)"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          fullWidth
          placeholder="e.g., 350000"
        />
        <FormControl fullWidth>
          <InputLabel>Condition</InputLabel>
          <Select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
          >
            <MenuItem value="excellent">Excellent</MenuItem>
            <MenuItem value="good">Good</MenuItem>
            <MenuItem value="fair">Fair</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
          placeholder="e.g., Shelf A1"
        />
        <TextField
          label="Date Added"
          name="dateAdded"
          type="date"
          value={formData.dateAdded}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        {/* Image Upload */}
        <Box>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<CloudUploadIcon />}
          >
            Upload Instance Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
          {imagePreview && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Image
                src={imagePreview}
                alt="Preview"
                width={400}
                height={200}
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained"
        sx={{backgroundColor: 'var(--primary)'}}
        >
          {instance ? 'Cập nhật' : 'Thêm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
