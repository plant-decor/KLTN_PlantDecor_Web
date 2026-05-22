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

export type SubscriptionTier = 'Bronze' | 'Silver' | 'Gold';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  subscription?: SubscriptionTier;
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

/** Body POST /Authentication/create-consultant */
export interface CreateConsultantRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName: string;
  phoneNumber: string;
}

/** Body POST /Authentication/create-manager (nurseryId tùy chọn) */
export interface CreateManagerRequest extends CreateConsultantRequest {
  nurseryId?: number;
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

export type UserGender = 'Unknown' | 'Male' | 'Female' | 'Other';

export interface UserProfile extends CustomerProfile {
  nurseryId?: number;
  nurseryName?: string;
  fullName?: string;
  birthYear?: number;
  birthDate?: string;
  fengshuiElement?: string;
  subscription?: SubscriptionTier;
  gender?: UserGender | number | string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateUserProfileRequest {
  userName: string;
  phoneNumber: string;
  fullName: string;
  address: string;
  birthYear?: number;
  birthDate?: string;
  gender: UserGender;
  latitude: number;
  longitude: number;
  receiveNotifications: boolean;
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName: string;
  phoneNumber: string;
}

export interface CreateStaffResponse {
  user: {
    id: number;
    email: string;
    username: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    isVerified: boolean;
    role: string;
    nurseryId: number;
    nurseryName: string;
    fullName: string;
    receiveNotifications: boolean;
  };
}

export interface CreateCaretakerRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  specializationIds: number[];
}

export interface CreateCaretakerResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  status: number;
  specializations: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}
