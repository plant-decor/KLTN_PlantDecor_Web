export interface RefreshToken {
  id: number;
  userId: number;
  token: string;
  isRevoked: boolean;
  createDate: string;
  expiryDate: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number; // seconds
  user: User;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  // Chỉ lưu dữ liệu KHÔNG nhạy cảm trên client
  // Token sẽ được lưu trong HTTP-Only Cookie
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
}

export interface GoogleLoginRequest {
  accessToken: string;
  deviceId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName: string;
  phoneNumber: string;
}

export interface VerifyEmailRequest {
  email: string;
}

export interface ConfirmEmailRequest {
  email: string;
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface CreateManagerRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RevokeTokenRequest {
  refreshToken: string;
  deviceId?: string;
}

export interface CustomerProfile {
  id: number;
  email: string;
  username?: string;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  status: 'Active' | 'Inactive';
  isVerified: boolean;
  avatarUrl?: string;
  role?: string;
  fullName?: string;
  address?: string;
  receiveNotifications?: boolean;
  profileCompleteness?: number;
}