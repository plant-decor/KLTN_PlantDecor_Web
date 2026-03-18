import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import https from 'node:https';

interface ServerApiErrorPayload {
  message?: string;
  errors?: Record<string, string[] | string>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const shouldAllowLocalSelfSignedCert = (() => {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  if (!API_BASE.startsWith('https://')) {
    return false;
  }

  try {
    const { hostname } = new URL(API_BASE);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
})();

const localHttpsAgent = shouldAllowLocalSelfSignedCert
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

const extractErrorMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as ServerApiErrorPayload;

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  if (data.errors && typeof data.errors === 'object') {
    for (const value of Object.values(data.errors)) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      if (Array.isArray(value)) {
        const firstMessage = value.find((item) => typeof item === 'string' && item.trim());
        if (firstMessage) {
          return firstMessage.trim();
        }
      }
    }
  }

  return null;
};

const serverAxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  ...(localHttpsAgent ? { httpsAgent: localHttpsAgent } : {}),
  headers: {
    'Content-Type': 'application/json',
    ...(process.env.NEXT_PUBLIC_API_KEY
      ? { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
      : {}),
  },
  withCredentials: true,
});

serverAxiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

serverAxiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      extractErrorMessage(error.response?.data) ||
      (typeof error.message === 'string' && error.message.trim() ? error.message : 'Request failed');

    const normalizedError = new Error(message);
    (normalizedError as Error & { status?: number }).status = error.response?.status;

    return Promise.reject(normalizedError);
  }
);

export default serverAxiosInstance;
