'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { changePasswordAction } from '@/app/actions/changePasswordAction';
import { hoverGlowStyle, hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { useTranslations } from 'next-intl';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
      setError(t('pleaseEnterCurrentPassword'));
      return;
    }

    if (!newPassword) {
      setError(t('pleaseEnterNewPassword'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('newPasswordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (oldPassword === newPassword) {
      setError(t('newPasswordMustDiffer'));
      return;
    }
    setIsLoading(true);
    try {
      const result = await changePasswordAction(
        oldPassword,
        newPassword,
      );

      if (!result.success) {
        setError(result.message || t('changePasswordFailed'));
        return;
      }

      setMessage(t('changePasswordSuccess'));
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Change password error:', err);
      setError(t('changePasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
        {t('changePasswordTitle')}
      </DialogTitle>

      <DialogContent sx={{ pt: 3, space: 4 }}>
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

        <form onSubmit={handleSubmit} className="space-y-4! pt-2">
          {/* Old Password */}
          <TextField
            label={t('currentPassword')}
            type="password"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* New Password */}
          <TextField
            label={t('newPassword')}
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading}
            helperText={t('passwordMinLength')}
          />

          {/* Confirm Password */}
          <TextField
            label={t('confirmNewPassword')}
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={isLoading} sx={{...hoverGlowStyle, ":hover": { backgroundColor: 'var(--error)' }}}>
          {tCommon('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{background: "var(--primary)", ...hoverLiftStyle}}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? t('processing') : t('changePassword')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
