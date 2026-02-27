'use client';

import { useState, useMemo } from 'react';
import { Box, Button, Container, Tabs, Tab, Typography, Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { mockCategories, mockTags, type Category, type Tag } from '@/data/storeCatalogData';
import CategoryModal from '@/components/StoreCatalog/CategoryModal';
import TagModal from '@/components/StoreCatalog/TagModal';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CategoriesTagsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingTag, setEditingTag] = useState<Tag | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'tag'; id: string } | null>(null);

  // Categories Handlers
  const handleAddCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const handleEditCategory = (category: Category) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? category : c))
    );
  };

  const handleSaveCategory = (category: Category) => {
    if (editingCategory) {
      handleEditCategory(category);
    } else {
      handleAddCategory(category);
    }
    setCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategoryConfirm = () => {
    if (deleteTarget?.type === 'category' && deleteTarget.id) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  // Tags Handlers
  const handleAddTag = (tag: Tag) => {
    setTags((prev) => [...prev, tag]);
  };

  const handleEditTag = (tag: Tag) => {
    setTags((prev) =>
      prev.map((t) => (t.id === tag.id ? tag : t))
    );
  };

  const handleSaveTag = (tag: Tag) => {
    if (editingTag) {
      handleEditTag(tag);
    } else {
      handleAddTag(tag);
    }
    setTagModalOpen(false);
    setEditingTag(undefined);
  };

  const handleDeleteTagConfirm = () => {
    if (deleteTarget?.type === 'tag' && deleteTarget.id) {
      setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Categories & Tags Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Manage product categories and tags for your store catalog
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
            Total Categories
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            {categories.length}
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
            Total Tags
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
            {tags.length}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Categories" />
          <Tab label="Tags" />
        </Tabs>
      </Box>

      {/* Categories Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCategory(undefined);
              setCategoryModalOpen(true);
            }}
          >
            Add New Category
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {categories.length > 0 ? (
            categories.map((category) => (
              <Card key={category.id} sx={{ transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box style={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.5 }}>
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
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: '#999', gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              No categories yet. Create one to get started!
            </Typography>
          )}
        </Box>
      </TabPanel>

      {/* Tags Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTag(undefined);
              setTagModalOpen(true);
            }}
          >
            Add New Tag
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {tags.length > 0 ? (
            tags.map((tag) => (
              <Card
                key={tag.id}
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  {/* Tag Color Preview */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: tag.color,
                      margin: '0 auto 1rem',
                    }}
                  />

                  {/* Tag Name */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {tag.name}
                  </Typography>

                  {/* Color Code */}
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 2 }}>
                    {tag.color.toUpperCase()}
                  </Typography>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingTag(tag);
                        setTagModalOpen(true);
                      }}
                      color="primary"
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteTarget({ type: 'tag', id: tag.id });
                        setDeleteConfirmOpen(true);
                      }}
                      color="error"
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: '#999', gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              No tags yet. Create one to get started!
            </Typography>
          )}
        </Box>
      </TabPanel>

      {/* Category Modal */}
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      {/* Tag Modal */}
      <TagModal
        open={tagModalOpen}
        onClose={() => {
          setTagModalOpen(false);
          setEditingTag(undefined);
        }}
        onSave={handleSaveTag}
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
          <Button
            onClick={() => {
              if (deleteTarget?.type === 'category') {
                handleDeleteCategoryConfirm();
              } else {
                handleDeleteTagConfirm();
              }
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
