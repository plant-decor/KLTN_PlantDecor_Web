import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { refreshTokenAction } from '@/app/actions/authenticationActions';
import {
  getClientRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
} from '@/lib/axios/tokenStorage';

type RefreshActionResult = Awaited<ReturnType<typeof refreshTokenAction>>;

interface UseTokenRefreshOptions {
  enabled?: boolean;
  refreshThreshold?: number; // Thời gian trước khi token hết hạn để refresh (milliseconds)
  checkInterval?: number; // Khoảng thời gian kiểm tra (milliseconds)
  onRefresh?: (refreshToken?: string) => Promise<RefreshActionResult>;
  onError?: (error: Error) => void;
}

export const useTokenRefresh = ({
  enabled = true,
  refreshThreshold = 5 * 60 * 1000, // 5 phút trước khi hết hạn
  checkInterval = 60 * 1000, // Kiểm tra mỗi 1 phút
  onRefresh,
  onError,
}: UseTokenRefreshOptions = {}) => {
  const timerRef = useRef<number | null>(null);
  const refreshInProgressRef = useRef(false);
  const checkAndRefreshTokenRef = useRef<() => Promise<void>>(async () => undefined);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNextCheck = useCallback(
    (delayMs: number) => {
      clearTimer();

      if (!enabled || typeof window === 'undefined') {
        return;
      }

      const nextDelay = Math.max(1000, delayMs);
      timerRef.current = window.setTimeout(() => {
        void checkAndRefreshTokenRef.current();
      }, nextDelay);
    },
    [clearTimer, enabled]
  );

  const checkAndRefreshToken = useCallback(async () => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    if (document.visibilityState !== 'visible') {
      scheduleNextCheck(checkInterval);
      return;
    }

    const { accessTokenExpiresAt } = useAuthStore.getState();

    if (!accessTokenExpiresAt) {
      scheduleNextCheck(checkInterval);
      return;
    }

    const remainingMs = accessTokenExpiresAt - Date.now();

    if (remainingMs > refreshThreshold) {
      scheduleNextCheck(remainingMs - refreshThreshold);
      return;
    }

    if (refreshInProgressRef.current) {
      scheduleNextCheck(checkInterval);
      return;
    }

    const storeState = useAuthStore.getState();
    const refreshToken = getClientRefreshToken();
    if (!refreshToken && !storeState.isAuthenticated && !storeState.user) {
      scheduleNextCheck(checkInterval);
      return;
    }

    refreshInProgressRef.current = true;

    try {
      const refreshed = onRefresh
        ? await onRefresh(refreshToken ?? undefined)
        : refreshToken
          ? await refreshTokenAction({ refreshToken })
          : await refreshTokenAction();

      if (refreshed.success && refreshed.token) {
        setClientAccessToken(refreshed.token, refreshed.expiresIn);

        if (refreshed.refreshToken) {
          setClientRefreshToken(refreshed.refreshToken);
        }

        const nextExpiresAt = useAuthStore.getState().accessTokenExpiresAt;
        if (nextExpiresAt) {
          scheduleNextCheck(Math.max(1000, nextExpiresAt - Date.now() - refreshThreshold));
          return;
        }

        scheduleNextCheck(checkInterval);
        return;
      }

      scheduleNextCheck(checkInterval);
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }

      scheduleNextCheck(checkInterval);
    } finally {
      refreshInProgressRef.current = false;
    }
  }, [checkInterval, enabled, onError, onRefresh, refreshThreshold, scheduleNextCheck]);

  useEffect(() => {
    checkAndRefreshTokenRef.current = checkAndRefreshToken;
  }, [checkAndRefreshToken]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return () => clearTimer();
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkAndRefreshTokenRef.current();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    void checkAndRefreshTokenRef.current();

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearTimer();
    };
  }, [clearTimer, enabled]);

  return { checkAndRefreshToken };
};
