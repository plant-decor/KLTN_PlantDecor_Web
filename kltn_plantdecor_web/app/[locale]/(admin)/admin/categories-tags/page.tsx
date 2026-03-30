'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Category, Tag } from '@/data/storeCatalogData';
import { useAdminCategories } from '@/lib/api/admin/useAdminCategories';
import { useAdminTags } from '@/lib/api/admin/useAdminTags';
import type { CategoryCreateUpdateRequest, CategoryResponse } from '@/lib/api/categoriesService';
import type { TagCreateUpdateRequest } from '@/lib/api/tagService';
import CategoryModal from '@/components/store-catalog/CategoryModal';
import TagModal from '@/components/store-catalog/TagModal';
import { toast } from 'react-toastify';

interface HierarchicalCategoryRow {
  category: CategoryResponse;
  level: number;
  hasChildren: boolean;
}

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
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>(undefined);
  const [editingTag, setEditingTag] = useState<Tag | undefined>();
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number> | null>(null);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<CategoryResponse | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'tag'; id: number; name: string } | null>(null);
  const initialFetchDoneRef = useRef(false);

  // Use Categories Hook
  const {
    categoryTree,
    loading: categoriesLoading,
    error: categoriesError,
    totalCount: categoriesCount,
    fetchCategoryTree,
    addCategory,
    updateCategoryItem,
    toggleActive,
    deleteCategory,
    clearError: clearCategoriesError,
  } = useAdminCategories();

  // Use Tags Hook
  const {
    tags,
    loading: tagsLoading,
    error: tagsError,
    totalCount: tagsCount,
    pageNumber: tagPageNumber,
    pageSize: tagPageSize,
    totalPages: tagTotalPages,
    hasPrevious: tagHasPrevious,
    hasNext: tagHasNext,
    fetchTags,
    addTag,
    updateTagItem,
    deleteTag,
    setPage: setTagPage,
    setPageSize: setTagPageSize,
    clearError: clearTagsError,
  } = useAdminTags();

  const loading = categoriesLoading || tagsLoading;

  const getNodeChildren = (node: any): any[] => {
    if (Array.isArray(node?.subCategories)) {
      return node.subCategories;
    }

    if (Array.isArray(node?.children)) {
      return node.children;
    }

    return [];
  };

  const normalizeNode = (node: any): CategoryResponse => {
    return {
      id: Number(node.id),
      name: String(node.name ?? ''),
      parentCategoryId: node.parentCategoryId ?? null,
      isActive: Boolean(node.isActive),
      categoryType: Number(node.categoryType ?? 0),
      parentCategoryName: node.parentCategoryName ?? null,
      categoryTypeName: node.categoryTypeName,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      subCategories: node.subCategories,
    };
  };

  const parentCategoryOptions = useMemo(() => {
    const flattenTree = (nodes: any[]): CategoryResponse[] => {
      const flattened: CategoryResponse[] = [];

      nodes.forEach((node) => {
        if (!node || typeof node !== 'object') {
          return;
        }

        const normalizedNode = normalizeNode(node);
        flattened.push(normalizedNode);

        const children = getNodeChildren(node);
        if (children.length > 0) {
          flattened.push(...flattenTree(children));
        }
      });

      return flattened;
    };

    if (!Array.isArray(categoryTree) || categoryTree.length === 0) {
      return [];
    }

    const flattened = flattenTree(categoryTree);
    const deduped = new Map<number, CategoryResponse>();

    flattened.forEach((item) => {
      deduped.set(item.id, item);
    });

    return Array.from(deduped.values()).map((cat) => ({
      id: cat.id,
      name: cat.name,
      categoryType: cat.categoryType,
      parentCategoryId: cat.parentCategoryId ?? null,
    }));
  }, [categoryTree]);

  const rootCategoryIds = useMemo(
    () => categoryTree.map((node) => Number(node?.id)).filter((id) => Number.isFinite(id)),
    [categoryTree]
  );

  const effectiveExpandedCategoryIds = useMemo(() => {
    if (expandedCategoryIds) {
      return expandedCategoryIds;
    }

    return new Set(rootCategoryIds);
  }, [expandedCategoryIds, rootCategoryIds]);

  const hierarchicalCategories = useMemo(() => {
    const flattened: HierarchicalCategoryRow[] = [];

    const walk = (nodes: any[], level: number) => {
      nodes.forEach((node) => {
        if (!node || typeof node !== 'object') {
          return;
        }

        const normalizedNode = normalizeNode(node);
        const children = getNodeChildren(node);
        const hasChildren = children.length > 0;

        flattened.push({ category: normalizedNode, level, hasChildren });

        if (hasChildren && effectiveExpandedCategoryIds.has(normalizedNode.id)) {
          walk(children, level + 1);
        }
      });
    };

    if (Array.isArray(categoryTree) && categoryTree.length > 0) {
      walk(categoryTree, 0);
    }

    return flattened;
  }, [categoryTree, effectiveExpandedCategoryIds]);

  const handleToggleExpand = (categoryId: number) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev ?? rootCategoryIds);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };

  // Load initial data once
  useEffect(() => {
    if (initialFetchDoneRef.current) {
      return;
    }

    initialFetchDoneRef.current = true;
    void fetchCategoryTree();
    void fetchTags({ pageNumber: 1, pageSize: 10 });
  }, [fetchCategoryTree, fetchTags]);

  const convertToModalCategory = (cat: CategoryResponse | undefined): Category | undefined => {
    if (!cat) return undefined;
    return {
      id: cat.id,
      name: cat.name,
      description: '',
      parentCategoryId: cat.parentCategoryId != null ? cat.parentCategoryId : null,
      isActive: cat.isActive,
      categoryType: cat.categoryType,
      categoryTypeName: cat.categoryTypeName || '',
      createdAt: cat.createdAt || '',
      updatedAt: cat.updatedAt || '',
      parentCategoryName: cat.parentCategoryName ?? undefined,
      subCategories: cat.subCategories?.map((sub) => ({
        id: sub.id,
        name: sub.name,
        description: '',
        parentCategoryId: sub.parentCategoryId ?? null,
        isActive: sub.isActive,
        categoryType: sub.categoryType,
        categoryTypeName: sub.categoryTypeName || '',
        createdAt: sub.createdAt || '',
        updatedAt: sub.updatedAt || '',
      })),
    };
  };

  // ============ Categories Handlers ============
  const handleSaveCategory = async (category: any): Promise<boolean> => {
    if (editingCategory) {
      const updateData: CategoryCreateUpdateRequest = {
        name: category.name,
        parentCategoryId: category.parentCategoryId != null ? Number(category.parentCategoryId) : null,
        isActive: category.isActive !== undefined ? category.isActive : true,
        categoryType: category.categoryType || 0,
      };
      const updated = await updateCategoryItem(editingCategory.id, updateData);

      if (!updated) {
        toast.error('Update category failed. Please try again.');
        return false;
      }

      toast.success('Category updated successfully');
      setEditingCategory(undefined);
      return true;
    }

    const createData: CategoryCreateUpdateRequest = {
      name: category.name,
      parentCategoryId: category.parentCategoryId != null ? Number(category.parentCategoryId) : null,
      isActive: category.isActive !== undefined ? category.isActive : true,
      categoryType: category.categoryType || 0,
    };

    const created = await addCategory(createData);
    if (!created) {
      toast.error('Create category failed. Please try again.');
      return false;
    }

    toast.success('Category created successfully');
    setEditingCategory(undefined);
    return true;
  };

  const handleToggleCategoryActive = async (category: CategoryResponse) => {
    if (Array.isArray(category.subCategories) && category.subCategories.length > 0) {
      toast.info('Cannot toggle category with subcategories');
      return;
    }

    setToggleTarget(category);
    setToggleConfirmOpen(true);
  };

  const handleConfirmToggleCategoryActive = async () => {
    if (!toggleTarget) {
      return;
    }

    const result = await toggleActive(toggleTarget.id);
    if (result) {
      toast.success(`Category ${toggleTarget.isActive ? 'deactivated' : 'activated'} successfully`);
    } else {
      toast.error('Toggle category status failed. Please try again.');
    }

    setToggleConfirmOpen(false);
    setToggleTarget(null);
  };

  const handleDeleteCategory = (category: CategoryResponse) => {
    if (Array.isArray(category.subCategories) && category.subCategories.length > 0) {
      toast.info('Cannot delete category with subcategories');
      return;
    }

    setDeleteTarget({ type: 'category', id: category.id, name: category.name });
    setDeleteConfirmOpen(true);
  };

  // ============ Tags Handlers ============
  const handleSaveTag = async (tag: any): Promise<boolean> => {
    if (editingTag) {
      const updateData: TagCreateUpdateRequest = {
        name: tag.name,
        color: tag.color,
      };
      const updated = await updateTagItem(editingTag.id, updateData);

      if (!updated) {
        toast.error('Update tag failed. Please try again.');
        return false;
      }

      toast.success('Tag updated successfully');
      setEditingTag(undefined);
      return true;
    }

    const createData: TagCreateUpdateRequest = {
      name: tag.name,
      color: tag.color,
    };

    const created = await addTag(createData);
    if (!created) {
      toast.error('Create tag failed. Please try again.');
      return false;
    }

    toast.success('Tag created successfully');
    setEditingTag(undefined);
    return true;
  };

  const handleDeleteTag = (tag: Tag) => {
    setDeleteTarget({ type: 'tag', id: tag.id, name: tag.tagName });
    setDeleteConfirmOpen(true);
  };

  // ============ Delete Handlers ============
  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    let success = false;

    if (deleteTarget.type === 'category') {
      success = await deleteCategory(deleteTarget.id);
      if (success) {
        toast.success('Category deleted successfully');
      } else {
        toast.error('Delete category failed. Please try again.');
      }
    } else if (deleteTarget.type === 'tag') {
      success = await deleteTag(deleteTarget.id);
      if (success) {
        toast.success('Tag deleted successfully');
      } else {
        toast.error('Delete tag failed. Please try again.');
      }
    }

    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  const clearError = () => {
    clearCategoriesError();
    clearTagsError();
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
            {categoriesCount}
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
            {tagsCount}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Categories" />
          <Tab label="Tags" />
        </Tabs>
      </Box>

      {/* Categories Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Error Alert */}
        {categoriesError && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            {categoriesError}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 3,
          }}
        >
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

        {/* Categories Grid */}
        {!categoriesLoading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            {hierarchicalCategories.length > 0 ? (
              hierarchicalCategories.map(({ category, level, hasChildren }) => {
                const hasSubCategories = Array.isArray(category.subCategories) && category.subCategories.length > 0;
                const toggleTitle = hasSubCategories
                  ? 'Cannot toggle category with subcategories'
                  : category.isActive
                    ? 'Deactivate category'
                    : 'Activate category';
                const isExpanded = effectiveExpandedCategoryIds.has(category.id);

                return (
                  <Card
                    key={category.id}
                    sx={{
                      transition: 'box-shadow 0.3s',
                      '&:hover': { boxShadow: 3 },
                      ml: { xs: 0, md: Math.min(level, 4) * 2 },
                      borderLeft: level ? '3px solid rgba(25, 118, 210, 0.25)' : '3px solid transparent',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box style={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, pl: `${level * 16}px` }}>
                            {hasChildren ? (
                              <IconButton
                                size="small"
                                onClick={() => handleToggleExpand(category.id)}
                                title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                                sx={{ mr: 0.5 }}
                              >
                                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                              </IconButton>
                            ) : (
                              <Box sx={{ width: 32, height: 32, mr: 0.5 }} />
                            )}

                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {category.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#777', display: 'block', mb: 1 }}>
                            Level {level}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.5, mb: 1 }}>
                            {category.parentCategoryName ? `Parent: ${category.parentCategoryName}` : 'Root Category'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.5, mb: 1 }}>
                            Type: {category.categoryTypeName || category.categoryType}
                          </Typography>
                          <Chip label={category.isActive ? 'Active' : 'Inactive'} color={category.isActive ? 'success' : 'default'} size="small" />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleCategoryActive(category)}
                            color={category.isActive ? 'success' : 'default'}
                            title={toggleTitle}
                            disabled={loading || hasSubCategories}
                          >
                            {category.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                          </IconButton>
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
                            onClick={() => handleDeleteCategory(category)}
                            color="error"
                            title="Delete category"
                            disabled={loading || hasSubCategories}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Typography variant="body2" sx={{ color: '#999', gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                No categories yet. Create one to get started!
              </Typography>
            )}
          </Box>
        )}
      </TabPanel>

      {/* Tags Tab */}
      <TabPanel value={tabValue} index={1}>
        {/* Error Alert */}
        {tagsError && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            {tagsError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button size="small" variant="outlined" disabled={!tagHasPrevious || tagsLoading} onClick={() => setTagPage(tagPageNumber - 1)}>
              Previous
            </Button>

            <Typography variant="body2" sx={{ color: '#666' }}>
              Page {tagPageNumber} / {Math.max(tagTotalPages, 1)}
            </Typography>

            <Button size="small" variant="outlined" disabled={!tagHasNext || tagsLoading} onClick={() => setTagPage(tagPageNumber + 1)}>
              Next
            </Button>
          </Box>

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
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: '#e0f7fa',
                      margin: '0 auto 1rem',
                    }}
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {tag.tagName}
                  </Typography>

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
                    <IconButton size="small" onClick={() => handleDeleteTag(tag)} color="error">
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
        category={convertToModalCategory(editingCategory)}
        parentCategoryOptions={parentCategoryOptions}
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

      {/* Toggle Confirm Dialog */}
      <Dialog
        open={toggleConfirmOpen}
        onClose={() => {
          setToggleConfirmOpen(false);
          setToggleTarget(null);
        }}
      >
        <DialogTitle>Confirm Toggle Category Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {toggleTarget ? `Are you sure you want to ${toggleTarget.isActive ? 'deactivate' : 'activate'} "${toggleTarget.name}"?` : 'Are you sure you want to update this category status?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setToggleConfirmOpen(false);
              setToggleTarget(null);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmToggleCategoryActive} variant="contained" disabled={loading}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
      >
        <DialogTitle>Confirm Delete {deleteTarget?.type === 'category' ? 'Category' : 'Tag'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : 'Are you sure you want to delete this item?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setDeleteTarget(null);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
