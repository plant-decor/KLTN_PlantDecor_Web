'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import https from 'node:https';
import type {
  ConfirmEmailRequest,
  CreateManagerRequest,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
  VerifyEmailRequest,
} from '@/types/auth.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7180/api';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

interface ActionResult {
  success: boolean;
  message: string;
}

interface AuthenticatedActionResult extends ActionResult {
  user?: User;
}

interface RefreshActionResult extends ActionResult {
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface RawAuthApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  payload?: {
    accessToken?: string;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
    user?: User;
  };
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
}

interface ApiMessageResponse {
  message?: string;
}

type ErrorWithCause = Error & {
  code?: string;
  cause?: {
    code?: string;
  };
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type AuthMode = 'none' | 'optional' | 'required';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: AuthMode;
  token?: string;
}

const isSelfSignedCertificateError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as ErrorWithCause;
  return err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || err.cause?.code === 'DEPTH_ZERO_SELF_SIGNED_CERT';
};

const isLocalHttpsUrl = (url: string): boolean => {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return /^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(url);
};

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(base64 + padding, 'base64').toString('utf-8');

    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const claimString = (claims: Record<string, unknown> | null, keys: string[]): string => {
  if (!claims) {
    return '';
  }

  for (const key of keys) {
    const value = claims[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const claimNumber = (claims: Record<string, unknown> | null, key: string): number | null => {
  if (!claims) {
    return null;
  }

  const value = claims[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const parseErrorMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  if ('message' in payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }

  if ('errors' in payload && payload.errors && typeof payload.errors === 'object') {
    const errors = Object.values(payload.errors as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    if (errors.length > 0) {
      return errors[0];
    }
  }

  return fallback;
};

const buildUserFromToken = (token: string, fallbackUser?: User): { user: User; expiresIn: number } => {
  const claims = parseJwtPayload(token);
  const exp = claimNumber(claims, 'exp');
  const iat = claimNumber(claims, 'iat');
  const sub = claimString(claims, ['sub']);
  const parsedId = Number(sub);
  const userId = Number.isFinite(parsedId) ? parsedId : 0;

  return {
    expiresIn: exp && iat ? Math.max(0, Math.floor(exp - iat)) : 3600,
    user: {
      id: userId,
      email: claimString(claims, ['email']) || fallbackUser?.email || '',
      name:
        claimString(claims, ['name', 'unique_name', 'given_name']) ||
        fallbackUser?.name ||
        'User',
      role: claimString(claims, ['Role', 'role']) || fallbackUser?.role,
      avatar:
        claimString(claims, ['avatarURL', 'avatarUrl', 'avatar']) ||
        fallbackUser?.avatar,
    },
  };
};

const normalizeTokenResponse = (
  raw: RawAuthApiResponse,
  fallbackMessage: string
): LoginResponse => {
  const token = raw.payload?.accessToken || raw.payload?.token || raw.accessToken || raw.token;
  const refreshToken = raw.payload?.refreshToken || raw.refreshToken || '';

  if (!token) {
    throw new Error(raw.message || fallbackMessage);
  }

  const { user, expiresIn: inferredExpiresIn } = buildUserFromToken(token, raw.payload?.user || raw.user);

  return {
    token,
    refreshToken,
    expiresIn: raw.payload?.expiresIn || raw.expiresIn || inferredExpiresIn,
    user,
  };
};

const clearAuthenticationCookies = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete('authToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('userRole');
};

const setAuthenticationCookies = async (data: LoginResponse): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    name: 'authToken',
    value: data.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.expiresIn,
    path: '/',
  });

  if (data.refreshToken) {
    cookieStore.set({
      name: 'refreshToken',
      value: data.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/',
    });
  }

  if (data.user.role) {
    cookieStore.set({
      name: 'userRole',
      value: data.user.role,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.expiresIn,
      path: '/',
    });
  }
};

const callAuthenticationApi = async <TResponse>(
  endpoint: string,
  fallbackErrorMessage: string,
  options: RequestOptions = {}
): Promise<TResponse> => {
  const cookieStore = await cookies();
  const authMode = options.auth ?? 'none';
  const url = `${API_BASE}${endpoint}`;
  const bearerToken =
    options.token || (authMode !== 'none' ? cookieStore.get('authToken')?.value || '' : '');

  if (authMode === 'required' && !bearerToken) {
    throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
  }

  const requestConfig = (httpsAgent?: https.Agent) => ({
    method: options.method || 'POST',
    url,
    data: options.body,
    headers: {
      'Content-Type': 'application/json',
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    timeout: 15000,
    withCredentials: true,
    ...(httpsAgent ? { httpsAgent } : {}),
  });

  try {
    const response = await axios.request<TResponse>(requestConfig());
    return response.data;
  } catch (error) {
    if (isSelfSignedCertificateError(error) && isLocalHttpsUrl(url)) {
      try {
        const response = await axios.request<TResponse>(
          requestConfig(
            new https.Agent({
              rejectUnauthorized: false,
            })
          )
        );

        return response.data;
      } catch (retryError) {
        if (axios.isAxiosError(retryError)) {
          if (retryError.response?.status === 401) {
            await clearAuthenticationCookies();
          }

          throw new Error(parseErrorMessage(retryError.response?.data, fallbackErrorMessage));
        }

        throw retryError;
      }
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        await clearAuthenticationCookies();
      }

      throw new Error(parseErrorMessage(error.response?.data, fallbackErrorMessage));
    }

    throw error;
  }
};

export async function loginAction(email: string, password: string): Promise<AuthenticatedActionResult> {
  try {
    const cookieStore = await cookies();
    const deviceId = cookieStore.get('deviceId')?.value;

    const data = await callAuthenticationApi<RawAuthApiResponse>(
      '/Authentication/login',
      'Đăng nhập thất bại.',
      {
        body: {
          email,
          password,
          ...(deviceId ? { deviceId } : {}),
        },
      }
    );

    const normalized = normalizeTokenResponse(data, 'Đăng nhập thất bại.');
    await setAuthenticationCookies(normalized);

    return {
      success: true,
      message: data.message || 'Đăng nhập thành công.',
      user: normalized.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi server khi đăng nhập.',
    };
  }
}

export async function loginWithGoogleAction(
  payload: GoogleLoginRequest
): Promise<AuthenticatedActionResult> {
  try {
    const data = await callAuthenticationApi<RawAuthApiResponse>(
      '/Authentication/login-google',
      'Đăng nhập Google thất bại.',
      {
        body: payload,
      }
    );

    const normalized = normalizeTokenResponse(data, 'Đăng nhập Google thất bại.');
    await setAuthenticationCookies(normalized);

    return {
      success: true,
      message: data.message || 'Đăng nhập Google thành công.',
      user: normalized.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Đăng nhập Google thất bại.',
    };
  }
}

export async function refreshTokenAction(
  request?: Partial<RefreshTokenRequest>
): Promise<RefreshActionResult> {
  try {
    const cookieStore = await cookies();
    const refreshToken = request?.refreshToken || cookieStore.get('refreshToken')?.value || '';

    if (!refreshToken) {
      await clearAuthenticationCookies();
      return {
        success: false,
        message: 'Không tìm thấy refresh token hợp lệ.',
      };
    }

    const data = await callAuthenticationApi<RawAuthApiResponse>(
      '/Authentication/refreshToken',
      'Làm mới phiên đăng nhập thất bại.',
      {
        body: { refreshToken },
      }
    );

    const normalized = normalizeTokenResponse(data, 'Làm mới phiên đăng nhập thất bại.');
    await setAuthenticationCookies(normalized);

    return {
      success: true,
      message: data.message || 'Làm mới phiên đăng nhập thành công.',
      token: normalized.token,
      refreshToken: normalized.refreshToken,
      expiresIn: normalized.expiresIn,
    };
  } catch (error) {
    await clearAuthenticationCookies();
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Làm mới phiên đăng nhập thất bại.',
    };
  }
}

export async function registerAction(payload: RegisterRequest): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResponse>(
      '/Authentication/register',
      'Đăng ký tài khoản thất bại.',
      {
        body: payload,
      }
    );

    return {
      success: true,
      message: data.message || 'Đăng ký tài khoản thành công.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Đăng ký tài khoản thất bại.',
    };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value || '';
  const refreshToken = cookieStore.get('refreshToken')?.value || '';

  try {
    if (authToken || refreshToken) {
      await callAuthenticationApi<ApiMessageResponse>('/Authentication/logout', 'Đăng xuất thất bại.', {
        auth: 'optional',
      });
    }
  } catch {
    // Logout should remain fail-soft: local session cleanup is the priority.
  } finally {
    await clearAuthenticationCookies();
  }

  return { success: true };
}

