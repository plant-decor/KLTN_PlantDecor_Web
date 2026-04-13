'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PlantTable from './PlantTable';
import PlantFormDialog from './PlantFormDialog';
import PlantViewDialog from './PlantViewDialog';
import type { Plant, PlantDetail, PlantFormData, ImageUploadData } from '@/types/store-management.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { useAdminPlants } from '@/lib/api/admin/useAdminPlants';
import { useAdminCategories } from '@/lib/api/admin/useAdminCategories';
import { useAdminTags } from '@/lib/api/admin/useAdminTags';
import { getAdminPlantGuideByPlantId } from '@/lib/api/adminPlantGuidesService';
import type { PlantGuideFormData } from '@/types/admin-plant-guide.types';

interface PlantTabProps {
  initialPlants?: Plant[];
}

interface OptionItem {
  id: number;
  name: string;
}

interface CategoryTreeNodeLike {
  id?: number | string;
  name?: string;
  subCategories?: CategoryTreeNodeLike[];
  children?: CategoryTreeNodeLike[];
}

const flattenCategoryTree = (nodes: CategoryTreeNodeLike[]): OptionItem[] => {
  const results: OptionItem[] = [];

  const visit = (items: CategoryTreeNodeLike[]) => {
    items.forEach((node) => {
      if (!node || typeof node !== 'object') {
        return;
      }

      const id = Number(node.id);
      if (Number.isFinite(id)) {
        results.push({ id, name: String(node.name ?? id) });
      }

      const children = Array.isArray(node.subCategories)
        ? node.subCategories
        : Array.isArray(node.children)
          ? node.children
          : [];

      if (children.length > 0) {
        visit(children);
      }
    });
  };

  visit(nodes);

  const deduped = new Map<number, OptionItem>();
  results.forEach((item) => deduped.set(item.id, item));

  return Array.from(deduped.values());
};

