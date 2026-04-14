'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useAuthStore } from '@/lib/store/authStore';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { logoutAction, validateSessionAction } from '@/app/actions/authenticationActions';
import {
  dispatchSessionInvalidated,
  getSessionInvalidatedEventName,
  resetSessionInvalidatedFlag,
} from '@/lib/utils/authSessionEvents';

const HEARTBEAT_INTERVAL_MS = 90000;
const INITIAL_HEARTBEAT_DELAY_MS = 5000;
const HEARTBEAT_MAX_INTERVAL_MS = 300000;
const HEARTBEAT_LOCK_KEY = 'auth:heartbeat:leader';
const HEARTBEAT_LOCK_TTL_MS = 120000;

type HeartbeatLock = {
  ownerId: string;
  expiresAt: number;
};

const safeParseHeartbeatLock = (raw: string | null): HeartbeatLock | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as HeartbeatLock;
    if (
      typeof parsed.ownerId === 'string' &&
      parsed.ownerId.trim() &&
      typeof parsed.expiresAt === 'number' &&
      Number.isFinite(parsed.expiresAt)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export function SessionInvalidatedModal() {
  const router = useRouter();
  const t = useTranslations('auth.sessionInvalidated');
  const { isAuthenticated, isAuthBootstrapCompleted, clearAll } = useAuthStore();
  const [open, setOpen] = useState(false);
  const tabIdRef = useRef<string>('');
  const heartbeatTimerRef = useRef<number | null>(null);
  const currentIntervalRef = useRef<number>(HEARTBEAT_INTERVAL_MS);

  if (!tabIdRef.current && typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    tabIdRef.current = crypto.randomUUID();
  }

  if (!tabIdRef.current) {
    tabIdRef.current = `tab-${Math.random().toString(36).slice(2)}`;
  }

  const clearHeartbeatTimer = useCallback(() => {
    if (heartbeatTimerRef.current !== null) {
      window.clearTimeout(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const tryAcquireHeartbeatLeader = useCallback((): boolean => {
    const now = Date.now();
    const existingLock = safeParseHeartbeatLock(localStorage.getItem(HEARTBEAT_LOCK_KEY));
    const currentTabId = tabIdRef.current;

    if (existingLock && existingLock.expiresAt > now && existingLock.ownerId !== currentTabId) {
      return false;
    }

    const renewedLock: HeartbeatLock = {
      ownerId: currentTabId,
      expiresAt: now + HEARTBEAT_LOCK_TTL_MS,
    };

    localStorage.setItem(HEARTBEAT_LOCK_KEY, JSON.stringify(renewedLock));
    return true;
  }, []);

  const releaseHeartbeatLeader = useCallback(() => {
    const existingLock = safeParseHeartbeatLock(localStorage.getItem(HEARTBEAT_LOCK_KEY));
    if (existingLock?.ownerId === tabIdRef.current) {
      localStorage.removeItem(HEARTBEAT_LOCK_KEY);
    }
  }, []);

  const onSessionInvalidated = useCallback(async () => {
    // Clear Zustand store (user + tokens)
    clearAll();
    setOpen(true);

    // Revoke local HttpOnly session immediately so any later visit to /login is not redirected.
    try {
      await logoutAction();
    } catch {
      // Keep modal flow resilient even if server-side cleanup fails.
    }
  }, [clearAll]);

  useEffect(() => {
    const eventName = getSessionInvalidatedEventName();
    const listener = () => {
      void onSessionInvalidated();
    };
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
    if (!isAuthenticated || !isAuthBootstrapCompleted) return;

    currentIntervalRef.current = HEARTBEAT_INTERVAL_MS;
    let cancelled = false;

    const checkSession = async () => {
      if (cancelled || document.visibilityState !== 'visible') {
        return;
      }

      if (!tryAcquireHeartbeatLeader()) {
        return;
      }

      try {
        const result = await validateSessionAction();
        if (!result.authenticated) {
          dispatchSessionInvalidated('revoked');
          return;
        }

        currentIntervalRef.current = HEARTBEAT_INTERVAL_MS;
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 401) {
          dispatchSessionInvalidated('revoked');
          return;
        }

        currentIntervalRef.current = Math.min(
          HEARTBEAT_MAX_INTERVAL_MS,
          currentIntervalRef.current * 2
        );
      } finally {
        if (!cancelled) {
          clearHeartbeatTimer();
          heartbeatTimerRef.current = window.setTimeout(runHeartbeat, currentIntervalRef.current);
        }
      }
    };

    const runHeartbeat = () => {
      void checkSession();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        currentIntervalRef.current = HEARTBEAT_INTERVAL_MS;
        clearHeartbeatTimer();
        heartbeatTimerRef.current = window.setTimeout(runHeartbeat, 0);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    heartbeatTimerRef.current = window.setTimeout(runHeartbeat, INITIAL_HEARTBEAT_DELAY_MS);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearHeartbeatTimer();
      releaseHeartbeatLeader();
    };
  }, [
    clearHeartbeatTimer,
    isAuthenticated,
    isAuthBootstrapCompleted,
    releaseHeartbeatLeader,
    tryAcquireHeartbeatLeader,
  ]);

  const handleReLogin = useCallback(async () => {
    setOpen(false);
    resetSessionInvalidatedFlag();
    // TODO: clearClientAccessToken is removed - verify if needed
    // clearClientAccessToken();

    // Clear HttpOnly auth cookies on server so middleware won't redirect back to dashboard.
    try {
      await logoutAction();
    } catch {
      // Continue navigation even if server-side logout fails.
    }

    router.replace('/login');
    router.refresh();
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
