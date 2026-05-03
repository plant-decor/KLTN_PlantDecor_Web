'use server';

import { cookies } from 'next/headers';
import type {
  ConfirmEmailRequest,
  CreateConsultantRequest,
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
  expiresIn?: number;
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

type ApiMessageResult = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  payload?: unknown;
};

const deriveApiSuccess = (data: ApiMessageResult): boolean => {
  if (typeof data.success === 'boolean') {
    return data.success;
  }

  if (typeof data.statusCode === 'number') {
    return data.statusCode >= 200 && data.statusCode < 300;
  }

  // Nếu backend không trả success/statusCode mà request không throw thì coi là success.
  return true;
};

interface LogoutAllRequest {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
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
  clearCookiesOn401?: boolean;
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
  const shouldClearCookiesOn401 = options.clearCookiesOn401 ?? true;

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

    if (normalized.response?.status === 401 && shouldClearCookiesOn401) {
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

export async function loginAction(email: string, password: string, deviceId?: string): Promise<AuthenticatedActionResult> {
  try {
    const data = await callAuthenticationApi<RawAuthApiResponse>(
      "/Authentication/login",
      "Login failed",
      {
        body: {
          email,
          password,
          deviceId,
        },
      }
    );

    const normalized = normalizeTokenResponse(data, "Login failed");

    await setAuthenticationCookies(normalized);

    return {
      success: true,
      message: data.message || "Login successful",
      user: normalized.user, // ✅ lấy từ JWT
      token: normalized.token,
      refreshToken: normalized.refreshToken,
      expiresIn: normalized.expiresIn,
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
      expiresIn: normalized.expiresIn,
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
    const status = (error as ErrorWithCause).status;
    if (status === 400 || status === 401) {
      await clearAuthenticationCookies();
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Làm mới phiên đăng nhập thất bại.',
    };
  }
}

export async function registerAction(payload: RegisterRequest): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResult>(
      '/Authentication/register',
      'Đăng ký tài khoản thất bại.',
      {
        body: payload,
      }
    );

    const success = deriveApiSuccess(data);
    return {
      success,
      message: data.message || (success ? 'Đăng ký tài khoản thành công.' : 'Đăng ký tài khoản thất bại.'),
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

export async function logoutAllAction(payload: LogoutAllRequest): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResponse>(
      '/Authentication/logout-all',
      'Đăng xuất tất cả phiên thất bại.',
      {
        body: payload,
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
  const sessionValidationRequest: RequestOptions = {
    method: 'GET',
    auth: 'required',
    clearCookiesOn401: false,
  };

  try {
    await callAuthenticationApi<unknown>(
      '/User/user-profile',
      'Không thể xác thực phiên đăng nhập.',
      sessionValidationRequest
    );

    return { authenticated: true };
  } catch (error) {
    const status = (error as ErrorWithCause).status;

    if (status === 401) {
      const refreshed = await refreshTokenAction();
      if (!refreshed.success) {
        return { authenticated: false };
      }

      try {
        await callAuthenticationApi<unknown>(
          '/User/user-profile',
          'Không thể xác thực phiên đăng nhập.',
          sessionValidationRequest
        );
        return { authenticated: true };
      } catch (retryError) {
        const retryStatus = (retryError as ErrorWithCause).status;
        if (retryStatus === 401) {
          await clearAuthenticationCookies();
          return { authenticated: false };
        }

        // Keep user logged in on transient/network/server errors.
        return { authenticated: true };
      }
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

    const data = await callAuthenticationApi<ApiMessageResult>(
      '/Authentication/verify-email',
      'Không thể gửi lại email xác thực.',
      {
        body: payload,
      }
    );

    const success = deriveApiSuccess(data);
    return {
      success,
      message:
        data.message ||
        (success
          ? 'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.'
          : 'Không thể gửi lại email xác thực.'),
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
    const data = await callAuthenticationApi<ApiMessageResult>(
      '/Authentication/confirm-email',
      'Email verification failed.',
      {
        body: payload,
      }
    );
    console.log('response', data);
    const success = deriveApiSuccess(data);
    return {
      success,
      message: data.message || (success ? 'Email verification successful.' : 'Email verification failed.'),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Email verification failed.',
    };
  }
}

export async function forgotPasswordAction(
  payload: ForgotPasswordRequest
): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResult>(
      '/Authentication/forgot-password',
      'Không thể gửi email đặt lại mật khẩu.',
      {
        body: payload,
      }
    );

    const success = deriveApiSuccess(data);
    return {
      success,
      message: data.message || (success ? 'Đã gửi email đặt lại mật khẩu.' : 'Không thể gửi email đặt lại mật khẩu.'),
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
    const data = await callAuthenticationApi<ApiMessageResult>(
      '/Authentication/reset-password',
      'Đặt lại mật khẩu thất bại.',
      {
        method: 'PUT',
        body: payload,
      }
    );

    const success = deriveApiSuccess(data);
    return {
      success,
      message: data.message || (success ? 'Đặt lại mật khẩu thành công.' : 'Đặt lại mật khẩu thất bại.'),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Đặt lại mật khẩu thất bại.',
    };
  }
}

const toCreateManagerApiBody = (payload: CreateManagerRequest): Record<string, unknown> => {
  const { nurseryId, ...rest } = payload;
  const body: Record<string, unknown> = { ...rest };
  if (nurseryId != null && Number.isFinite(nurseryId)) {
    body.nurseryId = nurseryId;
  }
  return body;
};

export async function createConsultantAction(
  payload: CreateConsultantRequest
): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResult>(
      '/Authentication/create-consultant',
      'Create consultant account failed.',
      {
        auth: 'required',
        body: payload,
      }
    );

    const success = deriveApiSuccess(data);
    return {
      success,
      message:
        data.message || (success ? 'Create consultant account successful.' : 'Create consultant account failed.'),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Create consultant account failed.',
    };
  }
}

export async function createManagerAction(
  payload: CreateManagerRequest
): Promise<ActionResult> {
  try {
    const data = await callAuthenticationApi<ApiMessageResult>(
      '/Authentication/create-manager',
      'Create manager account failed.',
      {
        auth: 'required',
        body: toCreateManagerApiBody(payload),
      }
    );

    const success = deriveApiSuccess(data);
    return {
      success,
      message: data.message || (success ? 'Create manager account successful.' : 'Create manager account failed.'),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Create manager account failed.',
    };
  }
}
