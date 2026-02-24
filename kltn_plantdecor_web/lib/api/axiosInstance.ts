import axios from 'axios';

/**
 * Axios Instance - Cookie-Based Authentication
 * 
 * 🔒 Bảo mật:
 * - Token được lưu trong HTTP-Only Cookie
 * - Axios tự động gửi cookie khi request (do withCredentials: true)
 * - Không cần thêm header Authorization (Backend tự extract từ cookie)
 * - Backend sẽ handle refresh token logic nếu cần
 */

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 🔒 QUAN TRỌNG: Gửi cookies kèm theo request (bao gồm authToken)
  withCredentials: true,
});

// ===== Request Interceptor =====
// Log requests (optional)
axiosInstance.interceptors.request.use(
  (config) => {
    // Cookies sẽ được tự động gửi cùng request
    // Không cần thêm header Authorization vì token ở cookie
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
// Xử lý errors (401, 403...)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Nếu lỗi 401 Unauthorized (token hết hạn hoặc invalid)
    if (error.response?.status === 401) {
      // Backend sẽ tự động refresh token bằng refreshToken cookie
      // hoặc client cần gọi một endpoint để refresh
      // Tùy theo design của backend
      
      // Ở đây, redirect tới login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Nếu lỗi 403 Forbidden (không có quyền)
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
