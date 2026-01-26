import axiosInstance from './axiosInstance';
import { getDeviceId } from '@/lib/utils/deviceId';
import type { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  RevokeTokenRequest 
} from '@/types/auth.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * API service cho authentication
 */
export const authService = {
  /**
   * Login - Gửi deviceId để backend lưu refresh token cho device này
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const deviceId = getDeviceId();
    const deviceName = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

    const response = await axiosInstance.post<LoginResponse>(`${API_BASE}/auth/login`, {
      email,
      password,
      deviceId,
      deviceName,
    } as LoginRequest);

    return response.data;
  },

  /**
   * Refresh Token - Gửi refresh token và deviceId để lấy token mới
   * Backend sẽ kiểm tra:
   * - Token có tồn tại trong bảng RefreshToken không
   * - IsRevoked có = false không
   * - ExpiryDate còn hạn không
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const deviceId = getDeviceId();

    const response = await axiosInstance.post<RefreshTokenResponse>(
      `${API_BASE}/auth/refresh`,
      {
        refreshToken,
        deviceId,
      } as RefreshTokenRequest
    );

    return response.data;
  },

  /**
   * Logout - Revoke refresh token của device hiện tại
   * Backend sẽ set IsRevoked = true cho refresh token này
   */
  logout: async (refreshToken: string): Promise<void> => {
    const deviceId = getDeviceId();

    await axiosInstance.post(`${API_BASE}/auth/logout`, {
      refreshToken,
      deviceId,
    } as RevokeTokenRequest);
  },

  /**
   * Logout All Devices - Revoke tất cả refresh tokens của user
   * Backend sẽ set IsRevoked = true cho tất cả refresh tokens của user
   */
  logoutAllDevices: async (): Promise<void> => {
    await axiosInstance.post(`${API_BASE}/auth/logout-all`);
  },

  /**
   * Get Active Sessions - Lấy danh sách các thiết bị đang đăng nhập
   * Trả về danh sách RefreshToken chưa revoked và chưa hết hạn
   */
  getActiveSessions: async () => {
    const response = await axiosInstance.get(`${API_BASE}/auth/sessions`);
    return response.data;
  },

  /**
   * Revoke Session - Revoke một session cụ thể
   */
  revokeSession: async (refreshTokenId: number): Promise<void> => {
    await axiosInstance.delete(`${API_BASE}/auth/sessions/${refreshTokenId}`);
  },
};
