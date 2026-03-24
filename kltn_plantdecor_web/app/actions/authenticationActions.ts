'use server';

import { cookies } from 'next/headers';
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
import { getOrCreateSessionId } from '@/lib/utils/deviceId';
import { createAxiosServer } from '@/lib/axios/axiosServer';
import { buildUserFromToken } from '@/lib/auth/getCurrentUser';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

interface ActionResult {
  success: boolean;
  message: string;
}

interface AuthenticatedActionResult extends ActionResult {
  user?: User;
  token?: string;
  refreshToken?: string;
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
  status?: number;
  payload?: unknown;
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type AuthMode = 'none' | 'optional' | 'required';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: AuthMode;
  token?: string;
}



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
  cookieStore.delete('accessToken');
  cookieStore.delete('authToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('userRole');
};

const setAuthenticationCookies = async (data: LoginResponse): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    name: 'accessToken',
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
  const authMode = options.auth ?? "none";

  const bearerToken =
    options.token ||
    (authMode !== "none"
      ? cookieStore.get("accessToken")?.value || ""
      : "");

  if (authMode === "required" && !bearerToken) {
    throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
  }

  try {
    const axios = await createAxiosServer();

    const response = await axios({
      method: options.method || "POST",
      url: endpoint,
      data: options.body,
      headers: {
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      },
    });

    return response.data;
  } catch (error: unknown) {
    const normalized = error as {
      response?: {
        status?: number;
        data?: unknown;
      };
      message?: string;
    };

    if (normalized.response?.status === 401) {
      await clearAuthenticationCookies();
    }

    const normalizedError = new Error(
      parseErrorMessage(
        normalized.response?.data,
        normalized.message || fallbackErrorMessage
      )
    ) as ErrorWithCause;
    normalizedError.status = normalized.response?.status;
    normalizedError.payload = normalized.response?.data;
    throw normalizedError;
  }
};

export async function loginAction(email: string, password: string) {
  try {
    const data = await callAuthenticationApi<RawAuthApiResponse>(
      "/Authentication/login",
      "Login failed",
      {
        body: {
          email,
          password,
          deviceId: getOrCreateSessionId(), // hoặc getDeviceId()
        },
      }
    );

    const normalized = normalizeTokenResponse(data, "Login failed");

    await setAuthenticationCookies(normalized);

    return {
      success: true,
      message: data.message,
      user: normalized.user, // ✅ lấy từ JWT
      token: normalized.token,
      refreshToken: normalized.refreshToken,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Login error",
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

    //decode JWT để lấy user
    const { user } = buildUserFromToken(normalized.token);

    await setAuthenticationCookies(normalized);

    return {
      success: true,
      message: data.message || 'Đăng nhập Google thành công.',
      user, // ✅ giờ đã có user
      token: normalized.token,
      refreshToken: normalized.refreshToken,
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
  const authToken = cookieStore.get('accessToken')?.value || '';
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

export async function validateSessionAction(): Promise<{ authenticated: boolean }> {
  try {
    await callAuthenticationApi<unknown>(
      '/User/user-profile',
      'Không thể xác thực phiên đăng nhập.',
      {
        method: 'GET',
        auth: 'required',
      }
    );

    return { authenticated: true };
  } catch (error) {
    const status = (error as ErrorWithCause).status;

    if (status === 401) {
      await clearAuthenticationCookies();
      return { authenticated: false };
    }

    // Keep user logged in on transient/network/server errors.
    return { authenticated: true };
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
