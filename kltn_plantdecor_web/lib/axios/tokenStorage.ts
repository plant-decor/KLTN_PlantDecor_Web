import { useAuthStore } from '@/lib/store/authStore';

/**
 * Token Storage - Zustand Store Implementation
 *
 * ✅ KIẾN TRÚC MỚI:
 * - Sử dụng Zustand store cho access token (memory only)
 * - Persist refresh token trong localStorage (auto-hydrate)
 * - Fallback đọc localStorage cho refresh token (tránh race condition)
 *
 * 🔐 BẢO MẬT:
 * - accessToken không persist → Bảo mật cao nhất
 * - refreshToken persist → Silent refresh sau reload trang
 *
 * ⚡ HIỆU NĂNG:
 * - Zustand store nhanh hơn localStorage
 * - Fallback đảm bảo không bị lỗi khi Zustand chưa hydrate
 */

/**
 * Get access token from Zustand store
 * @returns Access token hoặc null
 */
export const getClientAccessToken = (): string | null => {
  return useAuthStore.getState().getAccessToken();
};

/**
 * Set access token to Zustand store
 * @param token - Access token cần lưu
 */
export const setClientAccessToken = (token: string): void => {
  useAuthStore.getState().setAccessToken(token);
  document.cookie = `accessToken=${token}; path=/; secure; samesite=strict`;
};

/**
 * Get refresh token from Zustand store
 * ✅ Fallback đọc trực tiếp từ localStorage nếu Zustand chưa hydrate
 * @returns Refresh token hoặc null
 */
export const getClientRefreshToken = (): string | null => {
  // Đọc từ Zustand store (đã hydrate)
  const storeToken = useAuthStore.getState().getRefreshToken();
  if (storeToken) return storeToken;

  // ✅ Fallback: Đọc trực tiếp từ localStorage khi Zustand chưa hydrate
  // Tránh race condition sau F5 - đảm bảo có refreshToken ngay lập tức
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('auth-storage');
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const refreshToken = parsed?.state?.refreshToken;

    return typeof refreshToken === 'string' && refreshToken.trim()
      ? refreshToken
      : null;
  } catch {
    return null;
  }
};

/**
 * Set refresh token to Zustand store
 * @param token - Refresh token cần lưu
 */
export const setClientRefreshToken = (token: string): void => {
  useAuthStore.getState().setRefreshToken(token);
};

/**
 * Clear all tokens from Zustand store
 */
export const clearClientAccessToken = (): void => {
  useAuthStore.getState().clearTokens();
};

