'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { Category, Tag } from '@/data/storeCatalogData';
import CategoryModal from './CategoryModal';
import TagModal from './TagModal';

interface CategoryTagManagerProps {
  categories: Category[];
  tags: Tag[];
  onAddCategory: (category: Category) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  onAddTag: (tag: Tag) => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: number) => void;
}

export default function CategoryTagManager({
  categories,
  tags,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddTag,
  onEditTag,
  onDeleteTag,
}: CategoryTagManagerProps) {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingTag, setEditingTag] = useState<Tag | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'tag'; id: number } | null>(
    null
  );

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'category') {
      onDeleteCategory(deleteTarget.id);
    } else {
      onDeleteTag(deleteTarget.id);
    }
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      {/* Categories Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Categories
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingCategory(undefined);
                setCategoryModalOpen(true);
              }}
            >
              Add
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {categories.length > 0 ? (
              categories.map((category) => (
                <Box
                  key={category.id}
                  sx={{
                    p: 1.5,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {category.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {category.description}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryModalOpen(true);
                      }}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteTarget({ type: 'category', id: category.id });
                        setDeleteConfirmOpen(true);
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: '#999' }}>
                No categories yet
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Tags
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingTag(undefined);
                setTagModalOpen(true);
              }}
            >
              Add
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Box key={tag.id} sx={{ position: 'relative' }}>
                  <Chip
                    label={tag.tagName}
                    sx={{
                      backgroundColor: '#e0f7fa',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      display: 'flex',
                      gap: 0.5,
                      opacity: 0,
                      '&:hover': { opacity: 1 },
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingTag(tag);
                        setTagModalOpen(true);
                      }}
                      sx={{
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteTarget({ type: 'tag', id: tag.id });
                        setDeleteConfirmOpen(true);
                      }}
                      sx={{
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        '&:hover': { backgroundColor: '#ffebee' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                    </IconButton>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: '#999' }}>
                No tags yet
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Category Modal */}
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={(category) => {
          if (editingCategory) {
            onEditCategory(category);
          } else {
            onAddCategory(category);
          }
          setCategoryModalOpen(false);
          setEditingCategory(undefined);
          return true;
        }}
        category={editingCategory}
      />

      {/* Tag Modal */}
      <TagModal
        open={tagModalOpen}
        onClose={() => {
          setTagModalOpen(false);
          setEditingTag(undefined);
        }}
        onSave={async (tag) => {
          if (editingTag) {
            onEditTag(tag);
          } else {
            onAddTag(tag);
          }
          setTagModalOpen(false);
          setEditingTag(undefined);
          return true;
        }}
        tag={editingTag}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
