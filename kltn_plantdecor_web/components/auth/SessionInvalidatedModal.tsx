'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  Button, 
  Typography, 
  Box, 
  Zoom 
} from '@mui/material';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import { useAuthStore } from '@/store/authStore';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import {
  dispatchSessionInvalidated,
  getSessionInvalidatedEventName,
  resetSessionInvalidatedFlag,
} from '@/lib/utils/authSessionEvents';

const HEARTBEAT_INTERVAL_MS = 15000;

export function SessionInvalidatedModal() {
  const router = useRouter();
  const t = useTranslations('auth.sessionInvalidated');
  const { isAuthenticated, clearUser } = useAuthStore();
  const [open, setOpen] = useState(false);

  const onSessionInvalidated = useCallback(() => {
    clearUser();
    setOpen(true);
  }, [clearUser]);

  useEffect(() => {
    const eventName = getSessionInvalidatedEventName();
    const listener = () => onSessionInvalidated();
    window.addEventListener(eventName, listener as EventListener);
    return () => window.removeEventListener(eventName, listener as EventListener);
  }, [onSessionInvalidated]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'auth:logout-all' && event.newValue) {
        dispatchSessionInvalidated('revoked');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        if (response.status === 401) dispatchSessionInvalidated('revoked');
      } catch {}
    };
    checkSession();
    const intervalId = window.setInterval(checkSession, HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [isAuthenticated]);

  const handleReLogin = useCallback(() => {
    setOpen(false);
    resetSessionInvalidatedFlag();
    router.push('/login');
  }, [router]);

  return (
    <Dialog 
      open={open} 
      TransitionComponent={Zoom} 
      disableEscapeKeyDown 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogContent>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          textAlign="center"
          py={2}
        >
          <Box 
            sx={{ 
              backgroundColor: '#FFEDED',
              borderRadius: '50%', 
              p: 2, 
              mb: 2 
            }}
          >
            <LockClockOutlinedIcon sx={{ fontSize: 60, color: 'var(--error)' }} />
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('title')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
            {t('description')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button 
          onClick={handleReLogin} 
          variant="contained" 
          fullWidth 
          size="large"
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 'bold', 
            backgroundColor: 'var(--primary)',
            ...hoverLiftStyle,
          }}
        >
          {t('button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}