'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/auth.types';
import { refreshTokenAction } from '@/app/actions/authenticationActions';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import {
  getClientAccessToken,
  getClientRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
} from '@/lib/axios/tokenStorage';

// Global flag to track if bootstrap refresh is already in progress.
// Prevents duplicate refresh attempts between bootstrap and other components.
let isBootstrapRefreshing = false;

/**
 * Auth Provider
 *
 * Mounted at the locale root layout.
 * Initializes auth store once when the app boots on the client.
 */
export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser: User | null }) {
  const { setUser, setAuthBootstrapCompleted, isAuthenticated, isAuthBootstrapCompleted } = useAuthStore();
  const initializedRef = useRef(false);

  useTokenRefresh({
    enabled: isAuthenticated && isAuthBootstrapCompleted,
  });

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    setAuthBootstrapCompleted(false);

    let active = true;

    const waitForStoreHydration = async () => {
      const persistedStore = useAuthStore as typeof useAuthStore & {
        persist?: {
          hasHydrated?: () => boolean;
          onFinishHydration?: (listener: () => void) => () => void;
        };
      };

      const persistApi = persistedStore.persist;
      if (!persistApi?.hasHydrated || !persistApi?.onFinishHydration || persistApi.hasHydrated()) {
        return;
      }

      await new Promise<void>((resolve) => {
        const unsubscribe = persistApi.onFinishHydration?.(() => {
          unsubscribe?.();
          resolve();
        });

        window.setTimeout(() => {
          unsubscribe?.();
          resolve();
        }, 800);
      });
    };

    const initializeAuth = async () => {
      try {
        if (!active) {
          return;
        }

        await waitForStoreHydration();

        if (!active) {
          return;
        }

        if (initialUser) {
          setUser(initialUser);
        }

        const state = useAuthStore.getState();
        const hasRecoverableSession =
          !!initialUser ||
          state.isAuthenticated ||
          !!state.user ||
          !!getClientRefreshToken();

        if (!getClientAccessToken() && hasRecoverableSession && !isBootstrapRefreshing) {
          isBootstrapRefreshing = true;

          try {
            const refreshed = await refreshTokenAction();

            if (!active) {
              return;
            }

            if (refreshed.success && refreshed.token) {
              setClientAccessToken(refreshed.token, refreshed.expiresIn);

              if (refreshed.refreshToken) {
                setClientRefreshToken(refreshed.refreshToken);
              }
            }
          } finally {
            isBootstrapRefreshing = false;
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        if (active) {
          isBootstrapRefreshing = false;
          setAuthBootstrapCompleted(true);
        }
      }
    };

    const timer = setTimeout(initializeAuth, 100);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [initialUser, setAuthBootstrapCompleted, setUser]);

  return <>{children}</>;
}
