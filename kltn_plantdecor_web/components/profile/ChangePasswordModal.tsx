'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { changePassword } from '@/lib/api/userProfileService';
import { logoutAllAction } from '@/app/actions/authenticationActions';
import { useAuthStore } from '@/lib/store/authStore';
import { clearClientAccessToken, getClientAccessToken, getClientRefreshToken } from '@/lib/axios/tokenStorage';
import { getDeviceId } from '@/lib/utils/deviceId';
import { hoverGlowStyle, hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { useTranslations } from 'next-intl';
import { CustomLoading } from '../CustomLoading';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const { clearAll } = useAuthStore();
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

  const redirectToLogin = () => {
    const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
    const loginPath = locale ? `/${locale}/login` : '/login';
    router.replace(loginPath);
    router.refresh();
  };

  const clearSessionAndRedirect = () => {
    clearAll();
    clearClientAccessToken();
    redirectToLogin();
  };

  const handleSubmit = async (logoutAll = false) => {
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

    if (logoutAll) {
      const shouldContinue = window.confirm(
        t('logoutAllConfirmation') || 'Password will be changed and all sessions will be logged out. Continue?'
      );

      if (!shouldContinue) {
        return;
      }
    }

    setIsLoading(true);
    try {
      // Call client-side API to change password
      const response = await changePassword(oldPassword, newPassword, confirmPassword, false);

      if (!response.success) {
        setError(response.message || t('changePasswordFailed'));
        return;
      }

      if (logoutAll) {
        const logoutResult = await logoutAllAction({
          accessToken: getClientAccessToken() || '',
          refreshToken: getClientRefreshToken() || '',
          deviceId: getDeviceId(),
        });

        if (!logoutResult.success) {
          setError(logoutResult.message || t('logoutAllFailed') || 'Logout all devices failed');
          return;
        }
      }

      setMessage(t('changePasswordSuccess'));
      setTimeout(() => {
        clearSessionAndRedirect();
      }, 1000);
    } catch (err) {
      console.error('Change password error:', err);
      const errorMessage = err instanceof Error ? err.message : t('changePasswordError');
      setError(errorMessage);
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

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(false);
          }}
          className="space-y-4! pt-2"
        >
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
          onClick={() => void handleSubmit(false)}
          variant="contained"
          disabled={isLoading}
          sx={{background: "var(--primary)", ...hoverLiftStyle}}
          startIcon={isLoading ? <CustomLoading size={20} /> : undefined}
        >
          {isLoading ? t('processing') : t('changePassword')}
        </Button>
        <Button
          onClick={() => void handleSubmit(true)}
          variant="outlined"
          disabled={isLoading}
          sx={hoverGlowStyle}
        >
          {t('saveAndLogoutAll')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
