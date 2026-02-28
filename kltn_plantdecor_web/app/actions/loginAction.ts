'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { LoginResponse, User } from '@/types/auth.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface LoginActionResponse {
  success: boolean;
  user?: User;
  message?: string;
}

/**
 * Server Action: Đăng nhập
 * 
 * Luồng:
 * 1. Nhận email, password từ client
 * 2. Verify reCAPTCHA token nếu có
 * 3. Gọi API C# để login (server-to-server)
 * 4. Nhận token và userInfo từ C#
 * 5. Lưu token vào HTTP-Only Cookie
 * 6. Trả về userInfo để client lưu vào Zustand
 */
export async function loginAction(
  email: string,
  password: string,
  recaptchaToken?: string
): Promise<LoginActionResponse> {
  try {
    // Bước 2: Verify reCAPTCHA token nếu có
    if (recaptchaToken) {
      const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaVerified) {
        return {
          success: false,
          message: 'reCAPTCHA verification failed. Please try again.',
        };
      }
    }

    // Bước 3: Gọi API C# (Server to Server)
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        deviceId: process.env.DEVICE_ID || 'web-app',
        deviceName: 'Web Browser',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Đăng nhập thất bại',
      };
    }

    const data: LoginResponse = await response.json();

    // Bước 4: Lưu token vào HTTP-Only Cookie
    const cookieStore = await cookies();
    
    cookieStore.set({
      name: 'authToken',
      value: data.token,
      httpOnly: true, // 🔒 Bảo mật: JS không thể truy cập
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: data.expiresIn, // Seconds
      path: '/',
    });

    // Lưu refresh token
    if (data.refreshToken) {
      cookieStore.set({
        name: 'refreshToken',
        value: data.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    // Lưu role để middleware check authorization
    if (data.user.role) {
      cookieStore.set({
        name: 'userRole',
        value: data.user.role,
        httpOnly: false, // Middleware cần đọc được
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.expiresIn,
        path: '/',
      });
    }

    // Bước 5: Trả về userInfo (dữ liệu không nhạy cảm)
    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Lỗi server khi đăng nhập',
    };
  }
}

/**
 * Verify reCAPTCHA token with Google
 */
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not configured');
      return true; // Allow login if secret key not configured
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    
    // Consider it verified if score is above 0.5
    const isValid = data.success && data.score >= 0.5;
    
    if (!isValid) {
      console.warn('reCAPTCHA verification failed:', {
        success: data.success,
        score: data.score,
        action: data.action,
      });
    }

    return isValid;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

/**
 * Server Action: Đăng xuất
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('authToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('userRole'); // Xóa role cookie
    
    // Redirect to login page
    redirect('/login');
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
}
