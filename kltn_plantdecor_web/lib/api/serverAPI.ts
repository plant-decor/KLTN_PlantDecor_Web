'use server';

import { cookies } from 'next/headers';
import type { User } from '@/types/auth.types';

/**
 * Server-side utility để fetch user data từ C# API
 * 
 * Sử dụng token từ cookie để gọi protected endpoints
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Fetch user info từ API (sử dụng cookie)
 * 
 * Ví dụ:
 * const user = await fetchUserFromAPI();
 */
export async function fetchUserFromAPI(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return null;
    }

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
      return null;
    }

    const user: User = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user from API:', error);
    return null;
  }
}

/**
 * Fetch protected data từ API
 * 
 * Ví dụ:
 * const orders = await fetchProtectedAPI('/orders');
 */
export async function fetchProtectedAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        cookieStore.delete('authToken');
        cookieStore.delete('refreshToken');
        throw new Error('Token expired or invalid');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return null;
  }
}
