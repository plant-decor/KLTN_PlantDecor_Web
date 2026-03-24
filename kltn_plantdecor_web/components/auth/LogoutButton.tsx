'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { logoutAction } from '@/app/actions/loginAction';
import { clearClientAccessToken } from '@/lib/axios/tokenStorage';

/**
 * Logout Button Component
 * 
 * Khi click:
 * 1. Gọi Server Action để xóa cookies
 * 2. Clear Zustand store
 * 3. Redirect tới login page
 */
export default function LogoutButton() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const { clearUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      // Gọi Server Action để xóa cookies
      const result = await logoutAction();

      if (result.success) {
        // Clear Zustand store
        clearUser();
        clearClientAccessToken();

        const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
        const loginPath = locale ? `/${locale}/login` : '/login';
        router.replace(loginPath);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
    >
      Đăng xuất
    </button>
  );
}
