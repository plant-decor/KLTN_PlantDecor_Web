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
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo nhân viên';
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
      <DialogTitle>Tạo nhân viên mới</DialogTitle>
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
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email không hợp lệ',
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
                  required: 'Tên đăng nhập là bắt buộc',
                  minLength: {
                    value: 3,
                    message: 'Tên đăng nhập phải có ít nhất 3 ký tự',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tên đăng nhập"
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
                rules={{ required: 'Họ và tên là bắt buộc' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Họ và tên"
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
                  required: 'Số điện thoại là bắt buộc',
                  validate: (value) =>
                    isValidPhoneNumber10Digits(value) || 'Số điện thoại không hợp lệ',
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
                    label="Số điện thoại"
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
                  required: 'Mật khẩu là bắt buộc',
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: 'Mật khẩu phải có ít nhất 8 ký tự, chứa chữ hoa, chữ thường, số và ký tự đặc biệt',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mật khẩu"
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
                  required: 'Xác nhận mật khẩu là bắt buộc',
                  validate: (value, formValues) =>
                    value === formValues.password || 'Mật khẩu không trùng khớp',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Xác nhận mật khẩu"
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
          Hủy
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
          className="bg-primary!"
        >
          {loading ? 'Đang tạo...' : 'Tạo nhân viên'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
