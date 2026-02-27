/**
 * Mock Login API Route - Dành cho development/testing
 * Sử dụng khi backend .NET chưa hoàn thành chức năng login
 * 
 * CHỈ dùng ở development mode, xóa khi production
 */

import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_USERS } from '@/data/sampledata';
import type { LoginResponse } from '@/types/auth.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in sample data
    const user = SAMPLE_USERS.find((u) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create mock tokens
    const token = `mock_token_${user.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_${user.id}_${Date.now()}`;
    const expiresIn = 3600; // 1 hour

    // Create response with cookies
    const response: LoginResponse = {
      token,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.userName,
        role: user.role,
        avatar: user.avatarUrl,
      },
    };

    const res = NextResponse.json(response, { status: 200 });

    // Set HTTP-Only cookies
    const expiryDate = new Date(Date.now() + expiresIn * 1000).toUTCString();

    res.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiryDate),
    });

    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiryDate),
    });

    return res;
  } catch (error) {
    console.error('Mock login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
