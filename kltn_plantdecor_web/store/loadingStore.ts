import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  isLoadingFlag: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoading: (loading: boolean) => void;
  setIsLoadingFlag: (isLoadingFlag: boolean) => void;
}

/**
 * Loading Store - Global loading state
 * Used by axios interceptor to show/hide loading overlay
 */
export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  isLoadingFlag: true,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setIsLoadingFlag: (isLoadingFlag: boolean) => set({ isLoadingFlag }),
}));
