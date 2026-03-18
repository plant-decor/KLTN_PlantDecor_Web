import axios from 'axios';
import { toast } from 'react-toastify';
import { useLoadingStore } from '@/store/loadingStore';

declare module 'axios' {
  interface AxiosRequestConfig {
    showLoading?: boolean;
    skipToast?: boolean;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  }
}

const methodsWithoutSuccessToast = new Set(['get', 'head', 'options']);

const extractResponseMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('message' in payload && typeof payload.message === 'string') {
    const message = payload.message.trim();
    return message ? message : null;
  }

  return null;
};

const shouldShowSuccessToast = (method?: string, showSuccessToast?: boolean, skipToast?: boolean) => {
  if (skipToast || showSuccessToast === false) {
    return false;
  }

  if (showSuccessToast === true) {
    return true;
  }

  if (!method) {
    return true;
  }

  return !methodsWithoutSuccessToast.has(method.toLowerCase());
};

const shouldShowErrorToast = (showErrorToast?: boolean, skipToast?: boolean) => {
  if (skipToast || showErrorToast === false) {
    return false;
  }

  return true;
};

const internalAxiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

internalAxiosInstance.interceptors.request.use(
  (config) => {
    const { isLoadingFlag, setIsLoading } = useLoadingStore.getState();

    if (isLoadingFlag && config.showLoading !== false) {
      setIsLoading(true);
    }

    return config;
  },
  (error) => {
    const { setIsLoading } = useLoadingStore.getState();
    setIsLoading(false);
    return Promise.reject(error);
  }
);

internalAxiosInstance.interceptors.response.use(
  (response) => {
    const { setIsLoading } = useLoadingStore.getState();
    setIsLoading(false);

    const responseMessage = extractResponseMessage(response.data);
    if (
      responseMessage &&
      shouldShowSuccessToast(
        response.config.method,
        response.config.showSuccessToast,
        response.config.skipToast
      )
    ) {
      toast.success(responseMessage);
    }

    return response;
  },
  (error) => {
    const { setIsLoading } = useLoadingStore.getState();
    setIsLoading(false);

    const errorMessage =
      extractResponseMessage(error.response?.data) ||
      (typeof error.message === 'string' && error.message.trim() ? error.message : null);

    if (errorMessage && shouldShowErrorToast(error.config?.showErrorToast, error.config?.skipToast)) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default internalAxiosInstance;
