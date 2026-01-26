import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getDeviceId } from '@/lib/utils/deviceId';
import type { User } from '@/types/auth.types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  user: User | null;
  deviceId: string;
  
  // Actions
  setTokens: (token: string, refreshToken: string, expiresIn: number, user?: User) => void;
  clearTokens: () => void;
  isTokenExpired: () => boolean;
  getToken: () => string | null;
  setUser: (user: User) => void;
  getDeviceId: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      tokenExpiry: null,
      isAuthenticated: false,
      user: null,
      deviceId: typeof window !== 'undefined' ? getDeviceId() : '',

      setTokens: (token: string, refreshToken: string, expiresIn: number, user?: User) => {
        const expiryTime = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds
        set({
          token,
          refreshToken,
          tokenExpiry: expiryTime,
          isAuthenticated: true,
          user: user || get().user,
        });
      },

      clearTokens: () => {
        set({
          token: null,
          refreshToken: null,
          tokenExpiry: null,
          isAuthenticated: false,
          user: null,
        });
      },

      isTokenExpired: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return true;
        return Date.now() >= tokenExpiry;
      },

      getToken: () => {
        const { token, isTokenExpired } = get();
        if (isTokenExpired()) {
          return null;
        }
        return token;
      },

      setUser: (user: User) => {
        set({ user });
      },

      getDeviceId: () => {
        return get().deviceId;
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
