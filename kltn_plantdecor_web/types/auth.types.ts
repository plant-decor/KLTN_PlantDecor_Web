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

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId?: string;
}

export interface RevokeTokenRequest {
  refreshToken: string;
  deviceId?: string;
}
