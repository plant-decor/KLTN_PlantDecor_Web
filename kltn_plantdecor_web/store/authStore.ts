import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

/**
 * Zustand Store cho Authentication (Cookie-Based)
 * 
 * ⚠️ QUAN TRỌNG: Chỉ lưu UserInfo (dữ liệu KHÔNG nhạy cảm)
 * - Token được lưu trong HTTP-Only Cookie (không thể truy cập từ JS)
 * - RefreshToken cũng được lưu trong Cookie
 * - Client chỉ cần biết: user info (tên, avatar...) để hiển thị UI
 */
interface AuthState {
  // Chỉ lưu user info (dữ liệu không nhạy cảm)
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  getUser: () => User | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      getUser: () => {
        return get().user;
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
