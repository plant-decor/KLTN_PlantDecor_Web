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
  Typography,
  Box,
} from '@mui/material';
import { setPasswordForGoogleLogin } from '@/lib/api/userProfileService';
import { hoverGlowStyle, hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { useTranslations } from 'next-intl';

interface SetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SetPasswordModal({ open, onClose }: SetPasswordModalProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
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

    setIsLoading(true);
    try {
      const result = await setPasswordForGoogleLogin(
        newPassword,
        confirmPassword,
        false
      );

      if (result.success) {
        setMessage(t('passwordSetSuccess') || 'Password set successfully');
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(result.message || t('setPasswordFailed') || 'Failed to set password');
      }
    } catch (err) {
      console.error('Set password error:', err);
      const errorMessage = err instanceof Error ? err.message : t('setPasswordError') || 'Error setting password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
        {t('setPasswordTitle') || 'Set Password'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3, space: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('setPasswordDescription') || 'Set a password for your Google-authenticated account'}
        </Typography>
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
          {/* New Password */}
          <TextField
            label={t('newPassword')}
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading}
            helperText={t('passwordMinLength') || 'Minimum 6 characters'}
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

          {/* Password requirements info */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {t('passwordRequirements') || 'Password Requirements:'}
            </Typography>
            <Typography variant="body2" component="div">
              • {t('passwordMinLength') || 'Minimum 6 characters'}
            </Typography>
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{...hoverGlowStyle, ":hover": { backgroundColor: 'var(--error)' }}}
        >
          {tCommon('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{background: "var(--primary)", ...hoverLiftStyle}}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? t('processing') || 'Processing...' : (t('setPassword') || 'Set Password')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
