import axiosClient from "@/lib/axios/axiosClient";
import { useLoadingStore } from "@/lib/store/zustand";
import type { AxiosRequestConfig } from "axios";
import { normalizeApiError } from "@/lib/api/apiService.shared";

async function runWithLoading<T>(loading: boolean, task: () => Promise<T>): Promise<T> {
  useLoadingStore.getState().setIsLoadingFlag(loading);

  try {
    return await task();
  } finally {
    useLoadingStore.getState().setIsLoadingFlag(false);
  }
}

export async function get<T>(
  url: string,
  params: AxiosRequestConfig["params"] = undefined,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    return await runWithLoading(loading, async () => {
      const res = await axiosClient.get<T>(url, { ...config, params });
      return res.data;
    });
  } catch (err) {
    throw normalizeApiError(err, "GET", url, false);
  }
}

export async function post<T>(
  url: string,
  data: unknown = undefined,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    return await runWithLoading(loading, async () => {
      const res = await axiosClient.post<T>(url, data, config);
      return res.data;
    });
  } catch (err) {
    throw normalizeApiError(err, "POST", url, false);
  }
}

export async function put<T>(
  url: string,
  data: unknown = undefined,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    return await runWithLoading(loading, async () => {
      const res = await axiosClient.put<T>(url, data, config);
      return res.data;
    });
  } catch (err) {
    throw normalizeApiError(err, "PUT", url, false);
  }
}

export async function patch<T>(
  url: string,
  data: unknown = undefined,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    return await runWithLoading(loading, async () => {
      const res = await axiosClient.patch<T>(url, data, config);
      return res.data;
    });
  } catch (err) {
    throw normalizeApiError(err, "PATCH", url, false);
  }
}

export async function del<T>(
  url: string,
  loading = true,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    return await runWithLoading(loading, async () => {
      const res = await axiosClient.delete<T>(url, config);
      return res.data;
    });
  } catch (err) {
    throw normalizeApiError(err, "DELETE", url, false);
  }
}
