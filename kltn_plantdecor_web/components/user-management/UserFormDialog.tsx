'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { SampleUser } from '@/data/sampledata';
import type { UserRole } from '@/lib/constants/header';
import { ROLE_OPTIONS, STATUS_OPTIONS } from '@/lib/user-management/constants';
import type { UserFormData, ValidationErrors } from '@/lib/user-management/validation';
import { DEFAULT_FORM_DATA } from '@/lib/user-management/validation';

interface UserFormDialogProps {
  open: boolean;
  editingUser: SampleUser | null;
  formData: UserFormData;
  errors: ValidationErrors;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (field: keyof UserFormData, value: any) => void;
}

export default function UserFormDialog({
  open,
  editingUser,
  formData,
  errors,
  onClose,
  onSave,
  onFormChange,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingUser ? 'Edit User' : 'Create New User'}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Username"
            value={formData.userName}
            onChange={(e) => onFormChange('userName', e.target.value)}
            error={!!errors.userName}
            helperText={errors.userName}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => onFormChange('phoneNumber', e.target.value)}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => onFormChange('password', e.target.value)}
            error={!!errors.password}
            helperText={
              errors.password || (editingUser ? '(Leave blank to keep current)' : '')
            }
            placeholder={editingUser ? 'Leave blank to keep password' : 'Enter password'}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => onFormChange('role', e.target.value as UserRole)}
            >
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) =>
                onFormChange('status', e.target.value as 'active' | 'inactive')
              }
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained">
          {editingUser ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
