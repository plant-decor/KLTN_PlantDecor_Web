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

    // Check reCAPTCHA requirement
    if (requiresRecaptcha() && !recaptchaToken) {
      setRecaptchaError(t('recaptchaCompleteBeforeChange'));
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
        setError(result.message || t('changePasswordFailed'));
        return;
      }

      resetFailedAttempts();
      setMessage(t('changePasswordSuccess'));
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Change password error:', err);
      if (!requiresRecaptcha()) {
        incrementFailedAttempts();
      }
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

          {/* reCAPTCHA Section */}
          {requiresRecaptcha() && (
            <Box sx={{ bgcolor: '#fef3c7', border: '1px solid #fde68a', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#92400e' }}>
                {t('tooManyFailedAttempts')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#b45309', mb: 2, display: 'block' }}>
                {t('recaptchaRequiredForPassword')}
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
              {t('exceededPasswordAttempts')}
            </Typography>
          )}
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
