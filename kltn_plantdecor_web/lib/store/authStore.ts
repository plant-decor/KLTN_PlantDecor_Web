import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

/**
 * Zustand Store cho Authentication
 *
 * ✅ KIẾN TRÚC MỚI - Lưu Token trong Zustand Store
 * - accessToken: Lưu trong memory (không persist) → Bảo mật cao nhất
 * - refreshToken: Persist vào localStorage → Tự động refresh sau F5
 * - User info: Persist vào localStorage → Giữ trạng thái đăng nhập
 *
 * 🔐 BẢO MẬT:
 * - accessToken không persist → Token ngắn hạn, bảo mật cao
 * - refreshToken persist → Cho phép silent refresh sau reload trang
 *
 * ⚡ HIỆU NĂNG:
 * - Zustand store nhanh hơn localStorage (không I/O disk)
 * - Không cần JSON.parse/stringify mỗi lần đọc/ghi
 */
interface AuthState {
  // User info (persist)
  user: User | null;
  isAuthenticated: boolean;

  // Tokens (memory only - không persist)
  accessToken: string | null;
  refreshToken: string | null;

  // User Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  getUser: () => User | null;

  // Token Actions
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  clearTokens: () => void;
  clearAll: () => void; // Clear both user and tokens
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // User state (will be persisted)
      user: null,
      isAuthenticated: false,

      // Token state (will NOT be persisted)
      accessToken: null,
      refreshToken: null,

      // User actions
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

      // Token actions
      setAccessToken: (token: string) => {
        set({ accessToken: token });
      },

      setRefreshToken: (token: string) => {
        set({ refreshToken: token });
      },

      getAccessToken: () => {
        return get().accessToken;
      },

      getRefreshToken: () => {
        return get().refreshToken;
      },

      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
        });
      },

      clearAll: () => {
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Persist user info + refreshToken (accessToken vẫn giữ trong memory)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        refreshToken: state.refreshToken, // ✅ Persist refreshToken để không mất sau F5
      }),
    }
  )
);
