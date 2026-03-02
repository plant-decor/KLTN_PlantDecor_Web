'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFailedPasswordAttempts } from '@/hooks/useFailedPasswordAttempts';
import { changePasswordAction } from '@/app/actions/changePasswordAction';
import RecaptchaField from '@/components/auth/RecaptchaField';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    requiresRecaptcha,
    incrementFailedAttempts,
    resetFailedAttempts,
    getRemainingAttempts,
  } = useFailedPasswordAttempts();

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setRecaptchaToken('');
    setRecaptchaError('');
    setError('');
    setMessage('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!oldPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu cũ');
      return;
    }

    // Check reCAPTCHA requirement
    if (requiresRecaptcha() && !recaptchaToken) {
      setRecaptchaError('Vui lòng xác thực reCAPTCHA trước khi đổi mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePasswordAction(
        oldPassword,
        newPassword,
        recaptchaToken || undefined
      );

      if (!result.success) {
        if (!requiresRecaptcha()) {
          incrementFailedAttempts();
        }
        setError(result.message || 'Đổi mật khẩu thất bại');
        return;
      }

      resetFailedAttempts();
      setMessage('Mật khẩu đã được thay đổi thành công');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Change password error:', err);
      if (!requiresRecaptcha()) {
        incrementFailedAttempts();
      }
      setError('Lỗi khi đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
        Đổi mật khẩu
      </DialogTitle>

      <DialogContent sx={{ pt: 3, space: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password */}
          <TextField
            label="Mật khẩu hiện tại"
            type="password"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* New Password */}
          <TextField
            label="Mật khẩu mới"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading}
            helperText="Ít nhất 6 ký tự"
          />

          {/* Confirm Password */}
          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* reCAPTCHA Section */}
          {requiresRecaptcha() && (
            <Box sx={{ bgcolor: '#fef3c7', border: '1px solid #fde68a', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#92400e' }}>
                Quá nhiều lần thất bại
              </Typography>
              <Typography variant="caption" sx={{ color: '#b45309', mb: 2, display: 'block' }}>
                Vì lý do bảo mật, vui lòng hoàn thành xác thực reCAPTCHA.
              </Typography>
              <RecaptchaField
                onToken={(token) => {
                  setRecaptchaToken(token);
                  if (token) {
                    setRecaptchaError('');
                  }
                }}
                onError={(captchaError) => {
                  console.error('reCAPTCHA error:', captchaError);
                  setRecaptchaError(captchaError);
                }}
                isLoading={isLoading}
                showMessage={false}
              />
              {recaptchaError && (
                <Typography variant="caption" sx={{ color: 'error.main', mt: 1, display: 'block' }}>
                  {recaptchaError}
                </Typography>
              )}
            </Box>
          )}

          {requiresRecaptcha() && getRemainingAttempts() === 0 && (
            <Typography variant="caption" sx={{ color: '#b45309' }}>
              Bạn đã vượt quá số lần thử tối đa. Vui lòng hoàn thành reCAPTCHA.
            </Typography>
          )}
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
