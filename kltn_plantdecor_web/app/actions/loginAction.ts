'use server';

import {
  loginAction as loginActionImpl,
  loginWithGoogleAction as loginWithGoogleActionImpl,
  logoutAction as logoutActionImpl,
  logoutAllAction as logoutAllActionImpl,
  refreshTokenAction as refreshTokenActionImpl,
} from './authenticationActions';
import type { GoogleLoginRequest, RefreshTokenRequest } from '@/types/auth.types';

export async function loginAction(email: string, password: string) {
  return loginActionImpl(email, password);
}

export async function loginWithGoogleAction(payload: GoogleLoginRequest) {
  return loginWithGoogleActionImpl(payload);
}

export async function logoutAction() {
  return logoutActionImpl();
}

export async function logoutAllAction(payload: { accessToken: string; refreshToken: string; deviceId: string }) {
  return logoutAllActionImpl(payload);
}

export async function refreshTokenAction(request?: Partial<RefreshTokenRequest>) {
  return refreshTokenActionImpl(request);
}
