'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Add } from '@mui/icons-material';
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
import { toast } from 'react-toastify';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { useAdminMaterials } from '@/lib/api/admin/useAdminMaterials';
import { useAdminTags } from '@/lib/api/admin/useAdminTags';
import type { ImageUploadData, Material, MaterialDetail, MaterialFormData } from '@/types/store-management.types';
import MaterialFormDialog from './MaterialFormDialog';
import MaterialTable from './MaterialTable';
import { type OptionItem } from './MaterialTab.shared';
import MaterialViewDialog from './MaterialViewDialog';
import { getCategoriesByType } from '@/lib/api/categoriesService';

export default function AdminMaterialMode() {
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [editingData, setEditingData] = useState<MaterialDetail | undefined>();
  const [viewingData, setViewingData] = useState<MaterialDetail | undefined>();
  const [toggleTarget, setToggleTarget] = useState<Material | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<OptionItem[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const {
    materials,
    saving,
    detailLoading,
    error,
    pagination,
    fetchMaterials,
    fetchMaterialById,
    saveMaterial,
    toggleMaterialActive,
    setPage,
    setPageSize,
    clearError,
  } = useAdminMaterials();

  const {
    tags,
    error: tagError,
    fetchTags,
  } = useAdminTags();

  useEffect(() => {
    void fetchMaterials({ pagination: { pageNumber: 1, pageSize: 10 } });
    void fetchTags({ pageNumber: 1, pageSize: 1000 });
  }, [fetchMaterials, fetchTags]);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      if (mounted) {
        setCategoryError(null);
      }
      try {
        const response = await getCategoriesByType({ categoryType: 2, activeOnly: true }, true);
        const payload = response.payload ?? response.data ?? [];
        const options = payload
          .map((item) => ({ id: item.id, name: item.name }))
          .filter((item) => Number.isFinite(item.id) && Boolean(item.name));
        if (mounted) {
          setCategoryOptions(options);
        }
      } catch {
        if (mounted) {
          setCategoryError('Failed to load categories.');
          setCategoryOptions([]);
        }
      }
    };

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const tagOptions = useMemo<OptionItem[]>(() => {
    return tags.map((tag) => ({ id: tag.id, name: tag.tagName }));
  }, [tags]);

  const handleOpenCreate = useCallback(() => {
    setEditingData(undefined);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback(async (material: Material) => {
    const detail = await fetchMaterialById(material.id);
    if (!detail) {
      toast.error('Failed to load material detail');
      return;
    }

    setEditingData(detail);
    setFormOpen(true);
  }, [fetchMaterialById]);

  const handleOpenView = useCallback(async (material: Material) => {
    const detail = await fetchMaterialById(material.id);
    if (!detail) {
      toast.error('Failed to load material detail');
      return;
    }

    setViewingData(detail);
    setViewOpen(true);
  }, [fetchMaterialById]);

  const handleOpenToggle = useCallback((material: Material) => {
    setToggleTarget(material);
    setToggleOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingData(undefined);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
    setViewingData(undefined);
  }, []);

  const handleCloseToggle = useCallback(() => {
    setToggleOpen(false);
    setToggleTarget(null);
  }, []);

  const handlePageChange = useCallback((pageNumber: number) => {
    void setPage(pageNumber);
  }, [setPage]);

  const handleRowsPerPageChange = useCallback((rows: number) => {
    void setPageSize(rows);
  }, [setPageSize]);

  const handleSubmitToggle = useCallback(async () => {
    if (!toggleTarget || saving) {
      return;
    }

    const success = await toggleMaterialActive(toggleTarget.id);
    if (success) {
      toast.success(`Material ${toggleTarget.isActive ? 'deactivated' : 'activated'} successfully`);
    } else {
      toast.error('Failed to update material status');
    }

    handleCloseToggle();
  }, [handleCloseToggle, saving, toggleMaterialActive, toggleTarget]);

  const handleSubmitForm = async (data: MaterialFormData, images: ImageUploadData[]) => {
    const success = await saveMaterial({
      formData: data,
      images,
      editingMaterialId: editingData?.id,
      currentCategoryIds: editingData?.categories.map((item) => item.id) ?? [],
      currentTagIds: editingData?.tags.map((item) => item.id) ?? [],
    });

    if (success) {
      if (viewOpen && viewingData?.id) {
        const refreshed = await fetchMaterialById(viewingData.id);
        if (refreshed) {
          setViewingData(refreshed);
        }
      }
      toast.success(editingData ? 'Material updated successfully' : 'Material created successfully');
      handleCloseForm();
      return;
    }

    toast.error('Failed to save material');
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          Material list ({pagination.totalCount})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
          sx={{ ...hoverLiftStyle }}
          className="bg-primary!"
        >
          Create material
        </Button>
      </Stack>

      {(error || categoryError || tagError) && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error || categoryError || tagError}
        </Alert>
      )}

      <MaterialTable
        materials={materials}
        pageNumber={pagination.pageNumber}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleOpenEdit}
        onToggleActive={handleOpenToggle}
        onView={handleOpenView}
      />

      <MaterialFormDialog
        open={formOpen}
        editingData={editingData}
        categories={categoryOptions}
        tags={tagOptions}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        isLoading={saving || detailLoading}
      />

      <MaterialViewDialog
        open={viewOpen}
        material={viewingData}
        onClose={handleCloseView}
      />

      <Dialog open={toggleOpen} onClose={handleCloseToggle}>
        <DialogTitle>Confirm status update</DialogTitle>
        <DialogContent>
          <Typography>
            {toggleTarget
              ? `Do you want to ${toggleTarget.isActive ? 'deactivate' : 'activate'} this material?`
              : 'Do you want to update this material status?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseToggle} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmitToggle} color="primary" variant="contained" disabled={saving}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
