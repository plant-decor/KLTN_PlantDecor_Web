'use client';

import React, { useEffect, useState } from 'react';
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
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { CreateCaretakerRequest } from '@/types/auth.types';
import type { StoreUserSpecializationOption } from '@/types/store-management.types';
import { createNurseryCareaker, getActiveSpecializationsForStaff } from '@/lib/api/managerStoreUsersService';
import { isValidPhoneNumber10Digits } from '@/lib/utils/phoneNumber';

interface CreateCaretakerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCaretakerCreated: () => void;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const defaultValues: CreateCaretakerRequest = {
  email: '',
  password: '',
  confirmPassword: '',
  username: '',
  fullName: '',
  phoneNumber: '',
  specializationIds: [],
};

export default function CreateCaretakerFormDialog({
  open,
  onClose,
  onCaretakerCreated,
}: CreateCaretakerFormDialogProps) {
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<CreateCaretakerRequest>({
    defaultValues,
    mode: 'onChange',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<StoreUserSpecializationOption[]>([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(false);

  const specializationIds = watch('specializationIds');

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchSpecializations = async () => {
      setSpecializationsLoading(true);
      try {
        const options = await getActiveSpecializationsForStaff(false);
        setSpecializations(options);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách chuyên môn');
      } finally {
        setSpecializationsLoading(false);
      }
    };

    void fetchSpecializations();
  }, [open]);

  const onSubmit = async (data: CreateCaretakerRequest) => {
    setLoading(true);
    setError(null);

    try {
      await createNurseryCareaker({
        ...data,
        phoneNumber: data.phoneNumber.trim(),
      }, false);
      reset(defaultValues);
      onCaretakerCreated();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Can not create caretaker';
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
      <DialogTitle>Create New Caretaker</DialogTitle>
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

            <Grid size={{ xs: 12 }}>
              <Controller
                name="specializationIds"
                control={control}
                rules={{
                  required: 'Please select at least one specialization',
                }}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={Boolean(errors.specializationIds)}
                    disabled={specializationsLoading}
                  >
                    <InputLabel>Specialization *</InputLabel>
                    <Select
                      {...field}
                      label="Specialization *"
                      multiple
                      value={field.value || []}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(typeof value === 'string' ? value.split(',').map(Number) : value);
                      }}
                    >
                      {specializations.map((spec) => (
                        <MenuItem key={spec.id} value={spec.id}>
                          {spec.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.specializationIds && (
                      <FormHelperText>{errors.specializationIds.message}</FormHelperText>
                    )}
                    {specializationIds.length > 0 && (
                      <FormHelperText>
                        Selected {specializationIds.length} specializations
                      </FormHelperText>
                    )}
                  </FormControl>
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
          disabled={loading || specializationsLoading}
          className="bg-primary!"
        >
          {loading ? 'Creating...' : 'Create Caretaker'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
