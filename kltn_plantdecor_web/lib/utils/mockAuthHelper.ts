/**
 * Mock Login Utility - Giúp test các routes khi backend chưa hoàn thành
 * Sử dụng sample data để simulate login
 */

import { SAMPLE_USERS } from '@/data/sampledata';
import type { User, LoginResponse } from '@/types/auth.types';

export const mockLoginUser = (email: string, password: string): LoginResponse | null => {
  const user = SAMPLE_USERS.find((u) => u.email === email && u.password === password);

  if (!user) {
    return null;
  }

  // Simulate token response
  return {
    token: `mock_token_${user.id}_${Date.now()}`,
    refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
    expiresIn: 3600, // 1 hour
    user: {
      id: user.id,
      email: user.email,
      name: user.userName,
      role: user.role,
      avatar: user.avatarUrl,
    },
  };
};

/**
 * Set auth cookies & localStorage quá trực tiếp (dành cho dev/testing)
 * CHỈ dùng ở development mode
 */
export const setMockAuthState = (user: User, token: string, refreshToken: string) => {
  // Set localStorage
  localStorage.setItem(
    'auth-storage',
    JSON.stringify({
      state: { user, isAuthenticated: true },
      version: 0,
    })
  );

  // Set cookies (client-side)
  const expiresIn = 3600; // 1 hour
  const expiryDate = new Date(Date.now() + expiresIn * 1000);

  document.cookie = `authToken=${token}; expires=${expiryDate.toUTCString()}; path=/`;
  document.cookie = `refreshToken=${refreshToken}; expires=${expiryDate.toUTCString()}; path=/`;
};

/**
 * Clear mock auth state
 */
export const clearMockAuthState = () => {
  localStorage.removeItem('auth-storage');
  document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
};

/**
 * Get all test accounts available
 */
export const getTestAccounts = () => {
  return SAMPLE_USERS.map((user) => ({
    id: user.id,
    email: user.email,
    password: user.password,
    role: user.role,
    userName: user.userName,
  }));
};
