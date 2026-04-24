'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import type { Category, Tag } from '@/data/storeCatalogData';
import { useAdminCategories } from '@/lib/api/admin/useAdminCategories';
import { useAdminTags } from '@/lib/api/admin/useAdminTags';
import type { CategoryCreateUpdateRequest, CategoryResponse, CategoryTreeNode } from '@/lib/api/categoriesService';
import { getTagEnums, type TagCreateUpdateRequest, type TagEnumValue } from '@/lib/api/tagService';
import CategoryModal from '@/components/store-catalog/CategoryModal';
import TagModal from '@/components/store-catalog/TagModal';
import ManagementHeader from '@/components/layout/ManagementHeader';
import CategorySection, { type HierarchicalCategoryRow } from '@/components/admin/categories-tags/CategorySection';
import TagsSection from '@/components/admin/categories-tags/TagsSection';
import TabPanel from '@/components/admin/categories-tags/TabPanel';
import ConfirmActionDialog from '@/components/admin/categories-tags/ConfirmActionDialog';

type CategoryNode = CategoryResponse | CategoryTreeNode;

interface CategoryFormInput {
  name: string;
  parentCategoryId?: number | null;
  isActive?: boolean;
  categoryType?: number;
}

interface TagFormInput {
  tagName: string;
  tagType: number;
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const hasChildren = (node: CategoryNode): node is CategoryTreeNode & { children: CategoryTreeNode[] } => {
  return Array.isArray((node as CategoryTreeNode).children);
};

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
  const [tagTypeOptions, setTagTypeOptions] = useState<TagEnumValue[]>([]);
  const initialFetchDoneRef = useRef(false);

