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
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo nhân viên chăm sóc';
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
      <DialogTitle>Tạo nhân viên chăm sóc mới</DialogTitle>
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

            <Grid size={{ xs: 12 }}>
              <Controller
                name="specializationIds"
                control={control}
                rules={{
                  required: 'Vui lòng chọn ít nhất một chuyên môn',
                }}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={Boolean(errors.specializationIds)}
                    disabled={specializationsLoading}
                  >
                    <InputLabel>Chuyên môn *</InputLabel>
                    <Select
                      {...field}
                      label="Chuyên môn *"
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
                        Đã chọn {specializationIds.length} chuyên môn
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
          Hủy
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading || specializationsLoading}
          className="bg-primary!"
        >
          {loading ? 'Đang tạo...' : 'Tạo nhân viên chăm sóc'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
