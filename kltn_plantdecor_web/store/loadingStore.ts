import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

/**
 * Loading Store - Global loading state
 * Used by axios interceptor to show/hide loading overlay
 */
export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));
