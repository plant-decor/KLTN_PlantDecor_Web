'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createConsultantAction, createManagerAction } from '@/app/actions/authenticationActions';
import { searchAdminNurseries } from '@/lib/api/adminNurseriesService';
import type { AdminNursery } from '@/types/admin-nursery.types';

type StaffTab = 'consultant' | 'manager';

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName: string;
  phoneNumber: string;
}

const defaultValues: FormValues = {
  email: '',
  password: '',
  confirmPassword: '',
  username: '',
  fullName: '',
  phoneNumber: '',
};

const NURSERY_PAGE_SIZE = 100;

interface CreateConsultantManagerDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}

export default function CreateConsultantManagerDialog({
  open,
  onClose,
  onCreated,
}: CreateConsultantManagerDialogProps) {
  const [tab, setTab] = useState<StaffTab>('consultant');
  const [nurseries, setNurseries] = useState<AdminNursery[]>([]);
  const [nurseriesLoading, setNurseriesLoading] = useState(false);
  const [selectedNursery, setSelectedNursery] = useState<AdminNursery | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues,
    mode: 'onTouched',
  });

  const password = watch('password');

  const loadNurseries = useCallback(async () => {
    setNurseriesLoading(true);
    try {
      const response = await searchAdminNurseries(
        { pagination: { pageNumber: 1, pageSize: NURSERY_PAGE_SIZE } },
        false
      );
      const payload = response.payload ?? response.data;
      setNurseries(payload?.items ?? []);
    } catch {
      toast.error('Failed to load nurseries');
      setNurseries([]);
    } finally {
      setNurseriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    void loadNurseries();
  }, [open, loadNurseries]);

  const handleDialogClose = () => {
    reset(defaultValues);
    setTab('consultant');
    setSelectedNursery(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      if (tab === 'consultant') {
        const result = await createConsultantAction({
          email: data.email.trim(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          username: data.username.trim(),
          fullName: data.fullName.trim(),
          phoneNumber: data.phoneNumber.trim(),
        });
        if (result.success) {
          toast.success(result.message);
          handleDialogClose();
          await onCreated();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createManagerAction({
          email: data.email.trim(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          username: data.username.trim(),
          fullName: data.fullName.trim(),
          phoneNumber: data.phoneNumber.trim(),
          nurseryId: selectedNursery?.id,
        });
        if (result.success) {
          toast.success(result.message);
          handleDialogClose();
          await onCreated();
        } else {
          toast.error(result.message);
        }
      }
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create consultant / manager
          <IconButton size="small" onClick={handleDialogClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v as StaffTab)}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Consultant" value="consultant" />
            <Tab label="Manager" value="manager" />
          </Tabs>

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <TextField
              fullWidth
              label="Username"
              error={!!errors.username}
              helperText={errors.username?.message}
              {...register('username', { required: 'Username is required' })}
            />
            <TextField
              fullWidth
              label="Full name"
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              {...register('fullName', { required: 'Full name is required' })}
            />
            <TextField
              fullWidth
              label="Phone number"
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message}
              {...register('phoneNumber', { required: 'Phone number is required' })}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            <TextField
              fullWidth
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />

            {tab === 'manager' && (
              <Autocomplete
                options={nurseries}
                loading={nurseriesLoading}
                value={selectedNursery}
                onChange={(_, value) => setSelectedNursery(value)}
                getOptionLabel={(opt) => `${opt.name} (#${opt.id})`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Nursery (optional)"
                    placeholder="Leave empty if not assigning"
                  />
                )}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDialogClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting} className="bg-primary!">
            {submitting ? 'Creating…' : 'Create account'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
