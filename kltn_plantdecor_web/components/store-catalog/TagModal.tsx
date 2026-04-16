'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import { Tag } from '@/data/storeCatalogData';
import type { TagEnumValue } from '@/lib/api/tagService';

interface TagModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tag: Tag) => Promise<boolean>;
  tag?: Tag;
  tagTypeOptions: TagEnumValue[];
}

const DEFAULT_TAG: Tag = {
  id: 0,
  tagName: '',
  tagType: 1,
  tagTypeName: '',
};

export default function TagModal({
  open,
  onClose,
  onSave,
  tag,
  tagTypeOptions,
}: TagModalProps) {
  const [formData, setFormData] = useState<Tag>(DEFAULT_TAG);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tagTypeOptions.length === 0) {
      return;
    }

    queueMicrotask(() => {
      setFormData((prev) => {
        if (prev.tagType > 0) {
          return prev;
        }

        return {
          ...prev,
          tagType: tagTypeOptions[0].value,
        };
      });
    });
  }, [tagTypeOptions]);

  useEffect(() => {
    if (tag) {
      queueMicrotask(() => {
        setFormData(tag);
      });
    } else {
      queueMicrotask(() => {
        setFormData(DEFAULT_TAG);
      });
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
    if (!formData.tagName.trim() || !formData.tagType) {
      return;
    }

    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);

    if (success) {
      setFormData(DEFAULT_TAG);
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{tag ? 'Cập nhật thẻ' : 'Thêm thẻ Mới'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          label="Tên thẻ"
          name="tagName"
          value={formData.tagName}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Loại thẻ"
          name="tagType"
          select
          value={formData.tagType}
          onChange={handleChange}
          fullWidth
          helperText={tagTypeOptions.length === 0 ? 'Không tải được danh sách loại tag' : undefined}
        >
          {tagTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || !formData.tagName.trim() || !formData.tagType}
                sx={{backgroundColor: 'var(--primary)'}}>
          {saving ? 'Saving...' : tag ? 'Cập nhật' : 'Thêm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
