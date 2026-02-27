'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logoutAction } from '@/app/actions/loginAction';

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
  const { clearUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      // Gọi Server Action để xóa cookies
      const result = await logoutAction();

      if (result.success) {
        // Clear Zustand store
        clearUser();

        // Redirect sẽ được xử lý bởi Server Action
        // Nhưng để chắc chắn:
        router.push('/login');
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
