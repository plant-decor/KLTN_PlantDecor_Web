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
import PlantComboTable from './PlantComboTable';
import PlantComboFormDialog from './PlantComboFormDialog';
import PlantComboViewDialog from './PlantComboViewDialog';
import type { PlantCombo, PlantComboFormData, ImageUploadData } from '@/types/store-management.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { useAdminPlantCombos } from '@/lib/api/admin/useAdminPlantCombos';
import { useAdminTags } from '@/lib/api/admin/useAdminTags';
import { getPlantComboNurseries, type ShopNurseryListItem } from '@/lib/api/shopPlantsService';

interface PlantComboTabProps {
  initialCombos?: PlantCombo[];
}

interface OptionItem {
  id: number;
  name: string;
}

export default function PlantComboTab({}: PlantComboTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingData, setEditingData] = useState<PlantCombo | undefined>();
  const [viewingData, setViewingData] = useState<PlantCombo | undefined>();
  const [viewNurseries, setViewNurseries] = useState<ShopNurseryListItem[]>([]);
  const [nurseriesLoading, setNurseriesLoading] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<PlantCombo | null>(null);

  const {
    combos,
    comboPlants,
    saving,
    plantsLoading,
    error,
    pagination,
    fetchCombos,
    fetchComboById,
    fetchComboPlants,
    savePlantCombo,
    toggleComboActive,
    setPage,
    setPageSize,
    clearError,
  } = useAdminPlantCombos();

  const {
    tags,
    error: tagError,
    fetchTags,
  } = useAdminTags();

  useEffect(() => {
    void fetchCombos({ pageNumber: 1, pageSize: 10 });
    void fetchComboPlants();
    void fetchTags({ pageNumber: 1, pageSize: 1000 });
  }, [fetchComboPlants, fetchCombos, fetchTags]);

  const tagOptions = useMemo<OptionItem[]>(() => {
    return tags.map((tag) => ({ id: tag.id, name: tag.tagName }));
  }, [tags]);

  const handleCreate = useCallback(() => {
    setEditingData(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback(async (combo: PlantCombo) => {
    const detail = await fetchComboById(combo.id);
    if (!detail) {
      return;
    }

    setEditingData(detail);
    setFormOpen(true);
  }, [fetchComboById]);

  const handleView = useCallback(async (combo: PlantCombo) => {
    setNurseriesLoading(true);

    try {
      const [detail, nurseriesResponse] = await Promise.all([
        fetchComboById(combo.id),
        getPlantComboNurseries(combo.id, false, true),
      ]);

      if (!detail) {
        return;
      }

      const nurseryPayload = nurseriesResponse.payload ?? nurseriesResponse.data ?? [];
      setViewingData(detail);
      setViewNurseries(nurseryPayload);
      setViewOpen(true);
    } catch {
      setViewingData(undefined);
      setViewNurseries([]);
    } finally {
      setNurseriesLoading(false);
    }
  }, [fetchComboById]);

  const handleToggle = useCallback((combo: PlantCombo) => {
    setToggleTarget(combo);
    setToggleOpen(true);
  }, []);

  const confirmToggle = useCallback(async () => {
    if (!toggleTarget) {
      return;
    }

    await toggleComboActive(toggleTarget.id);

    setToggleOpen(false);
    setToggleTarget(null);
  }, [toggleComboActive, toggleTarget]);

  const handleFormSubmit = useCallback(async (data: PlantComboFormData, images: ImageUploadData[]) => {
    const success = await savePlantCombo({
      formData: data,
      images,
      editingCombo: editingData,
    });

    if (success) {
      setFormOpen(false);
      setEditingData(undefined);
      return;
    }
  }, [editingData, savePlantCombo]);

  const handlePageChange = useCallback((pageNumber: number) => {
    void setPage(pageNumber);
  }, [setPage]);

  const handleRowsPerPageChange = useCallback((rows: number) => {
    void setPageSize(rows);
  }, [setPageSize]);

  const handlePlantSearch = useCallback((keyword: string) => {
    void fetchComboPlants(keyword);
  }, [fetchComboPlants]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          Danh sách combo ({pagination.totalCount})
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate} sx={{ ...hoverLiftStyle }} className="bg-primary!">
          Thêm combo mới
        </Button>
      </Stack>

      {(error || tagError) && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error || tagError}
        </Alert>
      )}

      <PlantComboTable
        combos={combos}
        pageNumber={pagination.pageNumber}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEdit}
        onToggleActive={handleToggle}
        onView={handleView}
      />

      <PlantComboFormDialog
        open={formOpen}
        editingData={editingData}
        plants={comboPlants}
        plantsLoading={plantsLoading}
        tags={tagOptions}
        onPlantSearch={handlePlantSearch}
        onClose={() => {
          setFormOpen(false);
          setEditingData(undefined);
        }}
        onSubmit={handleFormSubmit}
      />

      <PlantComboViewDialog
        open={viewOpen}
        combo={viewingData}
        nurseries={viewNurseries}
        nurseriesLoading={nurseriesLoading}
        onClose={() => {
          setViewOpen(false);
          setViewingData(undefined);
          setViewNurseries([]);
        }}
      />

      <Dialog open={toggleOpen} onClose={() => setToggleOpen(false)}>
        <DialogTitle>Xác nhận cập nhật trạng thái</DialogTitle>
        <DialogContent>
          <Typography>
            {toggleTarget
              ? `Bạn có chắc muốn ${toggleTarget.isActive ? 'vô hiệu' : 'kích hoạt'} combo này?`
              : 'Bạn có chắc muốn cập nhật trạng thái combo này?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleOpen(false)}>Hủy</Button>
          <Button onClick={confirmToggle} color="primary" variant="contained" disabled={saving}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
