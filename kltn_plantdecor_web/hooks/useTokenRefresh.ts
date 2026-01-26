import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

interface UseTokenRefreshOptions {
  refreshThreshold?: number; // Thời gian trước khi token hết hạn để refresh (milliseconds)
  checkInterval?: number; // Khoảng thời gian kiểm tra (milliseconds)
  onRefresh?: (refreshToken: string) => Promise<{ token: string; refreshToken: string; expiresIn: number }>;
  onError?: (error: Error) => void;
}

export const useTokenRefresh = ({
  refreshThreshold = 5 * 60 * 1000, // 5 phút trước khi hết hạn
  checkInterval = 60 * 1000, // Kiểm tra mỗi 1 phút
  onRefresh,
  onError,
}: UseTokenRefreshOptions = {}) => {
  const { tokenExpiry, refreshToken, setTokens, clearTokens } = useAuthStore();

  const checkAndRefreshToken = useCallback(async () => {
    if (!tokenExpiry || !refreshToken || !onRefresh) return;

    const timeUntilExpiry = tokenExpiry - Date.now();

    // Nếu token đã hết hạn hoặc sắp hết hạn
    if (timeUntilExpiry <= refreshThreshold) {
      try {
        const newTokens = await onRefresh(refreshToken);
        setTokens(newTokens.token, newTokens.refreshToken, newTokens.expiresIn);
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh token:', error);
        clearTokens();
        if (onError) {
          onError(error as Error);
        }
      }
    }
  }, [tokenExpiry, refreshToken, refreshThreshold, onRefresh, setTokens, clearTokens, onError]);

  useEffect(() => {
    // Kiểm tra ngay khi component mount
    checkAndRefreshToken();

    // Thiết lập interval để kiểm tra định kỳ
    const intervalId = setInterval(checkAndRefreshToken, checkInterval);

    return () => clearInterval(intervalId);
  }, [checkAndRefreshToken, checkInterval]);

  return { checkAndRefreshToken };
};
