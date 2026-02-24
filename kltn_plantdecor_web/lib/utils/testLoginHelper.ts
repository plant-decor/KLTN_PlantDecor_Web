/**
 * API Test Utilities - Giúp test login với sample data
 * Import từ đây khi cần mock login response
 */

import { SAMPLE_USERS } from '@/data/sampledata';

export const mockLoginWithSampleData = (email: string, password: string) => {
  const user = SAMPLE_USERS.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return {
      success: false,
      error: 'Email hoặc password không đúng'
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
    },
    token: 'sample_token_' + user.id,
    refreshToken: 'sample_refresh_token_' + user.id,
  };
};

/**
 * Danh sách tài khoản test sẵn
 */
export const getTestAccounts = () => {
  return SAMPLE_USERS.map(user => ({
    email: user.email,
    password: user.password,
    role: user.role,
    userName: user.userName,
  }));
};

/**
 * Kiểm tra quyền dựa trên role
 */
export const hasPermission = (userRole: string, requiredRole: string | string[]) => {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(userRole);
};
