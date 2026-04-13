'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import NurseryTable from './NurseryTable';
import NurseryFormDialog from './NurseryFormDialog';
import { useAdminNurseries } from '@/lib/api/admin/useAdminNurseries';
import type { AdminNursery, AdminNurseryFormData } from '@/types/admin-nursery.types';
import ManagementHeader from '../layout/ManagementHeader';

export default function NurseryManagementPageClient() {
  const [formOpen, setFormOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [editingData, setEditingData] = useState<AdminNursery | undefined>();
  const [toggleTarget, setToggleTarget] = useState<AdminNursery | null>(null);

  const {
    nurseries,
    loading,
    saving,
    error,
    pagination,
    fetchNurseries,
    saveNursery,
    toggleNurseryActive,
    setPage,
    setPageSize,
    clearError,
  } = useAdminNurseries();

  useEffect(() => {
    void fetchNurseries({
      pagination: { pageNumber: 1, pageSize: 10 },
    });
  }, [fetchNurseries]);

  const handleCreate = useCallback(() => {
    setEditingData(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((nursery: AdminNursery) => {
    setEditingData(nursery);
    setFormOpen(true);
  }, []);

  const handleToggle = useCallback((nursery: AdminNursery) => {
    setToggleTarget(nursery);
    setToggleOpen(true);
  }, []);

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      void setPage(pageNumber);
    },
    [setPage]
  );

  const handleRowsPerPageChange = useCallback(
    (rows: number) => {
      void setPageSize(rows);
    },
    [setPageSize]
  );

  const confirmToggle = useCallback(async () => {
    if (!toggleTarget) {
      return;
    }

    const success = await toggleNurseryActive(toggleTarget.id);
    if (success) {
      toast.success(`Nursery ${toggleTarget.isActive ? 'deactivated' : 'activated'} successfully`);
    } else {
      toast.error('Failed to update nursery status');
    }

    setToggleOpen(false);
    setToggleTarget(null);
  }, [toggleNurseryActive, toggleTarget]);

  const handleFormSubmit = useCallback(
    async (formData: AdminNurseryFormData) => {
      const success = await saveNursery({
        formData,
        editingNurseryId: editingData?.id,
      });

      if (success) {
        toast.success(editingData ? 'Nursery updated successfully' : 'Nursery created successfully');
        setFormOpen(false);
        setEditingData(undefined);
        return;
      }

      toast.error('Failed to save nursery');
    },
    [editingData, saveNursery]
  );

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
      {/* Header */}
      <ManagementHeader
        title="Quản Lý Vựa Cây"
        description="Quản lý dữ liệu vựa cây, bao gồm tạo mới, chỉnh sửa và thay đổi trạng thái hoạt động của vựa."
        entityLabel="vựa"
        count={pagination.totalCount}
        actionLabel="Tạo vựa mới"
        onAction={handleCreate}
      />

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
          {error}
        </Alert>
      )}

      <NurseryTable
        nurseries={nurseries}
        loading={loading}
        pageNumber={pagination.pageNumber}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEdit}
        onToggleActive={handleToggle}
      />

      <NurseryFormDialog
        open={formOpen}
        editingData={editingData}
        onClose={() => {
          setFormOpen(false);
          setEditingData(undefined);
        }}
        onSubmit={handleFormSubmit}
        isLoading={saving}
      />

      <Dialog open={toggleOpen} onClose={() => setToggleOpen(false)}>
        <DialogTitle>Xác nhận đổi trạng thái</DialogTitle>
        <DialogContent>
          <Typography>
            {toggleTarget
              ? `Bạn có muốn ${toggleTarget.isActive ? 'ngưng hoạt động' : 'kích hoạt'} vựa này không?`
              : 'Bạn có muốn đổi trạng thái vựa này không?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleOpen(false)}>Hủy</Button>
          <Button onClick={confirmToggle} variant="contained" disabled={saving} className="bg-primary!">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
