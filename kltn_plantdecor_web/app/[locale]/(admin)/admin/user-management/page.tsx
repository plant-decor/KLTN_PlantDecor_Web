'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import type { UserRole } from '@/lib/constants/header';
import {
  formatStatusForApi,
  formatUserRoleForApi,
  mapApiUserStatusToUi,
} from '@/lib/user-management/helpers';
import UserFilterPanel from '@/components/user-management/UserFilterPanel';
import UserDetailDialog from '@/components/user-management/UserDetailDialog';
import UserTable from '@/components/user-management/UserTable';
import CreateConsultantManagerDialog from '@/components/user-management/CreateConsultantManagerDialog';
import ManagementHeader from '@/components/layout/ManagementHeader';
import { useAdminUsers } from '@/lib/api/admin/useAdminUsers';
import type { AdminUser } from '@/types/admin-user.types';

const SEARCH_DEBOUNCE_MS = 500;

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<AdminUser | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    users,
    loading,
    saving,
    error,
    pagination,
    userDetail,
    detailLoading,
    fetchUsers,
    setPage,
    setPageSize,
    loadUserDetail,
    clearUserDetail,
    toggleUserActive,
    clearError,
  } = useAdminUsers();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    void fetchUsers({
      pagination: { pageNumber: 1, pageSize: pagination.pageSize },
      keyword: debouncedSearchTerm.trim() || undefined,
      role: roleFilter ? formatUserRoleForApi(roleFilter) : undefined,
      status: statusFilter ? formatStatusForApi(statusFilter) : undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ refetch khi đổi filter/tìm kiếm (đã debounce); dùng pagination.pageSize mà không liệt kê pagination để tránh refetch khi đổi trang
  }, [debouncedSearchTerm, roleFilter, statusFilter, fetchUsers]);

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

  const handleView = useCallback(
    async (user: AdminUser) => {
      setDetailUserId(user.id);
      setDetailOpen(true);
      await loadUserDetail(user.id);
    },
    [loadUserDetail]
  );

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setDetailUserId(null);
    clearUserDetail();
  }, [clearUserDetail]);

  const handleToggleClick = useCallback((user: AdminUser) => {
    setToggleTarget(user);
    setToggleOpen(true);
  }, []);

  const confirmToggle = useCallback(async () => {
    if (!toggleTarget) {
      return;
    }

    const success = await toggleUserActive(toggleTarget.id);
    if (success) {
      const wasActive = mapApiUserStatusToUi(toggleTarget.status) === 'active';
      toast.success(`User ${wasActive ? 'deactivated' : 'activated'} successfully`);
      if (detailOpen && detailUserId === toggleTarget.id) {
        await loadUserDetail(toggleTarget.id);
      }
    } else {
      toast.error('Failed to update user status');
    }

    setToggleOpen(false);
    setToggleTarget(null);
  }, [toggleUserActive, toggleTarget, detailOpen, detailUserId, loadUserDetail]);

  const handleDetailToggle = useCallback(() => {
    if (userDetail) {
      setToggleTarget(userDetail);
      setToggleOpen(true);
    }
  }, [userDetail]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleRoleFilterChange = (value: UserRole | '') => {
    setRoleFilter(value);
  };

  const handleStatusFilterChange = (value: 'active' | 'inactive' | '') => {
    setStatusFilter(value);
  };

  const handleStaffCreated = useCallback(async () => {
    await fetchUsers({
      pagination: { pageNumber: 1, pageSize: pagination.pageSize },
      keyword: debouncedSearchTerm.trim() || undefined,
      role: roleFilter ? formatUserRoleForApi(roleFilter) : undefined,
      status: statusFilter ? formatStatusForApi(statusFilter) : undefined,
    });
  }, [
    fetchUsers,
    pagination.pageSize,
    debouncedSearchTerm,
    roleFilter,
    statusFilter,
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <ManagementHeader
        title="User Management"
        description="Search users, view details, and activate or deactivate accounts."
        entityLabel="user"
        count={pagination.totalCount}
        actionLabel="Create consultant / manager"
        onAction={() => setCreateDialogOpen(true)}
      />

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <UserFilterPanel
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onRoleFilterChange={handleRoleFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <UserTable
        users={users}
        loading={loading}
        pageNumber={pagination.pageNumber}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onView={handleView}
        onToggleClick={handleToggleClick}
      />

      <UserDetailDialog
        open={detailOpen}
        user={userDetail}
        loading={detailLoading}
        saving={saving}
        onClose={handleCloseDetail}
        onToggleActive={handleDetailToggle}
      />

      <CreateConsultantManagerDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={handleStaffCreated}
      />

      <Dialog open={toggleOpen} onClose={() => setToggleOpen(false)}>
        <DialogTitle>Confirm status change</DialogTitle>
        <DialogContent>
          <Typography>
            {toggleTarget
              ? `Do you want to ${
                  mapApiUserStatusToUi(toggleTarget.status) === 'active' ? 'deactivate' : 'activate'
                } this user?`
              : 'Do you want to change this user status?'}
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
