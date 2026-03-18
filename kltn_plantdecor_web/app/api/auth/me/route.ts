import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User } from '@/types/auth.types';
import serverAxiosInstance from '@/lib/api/serverAxiosInstance';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface UserProfilePayload {
  id?: number;
  email?: string;
  username?: string;
  fullName?: string;
  role?: string;
  avatar?: string;
  avatarUrl?: string;
  avatarURL?: string;
}

interface UserProfileResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  payload?: UserProfilePayload;
}

/**
 * API Route: GET /api/auth/me
 * 
 * Lấy current user info từ backend (sử dụng token cookie)
 * Nếu token không hợp lệ hoặc hết hạn, return 401
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    const response = await serverAxiosInstance.get<UserProfileResponse | UserProfilePayload>(`${API_BASE}/User/user-profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const raw = response.data;
    const payload =
      raw && typeof raw === 'object' && 'payload' in raw
        ? (raw as UserProfileResponse).payload
        : (raw as UserProfilePayload);

    const normalizedUser: User = {
      id: payload?.id ?? 0,
      email: payload?.email ?? '',
      name: payload?.username || payload?.fullName || payload?.email || 'User',
      role: payload?.role,
      avatar: payload?.avatar || payload?.avatarUrl || payload?.avatarURL,
    };

    const nextResponse = NextResponse.json(normalizedUser);

    if (normalizedUser.role) {
      nextResponse.cookies.set({
        name: 'userRole',
        value: normalizedUser.role,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return nextResponse;
  } catch (error) {
    if ((error as Error & { status?: number }).status === 401) {
      const cookieStore = await cookies();
      cookieStore.delete('authToken');
      cookieStore.delete('refreshToken');

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
