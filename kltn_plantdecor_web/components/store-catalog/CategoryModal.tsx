'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Category } from '@/data/storeCatalogData';

interface ParentCategoryOption {
  id: number;
  name: string;
  categoryType?: number;
  parentCategoryId?: number | null;
}

const getDefaultFormData = (): Category => ({
  id: 0,
  name: '',
  description: '',
  parentCategoryId: null,
  isActive: true,
  categoryType: 0,
  categoryTypeName: '',
  createdAt: '',
  updatedAt: '',
});

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: Category) => Promise<boolean> | boolean;
  category?: Category;
  parentCategoryOptions?: ParentCategoryOption[];
}

export default function CategoryModal({
  open,
  onClose,
  onSave,
  category,
  parentCategoryOptions = [],
}: CategoryModalProps) {
  const [formData, setFormData] = useState<Category>(getDefaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (category) {
      setFormData({
        ...getDefaultFormData(),
        ...category,
        parentCategoryId: category.parentCategoryId ?? null,
      });
      return;
    }

    setFormData(getDefaultFormData());
  }, [open, category]);

  const selectableParentCategories = useMemo(
    () =>
      parentCategoryOptions.filter(
        (option) =>
          option.id !== formData.id &&
          typeof option.categoryType === 'number' &&
          option.categoryType === formData.categoryType
      ),
    [parentCategoryOptions, formData.id, formData.categoryType]
  );

  useEffect(() => {
    if (formData.parentCategoryId == null) {
      return;
    }

    const isValidParent = selectableParentCategories.some(
      (option) => option.id === formData.parentCategoryId
    );

    if (!isValidParent) {
      setFormData((prev) => ({
        ...prev,
        parentCategoryId: null,
      }));
    }
  }, [formData.parentCategoryId, selectableParentCategories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'categoryType' ? Number(value || 0) : value,
    }));
  };

  const handleParentCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;

    setFormData((prev) => ({
      ...prev,
      parentCategoryId: value === '' ? null : Number(value),
    }));
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || saving) {
      return;
    }

    setSaving(true);
    try {
      const saved = await onSave(formData);
      if (saved) {
        setFormData(getDefaultFormData());
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          label="Tên danh mục"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Mô tả"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />
        <FormControl fullWidth>
          <InputLabel id="category-parent-label">Danh mục cha</InputLabel>
          <Select
            labelId="category-parent-label"
            label="Danh mục cha"
            value={formData.parentCategoryId == null ? '' : String(formData.parentCategoryId)}
            onChange={handleParentCategoryChange}
          >
            <MenuItem value="">None (Root Category)</MenuItem>
            {selectableParentCategories.map((option) => (
              <MenuItem key={option.id} value={String(option.id)}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Danh mục cha phải có cùng loại danh mục.
          </FormHelperText>
        </FormControl>
        <TextField
          label="Loại danh mục"
          name="categoryType"
          type="number"
          value={formData.categoryType || 0}
          onChange={handleChange}
          fullWidth
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isActive || false}
              onChange={handleActiveChange}
            />
          }
          label="Trạng thái hoạt động"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}
        sx={{backgroundColor: 'var(--primary)'}}
        >
          {category ? 'Cập nhật' : 'Thêm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
