'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import type { Category } from '@/data/storeCatalogData';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  category?: Category;
}

export default function CategoryModal({
  open,
  onClose,
  onSave,
  category,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<Category>(
    category || {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (formData.name && formData.description) {
      onSave(formData);
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        description: '',
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          label="Category Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {category ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
