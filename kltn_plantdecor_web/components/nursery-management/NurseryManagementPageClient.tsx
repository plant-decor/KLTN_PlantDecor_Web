'use client';

import React, { useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
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
    saveNursery,
    toggleNurseryActive,
    setPage,
    setPageSize,
    clearError,
  } = useAdminNurseries();

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
      <ManagementHeader
        title="Nursery Management"
        description="Manage nursery data, including creating, editing, and changing nursery activity status."
        entityLabel="nursery"
        count={pagination.totalCount}
        actionLabel="Create New Nursery"
        onAction={handleCreate}
      />

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
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
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            {toggleTarget
              ? `Do you want to ${toggleTarget.isActive ? 'deactivate' : 'activate'} this nursery?`
              : 'Do you want to change this nursery status?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleOpen(false)}>Cancel</Button>
          <Button onClick={confirmToggle} variant="contained" disabled={saving} className="bg-primary!">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
