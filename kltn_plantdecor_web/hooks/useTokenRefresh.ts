import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { refreshTokenAction } from '@/app/actions/authenticationActions';
import {
  getClientRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
} from '@/lib/axios/tokenStorage';

const MIN_REFRESH_LEAD_TIME_MS = 10 * 1000;

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

  const getRefreshLeadTime = useCallback(
    (remainingMs: number) => {
      if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
        return MIN_REFRESH_LEAD_TIME_MS;
      }

      // Keep refresh close enough to expiry, but avoid aggressive short loops
      // when token TTL is smaller than the default threshold.
      return Math.min(
        refreshThreshold,
        Math.max(MIN_REFRESH_LEAD_TIME_MS, Math.floor(remainingMs * 0.25))
      );
    },
    [refreshThreshold]
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
    const refreshLeadTime = getRefreshLeadTime(remainingMs);

    if (remainingMs > refreshLeadTime) {
      scheduleNextCheck(remainingMs - refreshLeadTime);
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
          const nextRemainingMs = nextExpiresAt - Date.now();
          if (nextRemainingMs > 0) {
            const nextRefreshLeadTime = getRefreshLeadTime(nextRemainingMs);
            scheduleNextCheck(Math.max(1000, nextRemainingMs - nextRefreshLeadTime));
            return;
          }

          scheduleNextCheck(checkInterval);
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
  }, [checkInterval, enabled, getRefreshLeadTime, onError, onRefresh, scheduleNextCheck]);

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
