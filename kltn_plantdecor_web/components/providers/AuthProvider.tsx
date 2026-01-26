'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { authService } from '@/lib/api/authService';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isTokenExpired, clearTokens } = useAuthStore();

  // Sử dụng hook để tự động refresh token
  useTokenRefresh({
    refreshThreshold: 5 * 60 * 1000, // Refresh 5 phút trước khi hết hạn
    checkInterval: 60 * 1000, // Kiểm tra mỗi 1 phút
    onRefresh: async (refreshToken) => {
      // Gọi authService để refresh token với deviceId
      const data = await authService.refreshToken(refreshToken);
      return {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      };
    },
    onError: (error) => {
      console.error('Token refresh error:', error);
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  });

  // Kiểm tra token khi component mount
  useEffect(() => {
    if (isTokenExpired()) {
      console.log('Token expired on mount, clearing...');
      clearTokens();
    }
  }, [isTokenExpired, clearTokens]);

  return <>{children}</>;
};
