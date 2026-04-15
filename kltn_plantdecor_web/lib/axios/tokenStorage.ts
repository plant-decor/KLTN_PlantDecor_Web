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

const parseJwtExpiration = (token: string): number | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(base64 + padding)) as { exp?: unknown };

    if (typeof payload.exp === 'number' && Number.isFinite(payload.exp)) {
      return payload.exp * 1000;
    }

    if (typeof payload.exp === 'string' && payload.exp.trim()) {
      const parsed = Number(payload.exp);
      if (Number.isFinite(parsed)) {
        return parsed * 1000;
      }
    }

    return null;
  } catch {
    return null;
  }
};

const resolveAccessTokenExpiresAt = (token: string, expiresInSeconds?: number): number | null => {
  if (typeof expiresInSeconds === 'number' && Number.isFinite(expiresInSeconds) && expiresInSeconds > 0) {
    return Date.now() + expiresInSeconds * 1000;
  }

  return parseJwtExpiration(token);
};

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
export const setClientAccessToken = (token: string, expiresInSeconds?: number): void => {
  const expiresAt = resolveAccessTokenExpiresAt(token, expiresInSeconds);
  useAuthStore.getState().setAccessToken(token);
  useAuthStore.getState().setAccessTokenExpiresAt(expiresAt);
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