  // Use Categories Hook
  const {
    categoryTree,
    loading: categoriesLoading,
    error: categoriesError,
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
  const getNodeChildren = (node: CategoryNode): CategoryNode[] => {
    if (Array.isArray(node.subCategories)) {
      return node.subCategories;
    }

    if (hasChildren(node)) {
      return node.children;
    }

    return [];
  };

  const normalizeNode = (node: unknown): CategoryResponse => {
    if (!isObjectRecord(node)) {
      return {
        id: 0,
        name: '',
        isActive: false,
        categoryType: 0,
      };
    }

    return {
      id: Number(node.id),
      name: String(node.name ?? ''),
      parentCategoryId: (node.parentCategoryId as number | null | undefined) ?? null,
      isActive: Boolean(node.isActive),
      categoryType: Number(node.categoryType ?? 0),
      parentCategoryName: (node.parentCategoryName as string | null | undefined) ?? null,
      categoryTypeName: node.categoryTypeName as string | undefined,
      createdAt: node.createdAt as string | undefined,
      updatedAt: node.updatedAt as string | undefined,
      subCategories: Array.isArray(node.subCategories)
        ? (node.subCategories as CategoryResponse[])
        : undefined,
    };
  };

  const parentCategoryOptions = useMemo(() => {
    const flattenTree = (nodes: CategoryNode[]): CategoryResponse[] => {
      const flattened: CategoryResponse[] = [];

      nodes.forEach((node) => {
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

    const walk = (nodes: CategoryNode[], level: number) => {
      nodes.forEach((node) => {
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
    void fetchTags({ pageNumber: 1, pageSize: 20 });

    void (async () => {
      const response = await getTagEnums(false);
      const groups = response?.payload ?? response?.data ?? [];
      const tagTypeGroup = groups.find((group) => group.enumName === 'TagType');
      setTagTypeOptions(tagTypeGroup?.values ?? []);
    })();
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
  const handleSaveCategory = async (category: CategoryFormInput): Promise<boolean> => {
    if (editingCategory) {
      const updateData: CategoryCreateUpdateRequest = {
        name: category.name,
        parentCategoryId: category.parentCategoryId != null ? Number(category.parentCategoryId) : null,
        isActive: category.isActive !== undefined ? category.isActive : true,
        categoryType: category.categoryType || 0,
      };
      const updated = await updateCategoryItem(editingCategory.id, updateData);

      if (!updated) {
        return false;
      }
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
      return false;
    }

    setEditingCategory(undefined);
    return true;
  };

  const handleToggleCategoryActive = async (category: CategoryResponse) => {
    if (Array.isArray(category.subCategories) && category.subCategories.length > 0) {
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
    if (result!) {
      return;
    } 
    setToggleConfirmOpen(false);
    setToggleTarget(null);
  };

  const handleDeleteCategory = (category: CategoryResponse) => {
    if (Array.isArray(category.subCategories) && category.subCategories.length > 0) {
      return;
    }

    setDeleteTarget({ type: 'category', id: category.id, name: category.name });
    setDeleteConfirmOpen(true);
  };

  // ============ Tags Handlers ============
  const handleSaveTag = async (tag: TagFormInput): Promise<boolean> => {
    const payload: TagCreateUpdateRequest = {
      tagName: String(tag?.tagName ?? '').trim(),
      tagType: Number(tag?.tagType ?? 0),
    };

    if (editingTag) {
      const updated = await updateTagItem(editingTag.id, payload);

      if (!updated) {
        return false;
      }
      setEditingTag(undefined);
      return true;
    }

    const created = await addTag(payload);
    if (!created) {
      return false;
    }

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

    if (deleteTarget.type === 'category') {
      await deleteCategory(deleteTarget.id);
    } else if (deleteTarget.type === 'tag') {
      await deleteTag(deleteTarget.id);
    }
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  const clearError = () => {
    clearCategoriesError();
    clearTagsError();
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <ManagementHeader
          title="Categories & Tags"
          description="Manage store product categories and tags. You can create, edit, activate, or delete categories and tags here."
          entityLabel="Categories & Tags"
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} 
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
          '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
        }}
        >
          <Tab label="Categories" />
          <Tab label="Tags" />
        </Tabs>
      </Box>

      {/* Categories Tab */}
      <TabPanel value={tabValue} index={0}>
        <CategorySection
          categoriesError={categoriesError}
          categoriesLoading={categoriesLoading}
          loading={loading}
          hierarchicalCategories={hierarchicalCategories}
          expandedCategoryIds={effectiveExpandedCategoryIds}
          onClearError={clearError}
          onOpenCreate={() => {
            setEditingCategory(undefined);
            setCategoryModalOpen(true);
          }}
          onToggleExpand={handleToggleExpand}
          onToggleActive={handleToggleCategoryActive}
          onEdit={(category) => {
            setEditingCategory(category);
            setCategoryModalOpen(true);
          }}
          onDelete={handleDeleteCategory}
        />
      </TabPanel>

      {/* Tags Tab */}
      <TabPanel value={tabValue} index={1}>
        <TagsSection
          tagsError={tagsError}
          tagsLoading={tagsLoading}
          tags={tags}
          tagPageNumber={tagPageNumber}
          tagPageSize={tagPageSize}
          tagTotalPages={tagTotalPages}
          tagHasPrevious={tagHasPrevious}
          tagHasNext={tagHasNext}
          onClearError={clearError}
          onChangePageSize={setTagPageSize}
          onPrevPage={() => setTagPage(tagPageNumber - 1)}
          onNextPage={() => setTagPage(tagPageNumber + 1)}
          onOpenCreate={() => {
            setEditingTag(undefined);
            setTagModalOpen(true);
          }}
          onEditTag={(tag) => {
            setEditingTag(tag);
            setTagModalOpen(true);
          }}
          onDeleteTag={handleDeleteTag}
        />
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
        tagTypeOptions={tagTypeOptions}
      />

      <ConfirmActionDialog
        open={toggleConfirmOpen}
        title="Confirm Toggle Category Status"
        message={
          toggleTarget
            ? `Are you sure you want to ${toggleTarget.isActive ? 'deactivate' : 'activate'} "${toggleTarget.name}"?`
            : 'Are you sure you want to update this category status?'
        }
        confirmLabel="Confirm"
        loading={loading}
        onClose={() => {
          setToggleConfirmOpen(false);
          setToggleTarget(null);
        }}
        onConfirm={handleConfirmToggleCategoryActive}
      />

      <ConfirmActionDialog
        open={deleteConfirmOpen}
        title={`Confirm Delete ${deleteTarget?.type === 'category' ? 'Category' : 'Tag'}`}
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this item?'
        }
        confirmLabel="Delete"
        confirmColor="error"
        loading={loading}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

