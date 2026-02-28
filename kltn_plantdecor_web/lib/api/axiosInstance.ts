import axios, { AxiosRequestConfig } from 'axios';
import { useLoadingStore } from '@/store/loadingStore';
import { useAuthStore } from '@/store/authStore';
import { dispatchSessionInvalidated } from '@/lib/utils/authSessionEvents';

/**
 * Axios Instance - Cookie-Based Authentication
 * 
 * 🔒 Bảo mật:
 * - Token được lưu trong HTTP-Only Cookie
 * - Axios tự động gửi cookie khi request (do withCredentials: true)
 * - Không cần thêm header Authorization (Backend tự extract từ cookie)
 * - Backend sẽ handle refresh token logic nếu cần
 * 
 * ⚙️ Loading Configuration:
 * - By default, all API calls show loading spinner
 * - To skip loading for specific request: use skipLoading: true in config
 * - Example: axiosInstance.get('/endpoint', { skipLoading: true })
 */

// Extend Axios config to include skipLoading flag
declare module 'axios' {
  interface AxiosRequestConfig {
    skipLoading?: boolean;
  }
}

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    ...(process.env.NEXT_PUBLIC_API_KEY
      ? { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
      : {}),
  },
  // 🔒 QUAN TRỌNG: Gửi cookies kèm theo request (bao gồm authToken)
  withCredentials: true,
});

const getNotFoundRedirectPath = () => {
  if (typeof window === 'undefined') {
    return '/404';
  }

  const localeMatch = window.location.pathname.match(/^\/(en|vi)(\/|$)/);
  if (localeMatch) {
    return `/${localeMatch[1]}/404`;
  }

  return '/404';
};

// ===== Request Interceptor =====
// Show loading spinner (unless skipLoading is true)
axiosInstance.interceptors.request.use(
  (config) => {
    // Cookies sẽ được tự động gửi cùng request
    // Không cần thêm header Authorization vì token ở cookie
    
    // Show loading by default (unless skipLoading flag is set)
    const skipLoading = config.skipLoading;
    if (!skipLoading) {
      const { setIsLoading } = useLoadingStore.getState();
      setIsLoading(true);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
// Hide loading and handle errors (401, 403...)
axiosInstance.interceptors.response.use(
  (response) => {
    // Hide loading for successful response
    const { setIsLoading } = useLoadingStore.getState();
    setIsLoading(false);
    
    return response;
  },
  async (error) => {
    // Hide loading on error
    const { setIsLoading } = useLoadingStore.getState();
    setIsLoading(false);

    // Nếu lỗi 401 Unauthorized (token hết hạn hoặc invalid)
    if (error.response?.status === 401) {
      const requestUrl: string = error.config?.url || '';
      const isLoginRequest = requestUrl.includes('/auth/login');

      if (!isLoginRequest && typeof window !== 'undefined') {
        const { clearUser } = useAuthStore.getState();
        clearUser();
        dispatchSessionInvalidated('unauthorized');
      }
    }

    // Nếu lỗi 403 Forbidden (không có quyền)
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    // Nếu lỗi 404 Not Found
    if (error.response?.status === 404) {
      if (typeof window !== 'undefined') {
        const redirectPath = getNotFoundRedirectPath();
        if (window.location.pathname !== redirectPath) {
          window.location.href = redirectPath;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
