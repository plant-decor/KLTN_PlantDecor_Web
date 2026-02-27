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
 * 2. Gọi API C# để login (server-to-server)
 * 3. Nhận token và userInfo từ C#
 * 4. Lưu token vào HTTP-Only Cookie
 * 5. Trả về userInfo để client lưu vào Zustand
 */
export async function loginAction(
  email: string,
  password: string
): Promise<LoginActionResponse> {
  try {
    // Bước 2: Gọi API C# (Server to Server)
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

    // Bước 3: Lưu token vào HTTP-Only Cookie
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

    // Bước 4: Trả về userInfo (dữ liệu không nhạy cảm)
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
