'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/auth.types';
import { refreshTokenAction } from '@/app/actions/authenticationActions';
import {
  getClientAccessToken,
  setClientAccessToken,
  setClientRefreshToken,
} from '@/lib/axios/tokenStorage';

/**
 * Auth Provider
 * 
 * Được mount ở root layout
 * Tự động lấy user info từ cookie khi app load
 * 
 * Ví dụ sử dụng:
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthProvider>
 *           {children}
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */
export function AuthProvider({ children, initialUser }: { children: React.ReactNode, initialUser: User | null; }) {
  const { setUser, clearAll } = useAuthStore();

  useEffect(() => {
    // Khi app load, kiểm tra xem user đã login chưa
    const initializeAuth = async () => {
      try {
        if (initialUser) {
          setUser(initialUser);

          if (!getClientAccessToken()) {
            const refreshed = await refreshTokenAction();

            if (refreshed.success && refreshed.token) {
              setClientAccessToken(refreshed.token);

              if (refreshed.refreshToken) {
                setClientRefreshToken(refreshed.refreshToken);
              }
            } else {
              clearAll();
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        clearAll();
      }
    };

    // Delay 100ms để tránh hydration issues
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, [clearAll, initialUser, setUser]);

  return <>{children}</>;
}
