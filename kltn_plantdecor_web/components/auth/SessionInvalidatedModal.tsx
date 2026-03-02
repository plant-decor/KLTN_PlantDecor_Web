'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import {
  dispatchSessionInvalidated,
  getSessionInvalidatedEventName,
  resetSessionInvalidatedFlag,
} from '@/lib/utils/authSessionEvents';

const HEARTBEAT_INTERVAL_MS = 15000;

export function SessionInvalidatedModal() {
  const router = useRouter();
  const { isAuthenticated, clearUser } = useAuthStore();
  const [open, setOpen] = useState(false);

  const message = useMemo(
    () =>
      'Phiên đăng nhập của bạn đã hết hiệu lực hoặc đã bị đăng xuất từ thiết bị khác. Vui lòng đăng nhập lại để tiếp tục.',
    []
  );

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

        if (response.status === 401) {
          dispatchSessionInvalidated('revoked');
        }
      } catch {
      }
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
    <Dialog open={open} disableEscapeKeyDown onClose={() => {}}>
      <DialogTitle>Phiên đăng nhập đã bị thu hồi</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReLogin} variant="contained" color="primary" autoFocus>
          Đăng nhập lại
        </Button>
      </DialogActions>
    </Dialog>
  );
}
