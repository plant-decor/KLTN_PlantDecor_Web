'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/auth.types';
import { refreshTokenAction } from '@/app/actions/authenticationActions';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import {
  getClientAccessToken,
  setClientAccessToken,
  setClientRefreshToken,
} from '@/lib/axios/tokenStorage';

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

    const initializeAuth = async () => {
      try {
        if (!active || !initialUser) {
          return;
        }

        setUser(initialUser);

        if (!getClientAccessToken()) {
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
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        if (active) {
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
