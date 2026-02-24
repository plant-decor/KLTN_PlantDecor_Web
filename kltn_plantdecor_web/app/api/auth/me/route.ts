import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User } from '@/types/auth.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * API Route: GET /api/auth/me
 * 
 * Lấy current user info từ backend (sử dụng token cookie)
 * Nếu token không hợp lệ hoặc hết hạn, return 401
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    // Gọi backend để lấy user info
    const response = await fetch(`${API_BASE}/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token không hợp lệ, xóa cookie
        cookieStore.delete('authToken');
        cookieStore.delete('refreshToken');
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user: User = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
