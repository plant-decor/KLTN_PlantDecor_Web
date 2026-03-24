'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { Tag } from '@/data/storeCatalogData';

interface TagModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tag: Tag) => Promise<boolean>;
  tag?: Tag;
}

export default function TagModal({
  open,
  onClose,
  onSave,
  tag,
}: TagModalProps) {
  const defaultTag: Tag = {
    id: 0,
    tagName: '',
    tagType: 1,
    tagTypeName: '',
  };

  const [formData, setFormData] = useState<Tag>({
    id: 0,
    tagName: '',
    tagType: 1,
    tagTypeName: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tag) {
      setFormData(tag);
    } else {
      setFormData(defaultTag);
    }
  }, [tag, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'tagType') {
      setFormData((prev) => ({
        ...prev,
        tagType: Number(value) || 0,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.tagName.trim()) {
      return;
    }

    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);

    if (success) {
      setFormData(defaultTag);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{tag ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          label="Tag Name"
          name="tagName"
          value={formData.tagName}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Tag Type"
          name="tagType"
          type="number"
          value={formData.tagType}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Tag Type Name"
          name="tagTypeName"
          value={formData.tagTypeName}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || !formData.tagName.trim()}>
          {saving ? 'Saving...' : tag ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
