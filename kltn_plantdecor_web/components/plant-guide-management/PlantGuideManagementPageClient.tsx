'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import { toast } from 'react-toastify';
import ManagementHeader from '@/components/layout/ManagementHeader';
import PlantGuideTable from './PlantGuideTable';
import PlantGuideFormDialog from './PlantGuideFormDialog';
import PlantGuideDetailDialog from './PlantGuideDetailDialog';
import PlantGuideDeleteDialog from './PlantGuideDeleteDialog';
import { useAdminPlantGuides } from '@/lib/api/admin/useAdminPlantGuides';
import type { AdminPlantGuideDetail, AdminPlantGuideFormData } from '@/types/admin-plant-guide.types';
import { searchAdminPlants } from '@/lib/api/adminPlantsService';
import type { Plant } from '@/types/store-management.types';

export default function PlantGuideManagementPageClient() {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingData, setEditingData] = useState<AdminPlantGuideDetail | undefined>();
  const [viewingData, setViewingData] = useState<AdminPlantGuideDetail | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<AdminPlantGuideDetail | null>(null);
  const [plantOptions, setPlantOptions] = useState<Plant[]>([]);
  const [plantsLoading, setPlantsLoading] = useState(false);

  const {
    plantGuides,
    loading,
    saving,
    detailLoading,
    error,
    detailError,
    enumLoading,
    enumError,
    pagination,
    lightRequirementOptions,
    fetchPlantGuides,
    fetchPlantGuideById,
    savePlantGuide,
    deletePlantGuide,
    setPage,
    setPageSize,
    loadLightRequirementOptions,
    clearError,
    clearDetailError,
  } = useAdminPlantGuides();

  useEffect(() => {
    void loadLightRequirementOptions();
    void fetchPlantGuides({
      pagination: { pageNumber: 1, pageSize: 10 },
    });
  }, [fetchPlantGuides, loadLightRequirementOptions]);

  const handleCreate = useCallback(() => {
    setEditingData(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback(async (guide: AdminPlantGuideDetail) => {
    const detail = await fetchPlantGuideById(guide.id);
    if (!detail) {
      toast.error('Failed to load Plant Guide details');
      return;
    }

    setEditingData(detail);
    setFormOpen(true);
  }, [fetchPlantGuideById]);

  const handleView = useCallback(async (guide: AdminPlantGuideDetail) => {
    const detail = await fetchPlantGuideById(guide.id);
    if (!detail) {
      toast.error('Failed to load Plant Guide details');
      return;
    }

    setViewingData(detail);
    setDetailOpen(true);
  }, [fetchPlantGuideById]);

  const handleDelete = useCallback((guide: AdminPlantGuideDetail) => {
    setDeleteTarget(guide);
    setDeleteOpen(true);
  }, []);

  const handlePageChange = useCallback((pageNumber: number) => {
    void setPage(pageNumber);
  }, [setPage]);

  const handleRowsPerPageChange = useCallback((rows: number) => {
    void setPageSize(rows);
  }, [setPageSize]);

  const handleFormSubmit = useCallback(async (formData: AdminPlantGuideFormData) => {
    const success = await savePlantGuide({
      formData,
      editingId: editingData?.id,
    });

    if (success) {
      // toast.success(editingData ? 'Plant Guide updated successfully' : 'Plant Guide created successfully');
      setFormOpen(false);
      setEditingData(undefined);
      return;
    }

    // toast.error('Failed to save Plant Guide');
  }, [editingData, savePlantGuide]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    const success = await deletePlantGuide(deleteTarget.id);
    if (success) {
      toast.success('Plant Guide deleted successfully');
      setDeleteOpen(false);
      setDeleteTarget(null);
      return;
    }

    toast.error('Failed to delete Plant Guide');
  }, [deletePlantGuide, deleteTarget]);

  const handlePlantSearch = useCallback(async (keyword: string) => {
    setPlantsLoading(true);
    try {
      const response = await searchAdminPlants(
        {
          pagination: { pageNumber: 1, pageSize: 20 },
          keyword,
          sortBy: 'CreatedAt',
          sortDirection: 'Desc',
        },
        false
      );

      const payload = response.payload ?? response.data;
      setPlantOptions(payload?.items ?? []);
    } catch {
      setPlantOptions([]);
    } finally {
      setPlantsLoading(false);
    }
  }, []);

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
      <ManagementHeader
        title="Plant Care Guide Management"
        description="Manage the list of plant care recommendations created by admins."
        entityLabel="Plant Guide"
        count={pagination.totalCount}
        actionLabel="Create New Guide"
        onAction={handleCreate}
      />

      {(error || enumError || detailError) && (
        <Alert severity="error" onClose={() => { clearError(); clearDetailError(); }} sx={{ mb: 2 }}>
          {error || enumError || detailError}
        </Alert>
      )}

      <PlantGuideTable
        plantGuides={plantGuides}
        loading={loading}
        pageNumber={pagination.pageNumber}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PlantGuideFormDialog
        open={formOpen}
        editingData={editingData}
        plants={plantOptions}
        plantsLoading={plantsLoading}
        onPlantSearch={handlePlantSearch}
        lightRequirementOptions={lightRequirementOptions}
        enumLoading={enumLoading}
        enumError={enumError}
        onClose={() => {
          setFormOpen(false);
          setEditingData(undefined);
        }}
        onSubmit={handleFormSubmit}
        isLoading={saving}
      />

      <PlantGuideDetailDialog
        open={detailOpen}
        guide={viewingData}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false);
          setViewingData(undefined);
        }}
      />

      <PlantGuideDeleteDialog
        open={deleteOpen}
        guide={deleteTarget}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        isLoading={saving}
      />
    </Box>
  );
}
