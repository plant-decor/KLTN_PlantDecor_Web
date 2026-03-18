'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { get } from '@/lib/api/apiService';
import type { User } from '@/types/auth.types';

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
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Khi app load, kiểm tra xem user đã login chưa
    const initializeAuth = async () => {
      try {
        const hasUserRoleCookie = document.cookie
          .split(';')
          .some((cookie) => cookie.trim().startsWith('userRole='));

        if (!hasUserRoleCookie) {
          return;
        }

        // Gọi Server Action để lấy user info từ cookie
        // (Nếu cookie hợp lệ, backend sẽ return user info)
        const response = await get<User>('/api/auth/me', undefined, false);
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };

    // Delay 100ms để tránh hydration issues
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, [setUser]);

  return <>{children}</>;
}
