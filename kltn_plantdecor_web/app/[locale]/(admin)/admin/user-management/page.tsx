'use client';

import { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { SAMPLE_USERS } from '@/data/sampledata';
import type { SampleUser } from '@/data/sampledata';
import type { UserRole } from '@/lib/constants/header';
import {
  DEFAULT_FORM_DATA,
  validateUserForm,
  type UserFormData,
  type ValidationErrors,
} from '@/lib/user-management/validation';
import {
  getStatsData,
  generateNextUserId,
} from '@/lib/user-management/helpers';
import { DEFAULT_ROWS_PER_PAGE } from '@/lib/user-management/constants';
import UserStatsCard from '@/components/user-management/UserStatsCard';
import UserFilterPanel from '@/components/user-management/UserFilterPanel';
import UserFormDialog from '@/components/user-management/UserFormDialog';
import DeleteConfirmationDialog from '@/components/user-management/DeleteConfirmationDialog';
import UserTable from '@/components/user-management/UserTable';
import UserPageHeader from '@/components/user-management/UserPageHeader';
import MessageAlert from '@/components/user-management/MessageAlert';

export default function UserManagementPage() {
  // State
  const [users, setUsers] = useState<SampleUser[]>(SAMPLE_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<SampleUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<SampleUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.includes(searchTerm);

      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Dialog handlers
  const handleOpenDialog = (user?: SampleUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        role: user.role,
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: user.password,
        userName: user.userName,
        avatarUrl: user.avatarUrl,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setErrors({});
    setMessage(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
  };

  const handleSave = () => {
    const validationErrors = validateUserForm(formData, !!editingUser);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const now = new Date().toISOString();

    if (editingUser) {
      // Update - only update password if provided
      const updatedUser: SampleUser = {
        ...editingUser,
        ...formData,
        updateAt: now,
      };
      // Only update password if it's not empty (for edit mode)
      if (!formData.password) {
        updatedUser.password = editingUser.password;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === editingUser.id ? updatedUser : user))
      );
      setMessage({ type: 'success', text: 'User updated successfully!' });
    } else {
      // Create
      const newUser: SampleUser = {
        ...formData,
        id: generateNextUserId(users),
        createAt: now,
        updateAt: now,
      };
      setUsers((prevUsers) => [...prevUsers, newUser]);
      setMessage({ type: 'success', text: 'User created successfully!' });
    }

    setTimeout(() => {
      handleCloseDialog();
      setMessage(null);
    }, 1500);
  };

  const handleDeleteClick = (user: SampleUser) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id));
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      setMessage({ type: 'success', text: 'User deleted successfully!' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFormChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleRoleFilterChange = (value: UserRole | '') => {
    setRoleFilter(value);
    setPage(0);
  };

  const handleStatusFilterChange = (value: 'active' | 'inactive' | '') => {
    setStatusFilter(value);
    setPage(0);
  };

  // Get stats
  const stats = getStatsData(users);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <UserPageHeader onAddNewClick={() => handleOpenDialog()} />

      {/* Message Alert */}
      <MessageAlert message={message} onClose={() => setMessage(null)} />

      {/* Stats Cards */}
      <UserStatsCard stats={stats} />

      {/* Filters */}
      <UserFilterPanel
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onRoleFilterChange={handleRoleFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {/* Table */}
      <UserTable
        users={filteredUsers}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEdit={handleOpenDialog}
        onDelete={handleDeleteClick}
      />

      {/* Add/Edit Dialog */}
      <UserFormDialog
        open={openDialog}
        editingUser={editingUser}
        formData={formData}
        errors={errors}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onFormChange={handleFormChange}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openDeleteDialog}
        user={userToDelete}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}