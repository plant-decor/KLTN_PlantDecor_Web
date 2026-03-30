import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { useLoadingStore } from "@/lib/store/zustand";
import { toast } from "react-toastify";
import {
  clearClientAccessToken,
  getClientAccessToken,
  getClientRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
} from "@/lib/axios/tokenStorage";

type AuthAwareRequestConfig = InternalAxiosRequestConfig & {
  showLoading?: boolean;
  showToast?: boolean;
  showErrorToast?: boolean;
  redirectOnAuthFailure?: boolean;
  skipTokenRefresh?: boolean;
  _retry?: boolean;
};

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 100000,
  withCredentials: true,
});

let isRefreshing = false;
let isRedirectingToLogin = false;
let queue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  queue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  queue = [];
};

const getLoginPath = () => {
  if (typeof window === "undefined") return "/login?forceLogout=1";
  const locale = window.location.pathname.split("/")[1];
  const supportedLocales = new Set(["vi", "en"]);
  const loginBase = supportedLocales.has(locale) ? `/${locale}/login` : "/login";
  return `${loginBase}?forceLogout=1`;
};

const redirectToLogin = () => {
  if (typeof window === "undefined" || isRedirectingToLogin) return;
  isRedirectingToLogin = true;
  window.location.replace(getLoginPath());
};

const resolveAccessToken = (raw: unknown): string | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    accessToken?: string;
    token?: string;
    payload?: { accessToken?: string; token?: string };
  };

  const token =
    candidate.payload?.accessToken ||
    candidate.payload?.token ||
    candidate.accessToken ||
    candidate.token;

  return typeof token === "string" && token.trim() ? token : null;
};

const resolveRefreshToken = (raw: unknown): string | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    refreshToken?: string;
    payload?: { refreshToken?: string };
  };

  const token = candidate.payload?.refreshToken || candidate.refreshToken;
  return typeof token === "string" && token.trim() ? token : null;
};

const extractMessage = (raw: unknown): string | null => {
  if (!raw) return null;

  if (typeof raw === "string") {
    const text = raw.trim();
    return text || null;
  }

  if (typeof raw !== "object") return null;

  const payload = raw as {
    message?: unknown;
    title?: unknown;
    payload?: unknown;
    data?: unknown;
    error?: unknown;
  };

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  if (typeof payload.title === "string" && payload.title.trim()) {
    return payload.title.trim();
  }

  return (
    extractMessage(payload.payload) ||
    extractMessage(payload.data) ||
    extractMessage(payload.error)
  );
};

const shouldToastSuccess = (config: AuthAwareRequestConfig | undefined): boolean => {
  if (!config || config.showToast === false) return false;

  const method = config.method?.toUpperCase();
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
};

const isRefreshEndpoint = (url?: string): boolean => {
  return !!url?.includes("/Authentication/refreshToken");
};

const shouldSkipGlobalRefresh = (config: AuthAwareRequestConfig): boolean => {
  if (config.skipTokenRefresh) return true;

  const url = config.url || "";
  return (
    isRefreshEndpoint(url) ||
    url.includes("/Authentication/login") ||
    url.includes("/Authentication/login-google") ||
    url.includes("/Authentication/register") ||
    url.includes("/Authentication/forgot-password") ||
    url.includes("/Authentication/reset-password")
  );
};

const tryRefreshAccessToken = async (forceRefresh = false): Promise<string | null> => {
  const existingToken = getClientAccessToken();
  if (!forceRefresh && existingToken) {
    return existingToken;
  }

  if (isRefreshing) {
    try {
      await new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      });
      return getClientAccessToken();
    } catch {
      return null;
    }
  }

  isRefreshing = true;

  try {
    const refreshToken = getClientRefreshToken();
    const requestBody = refreshToken ? { refreshToken } : {};


    const refreshResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/Authentication/refreshToken`,
      requestBody,
      { withCredentials: true }
    );

    const refreshedToken = resolveAccessToken(refreshResponse.data);
    if (!refreshedToken) {
      throw new Error("Unable to resolve refreshed access token");
    }

    setClientAccessToken(refreshedToken);

    const refreshedRefreshToken = resolveRefreshToken(refreshResponse.data);
    if (refreshedRefreshToken) {
      setClientRefreshToken(refreshedRefreshToken);
    }

    processQueue(null);
    return refreshedToken;
  } catch (error) {
    processQueue(error);
    return null;
  } finally {
    isRefreshing = false;
  }
};

axiosClient.interceptors.request.use(
  async (config: AuthAwareRequestConfig) => {
    const { isLoadingFlag, setLoading } = useLoadingStore.getState();
    let bearerToken = getClientAccessToken();

    if (!bearerToken && !shouldSkipGlobalRefresh(config)) {
      bearerToken = await tryRefreshAccessToken();
    }

    const headers = AxiosHeaders.from(config.headers);

    if (bearerToken) {
      headers.set("Authorization", `Bearer ${bearerToken}`);
    } else {
      headers.delete("Authorization");
    }
    config.headers = headers;

    if (isLoadingFlag && config.showLoading !== false) {
      setLoading(true);
    }
    return config;
  },
  (error) => {
    const { isLoadingFlag, setLoading } = useLoadingStore.getState();
    if (isLoadingFlag) {
      setLoading(false);
    }
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    const { isLoadingFlag, setLoading } = useLoadingStore.getState();
    if (isLoadingFlag) setLoading(false);

    const requestConfig = response.config as AuthAwareRequestConfig | undefined;
    const message = extractMessage(response.data);
    if (message && shouldToastSuccess(requestConfig)) {
      toast.success(message);
    }

    return response;
  },
  async (error) => {
    const { isLoadingFlag, setLoading } = useLoadingStore.getState();
    if (isLoadingFlag) setLoading(false);

    const originalRequest = error?.config as AuthAwareRequestConfig | undefined;
    const statusCode = error?.response?.status as number | undefined;
    const errorMessage = extractMessage(error?.response?.data);
    const shouldShowErrorToast =
      originalRequest?.showToast !== false &&
      originalRequest?.showErrorToast !== false &&
      statusCode !== 401;
    if (errorMessage && shouldShowErrorToast) {
      toast.error(errorMessage);
    }

    if (!originalRequest) return Promise.reject(error);
    const isRefreshRequest = isRefreshEndpoint(originalRequest.url);

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;

      try {
        const refreshedToken = await tryRefreshAccessToken(true);
        if (!refreshedToken) {
          throw new Error("Refresh token is required");
        }

        return axiosClient(originalRequest);
      } catch (err) {
        clearClientAccessToken();
        if (originalRequest.redirectOnAuthFailure) {
          redirectToLogin();
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
