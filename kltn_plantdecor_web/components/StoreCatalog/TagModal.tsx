'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import type { Tag } from '@/data/storeCatalogData';

interface TagModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tag: Tag) => void;
  tag?: Tag;
}

const COLOR_PRESETS = [
  '#FFB6C1', // Light Pink
  '#90EE90', // Light Green
  '#87CEEB', // Sky Blue
  '#FFD700', // Gold
  '#DDA0DD', // Plum
  '#F0E68C', // Khaki
  '#FF6347', // Tomato
  '#20B2AA', // Light Sea Green
  '#FF69B4', // Hot Pink
  '#98FB98', // Pale Green
];

export default function TagModal({
  open,
  onClose,
  onSave,
  tag,
}: TagModalProps) {
  const [formData, setFormData] = useState<Tag>(
    tag || {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      color: '#FFB6C1',
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (formData.name) {
      onSave(formData);
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        color: '#FFB6C1',
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{tag ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          label="Tag Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Color (Hex)"
          name="color"
          type="color"
          value={formData.color}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <Box>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Color Presets:</p>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {COLOR_PRESETS.map((color) => (
              <Box
                key={color}
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: color,
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: formData.color === color ? '2px solid #333' : 'none',
                }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {tag ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