export async function logoutAllAction(): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResponse>(
      '/Authentication/logout-all',
      'Đăng xuất tất cả phiên thất bại.',
      {
        auth: 'required',
      }
    );

    await clearAuthenticationCookies();

    return {
      success: true,
      message: data.message || 'Đã đăng xuất khỏi tất cả phiên đăng nhập.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Đăng xuất tất cả phiên thất bại.',
    };
  }
}

export async function resendVerificationEmailAction(
  email: string | VerifyEmailRequest
): Promise<ActionResult> {
  try {
    const payload: VerifyEmailRequest = typeof email === 'string' ? { email } : email;

    const data = await callAuthenticationApi<ApiMessageResponse>(
      '/Authentication/verify-email',
      'Không thể gửi lại email xác thực.',
      {
        body: payload,
      }
    );

    return {
      success: true,
      message: data.message || 'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Không thể gửi lại email xác thực.',
    };
  }
}

export async function confirmEmailAction(
  email: string,
  token: string
): Promise<ActionResult> {
  try {
    const payload: ConfirmEmailRequest = { email, token };
    const data = await callAuthenticationApi<ApiMessageResponse>(
      '/Authentication/confirm-email',
      'Xác thực email thất bại.',
      {
        body: payload,
      }
    );

    return {
      success: true,
      message: data.message || 'Xác thực email thành công.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Xác thực email thất bại.',
    };
  }
}

export async function forgotPasswordAction(
  payload: ForgotPasswordRequest
): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResponse>(
      '/Authentication/forgot-password',
      'Không thể gửi email đặt lại mật khẩu.',
      {
        body: payload,
      }
    );

    return {
      success: true,
      message: data.message || 'Đã gửi email đặt lại mật khẩu.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Không thể gửi email đặt lại mật khẩu.',
    };
  }
}

export async function resetPasswordAction(
  payload: ResetPasswordRequest
): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResponse>(
      '/Authentication/reset-password',
      'Đặt lại mật khẩu thất bại.',
      {
        method: 'PUT',
        body: payload,
      }
    );

    return {
      success: true,
      message: data.message || 'Đặt lại mật khẩu thành công.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Đặt lại mật khẩu thất bại.',
    };
  }
}

export async function createManagerAction(
  payload: CreateManagerRequest
): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResponse>(
      '/Authentication/create-manager',
      'Tạo tài khoản quản lý thất bại.',
      {
        auth: 'required',
        body: payload,
      }
    );

    return {
      success: true,
      message: data.message || 'Tạo tài khoản quản lý thành công.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Tạo tài khoản quản lý thất bại.',
    };
  }
}