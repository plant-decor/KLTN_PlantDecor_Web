import internalAxiosInstance from '@/lib/api/internalAxiosInstance';
import { useLoadingStore } from '@/store/loadingStore';
import type { ResponseModel } from '@/types/api.types';

export const get = async <T>(
  url: string,
  params?: unknown,
  loading?: boolean
): Promise<ResponseModel<T>> => {
  try {
    const showLoading = loading ?? true;
    useLoadingStore.getState().setIsLoadingFlag(showLoading);
    const response = await internalAxiosInstance.get<ResponseModel<T>>(url, {
      params,
      showLoading,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

export const post = async <T>(
  url: string,
  data?: unknown,
  loading?: boolean
): Promise<ResponseModel<T>> => {
  try {
    const showLoading = loading ?? true;
    useLoadingStore.getState().setIsLoadingFlag(showLoading);
    const response = await internalAxiosInstance.post<ResponseModel<T>>(url, data, {
      showLoading,
    });
    return response.data;
  } catch (error) {
    console.error(`Error posting to ${url}:`, error);
    throw error;
  }
};

export const put = async <T>(
  url: string,
  data?: unknown,
  loading?: boolean
): Promise<ResponseModel<T>> => {
  try {
    const showLoading = loading ?? true;
    useLoadingStore.getState().setIsLoadingFlag(showLoading);
    const response = await internalAxiosInstance.put<ResponseModel<T>>(url, data, {
      showLoading,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating ${url}:`, error);
    throw error;
  }
};

export const patch = async <T>(
  url: string,
  data?: unknown,
  loading?: boolean
): Promise<ResponseModel<T>> => {
  try {
    const showLoading = loading ?? true;
    useLoadingStore.getState().setIsLoadingFlag(showLoading);
    const response = await internalAxiosInstance.patch<ResponseModel<T>>(url, data, {
      showLoading,
    });
    return response.data;
  } catch (error) {
    console.error(`Error patching ${url}:`, error);
    throw error;
  }
};

export const del = async <T>(
  url: string,
  loading?: boolean,
  data?: unknown
): Promise<ResponseModel<T>> => {
  try {
    const showLoading = loading ?? true;
    useLoadingStore.getState().setIsLoadingFlag(showLoading);
    const response = await internalAxiosInstance.delete<ResponseModel<T>>(url, {
      showLoading,
      data,
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting ${url}:`, error);
    throw error;
  }
};