export default function PlantTab({}: PlantTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [editingData, setEditingData] = useState<PlantDetail | undefined>();
  const [editingPlantGuide, setEditingPlantGuide] = useState<PlantGuideFormData | undefined>();
  const [viewingData, setViewingData] = useState<PlantDetail | undefined>();
  const [toggleTarget, setToggleTarget] = useState<Plant | null>(null);

  const {
    plants,
    loading,
    saving,
    detailLoading,
    error,
    enumLoading,
    enumError,
    pagination,
    filters,
    enums,
    fetchPlants,
    fetchPlantById,
    savePlant,
    togglePlantActive,
    setKeyword,
    setPage,
    setPageSize,
    loadEnums,
    clearError,
  } = useAdminPlants();

  const {
    categoryTree,
    error: categoryError,
    fetchCategoryTree,
  } = useAdminCategories();

  const {
    tags,
    error: tagError,
    fetchTags,
  } = useAdminTags();

  useEffect(() => {
    void loadEnums();
    void fetchPlants({
      pagination: { pageNumber: 1, pageSize: 10 },
      keyword: '',
      sortBy: 'name',
      sortDirection: 'asc',
    });
    void fetchCategoryTree();
    void fetchTags({ pageNumber: 1, pageSize: 1000 });
  }, [fetchCategoryTree, fetchPlants, fetchTags, loadEnums]);

  const categoryOptions = useMemo(
    () => flattenCategoryTree(categoryTree as CategoryTreeNodeLike[]),
    [categoryTree]
  );

  const tagOptions = useMemo<OptionItem[]>(() => {
    return tags.map((tag) => ({ id: tag.id, name: tag.tagName }));
  }, [tags]);

  const handleCreate = useCallback(() => {
    setEditingData(undefined);
    setEditingPlantGuide(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback(async (plant: Plant) => {
    const detail = await fetchPlantById(plant.id);
    if (!detail) {
      toast.error('Failed to load plant detail');
      return;
    }

    const guideResponse = await getAdminPlantGuideByPlantId(plant.id, true);
    const guide = guideResponse.payload ?? guideResponse.data ?? null;

    setEditingData(detail);
    setEditingPlantGuide(guide ? {
      lightRequirement: guide.lightRequirementName || '',
      watering: guide.watering || '',
      fertilizing: guide.fertilizing || '',
      pruning: guide.pruning || '',
      temperature: guide.temperature || '',
      humidity: guide.humidity || '',
      soil: guide.soil || '',
      careNotes: guide.careNotes || '',
    } : undefined);
    setFormOpen(true);
  }, [fetchPlantById]);

  const handleView = useCallback(async (plant: Plant) => {
    const detail = await fetchPlantById(plant.id);
    if (!detail) {
      toast.error('Failed to load plant detail');
      return;
    }

    setViewingData(detail);
    setViewOpen(true);
  }, [fetchPlantById]);

  const handleToggle = useCallback((plant: Plant) => {
    setToggleTarget(plant);
    setToggleOpen(true);
  }, []);

  const handleSearchChange = useCallback((keyword: string) => {
    void setKeyword(keyword);
  }, [setKeyword]);

  const handlePageChange = useCallback((pageNumber: number) => {
    void setPage(pageNumber);
  }, [setPage]);

  const handleRowsPerPageChange = useCallback((rows: number) => {
    void setPageSize(rows);
  }, [setPageSize]);

  const confirmToggle = useCallback(async () => {
    if (!toggleTarget) {
      return;
    }

    const success = await togglePlantActive(toggleTarget.id);
    if (success) {
      toast.success(`Plant ${toggleTarget.isActive ? 'deactivated' : 'activated'} successfully`);
    } else {
      toast.error('Failed to update plant status');
    }

    setToggleOpen(false);
    setToggleTarget(null);
  }, [togglePlantActive, toggleTarget]);

  const handleFormSubmit = useCallback(async (data: PlantFormData, images: ImageUploadData[]) => {
    const success = await savePlant({
      formData: data,
      images,
      editingPlantId: editingData?.id,
      currentCategoryIds: editingData?.categories.map((item) => item.id) ?? [],
      currentTagIds: editingData?.tags.map((item) => item.id) ?? [],
    });

    if (success) {
      toast.success(editingData ? 'Plant updated successfully' : 'Plant created successfully');
      setFormOpen(false);
      setEditingData(undefined);
      setEditingPlantGuide(undefined);
      return;
    }

    toast.error('Failed to save plant');
  }, [editingData, savePlant]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          Plant list ({pagination.totalCount})
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate} sx={{ ...hoverLiftStyle }} className="bg-primary!">
          TẠO CÂY MỚI
        </Button>
      </Stack>

      {(error || enumError || categoryError || tagError) && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error || enumError || categoryError || tagError}
        </Alert>
      )}

      <PlantTable
        plants={plants}
        loading={loading}
        pageNumber={pagination.pageNumber}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        keyword={filters.keyword}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEdit}
        onToggleActive={handleToggle}
        onView={handleView}
      />

      <PlantFormDialog
        open={formOpen}
        editingData={editingData}
        plantGuideData={editingPlantGuide}
        categories={categoryOptions}
        tags={tagOptions}
        enums={enums}
        enumLoading={enumLoading}
        enumError={enumError}
        onClose={() => {
          setFormOpen(false);
          setEditingData(undefined);
          setEditingPlantGuide(undefined);
        }}
        onSubmit={handleFormSubmit}
        isLoading={saving || detailLoading}
      />

      <PlantViewDialog
        open={viewOpen}
        plant={viewingData}
        enums={enums}
        onClose={() => {
          setViewOpen(false);
          setViewingData(undefined);
        }}
      />

      <Dialog open={toggleOpen} onClose={() => setToggleOpen(false)}>
        <DialogTitle>Confirm status update</DialogTitle>
        <DialogContent>
          <Typography>
            {toggleTarget
              ? `Do you want to ${toggleTarget.isActive ? 'deactivate' : 'activate'} this plant?`
              : 'Do you want to update this plant status?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleOpen(false)}>Cancel</Button>
          <Button onClick={confirmToggle} color="primary" variant="contained" disabled={saving}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
