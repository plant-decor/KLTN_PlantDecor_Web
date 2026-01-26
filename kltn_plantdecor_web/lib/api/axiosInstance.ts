import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { getDeviceId } from '@/lib/utils/deviceId';

// ===== Real-time Token Tracking with Subscribe =====
let currentToken: string | null = null;
let currentRefreshToken: string | null = null;

// Subscribe để cập nhật token real-time khi state thay đổi
useAuthStore.subscribe(
  (state) => state.token,
  (token) => {
    currentToken = token;
  }
);

useAuthStore.subscribe(
  (state) => state.refreshToken,
  (refreshToken) => {
    currentRefreshToken = refreshToken;
  }
);

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Request Interceptor =====
// Sử dụng token từ subscribe (real-time, luôn đồng bộ với state)
axiosInstance.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
// Xử lý token hết hạn real-time (sử dụng token từ subscribe)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Sử dụng refreshToken từ subscribe (real-time, luôn mới nhất)
      if (currentRefreshToken) {
        try {
          const deviceId = getDeviceId();
          
          // Gọi API refresh token với deviceId
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { 
              refreshToken: currentRefreshToken,
              deviceId 
            }
          );

          const { token, refreshToken: newRefreshToken, expiresIn, user } = response.data;
          
          // Cập nhật token mới
          // setTokens() sẽ trigger subscribe tự động cập nhật currentToken
          const { setTokens } = useAuthStore.getState();
          setTokens(token, newRefreshToken, expiresIn, user);

          // Retry request với token mới
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Nếu refresh token thất bại (có thể bị revoked), xóa hết token và redirect to login
          const { clearTokens } = useAuthStore.getState();
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Không có refresh token, clear và redirect
        const { clearTokens } = useAuthStore.getState();
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
