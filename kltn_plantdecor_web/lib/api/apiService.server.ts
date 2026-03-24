import { createAxiosServer } from "@/lib/axios/axiosServer";
import type { AxiosRequestConfig } from "axios";
import { normalizeApiError } from "@/lib/api/apiService.shared";

export async function get<T>(
  url: string,
  params: AxiosRequestConfig["params"] = undefined,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const http = await createAxiosServer();
    const res = await http.get<T>(url, { ...config, params });
    return res.data;
  } catch (err) {
    throw normalizeApiError(err, "GET", url, true);
  }
}

export async function post<T>(
  url: string,
  data: unknown = undefined,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const http = await createAxiosServer();
    const res = await http.post<T>(url, data, config);
    return res.data;
  } catch (err) {
    throw normalizeApiError(err, "POST", url, true);
  }
}

export async function put<T>(
  url: string,
  data: unknown = undefined,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const http = await createAxiosServer();
    const res = await http.put<T>(url, data, config);
    return res.data;
  } catch (err) {
    throw normalizeApiError(err, "PUT", url, true);
  }
}

export async function patch<T>(
  url: string,
  data: unknown = undefined,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const http = await createAxiosServer();
    const res = await http.patch<T>(url, data, config);
    return res.data;
  } catch (err) {
    throw normalizeApiError(err, "PATCH", url, true);
  }
}

export async function del<T>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const http = await createAxiosServer();
    const res = await http.delete<T>(url, config);
    return res.data;
  } catch (err) {
    throw normalizeApiError(err, "DELETE", url, true);
  }
}
