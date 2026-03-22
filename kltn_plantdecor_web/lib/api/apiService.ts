import type { AxiosRequestConfig } from "axios";
import * as apiClient from "@/lib/api/apiService.client";
import * as apiServer from "@/lib/api/apiService.server";

// Backward-compatible bridge. Prefer importing from apiService.client/apiService.server directly.
export async function get<T>(
  url: string,
  params: AxiosRequestConfig["params"] = undefined,
  isServer = false,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  if (isServer) {
    return apiServer.get<T>(url, params, config);
  }
  return apiClient.get<T>(url, params, loading, config);
}

export async function post<T>(
  url: string,
  data: unknown = undefined,
  isServer = false,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  if (isServer) {
    return apiServer.post<T>(url, data, config);
  }
  return apiClient.post<T>(url, data, loading, config);
}

export async function put<T>(
  url: string,
  data: unknown = undefined,
  isServer = false,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  if (isServer) {
    return apiServer.put<T>(url, data, config);
  }
  return apiClient.put<T>(url, data, loading, config);
}

export async function patch<T>(
  url: string,
  data: unknown = undefined,
  isServer = false,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  if (isServer) {
    return apiServer.patch<T>(url, data, config);
  }
  return apiClient.patch<T>(url, data, loading, config);
}

export async function del<T>(
  url: string,
  isServer = false,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  if (isServer) {
    return apiServer.del<T>(url, config);
  }
  return apiClient.del<T>(url, loading, config);
}
