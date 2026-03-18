'use server';

import { cookies } from 'next/headers';
import type { User } from '@/types/auth.types';
import serverAxiosInstance from '@/lib/api/serverAxiosInstance';

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

    const response = await serverAxiosInstance.get<User>(`${API_BASE}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if ((error as Error & { status?: number }).status === 401) {
      const cookieStore = await cookies();
      cookieStore.delete('authToken');
      cookieStore.delete('refreshToken');
    }

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

    const method = (options.method || 'GET').toUpperCase();
    const response = await serverAxiosInstance.request<T>({
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers as Record<string, string> | undefined),
      },
      data: options.body,
    });

    return response.data;
  } catch (error) {
    if ((error as Error & { status?: number }).status === 401) {
      cookieStore.delete('authToken');
      cookieStore.delete('refreshToken');
    }

    console.error(`Error fetching from ${endpoint}:`, error);
    return null;
  }
}
