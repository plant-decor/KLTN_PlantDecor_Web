'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Alert,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { CreateStaffRequest } from '@/types/auth.types';
import { createNurseryStaff } from '@/lib/api/managerStoreUsersService';
import { isValidPhoneNumber10Digits } from '@/lib/utils/phoneNumber';

interface CreateStaffFormDialogProps {
  open: boolean;
  onClose: () => void;
  onStaffCreated: () => void;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const defaultValues: CreateStaffRequest = {
  email: '',
  password: '',
  confirmPassword: '',
  username: '',
  fullName: '',
  phoneNumber: '',
};

export default function CreateStaffFormDialog({
  open,
  onClose,
  onStaffCreated,
}: CreateStaffFormDialogProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateStaffRequest>({
    defaultValues,
    mode: 'onChange',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: CreateStaffRequest) => {
    setLoading(true);
    setError(null);

    try {
      await createNurseryStaff({
        ...data,
        phoneNumber: data.phoneNumber.trim(),
      }, false);
      reset(defaultValues);
      onStaffCreated();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Can not create staff. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset(defaultValues);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Staff</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    required
                    fullWidth
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="username"
                control={control}
                rules={{
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters long',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    required
                    fullWidth
                    error={Boolean(errors.username)}
                    helperText={errors.username?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="fullName"
                control={control}
                rules={{ required: 'Full name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    required
                    fullWidth
                    error={Boolean(errors.fullName)}
                    helperText={errors.fullName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: 'Phone number is required',
                  validate: (value) =>
                    isValidPhoneNumber10Digits(value) || 'Invalid phone number',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="text"
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      maxLength: 10,
                    }}
                    label="Phone Number"
                    required
                    fullWidth
                    error={Boolean(errors.phoneNumber)}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: 'Password is required',
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    required
                    fullWidth
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: 'Confirm password is required',
                  validate: (value, formValues) =>
                    value === formValues.password || 'Passwords do not match',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm Password"
                    type="password"
                    required
                    fullWidth
                    error={Boolean(errors.confirmPassword)}
                    helperText={errors.confirmPassword?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
          className="bg-primary!"
        >
          {loading ? 'Creating...' : 'Create Staff'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
