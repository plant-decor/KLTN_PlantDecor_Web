'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import LogoutButton from '@/components/LogoutButton';

/**
 * Header Component (Updated)
 * 
 * Hiển thị user info từ Zustand store
 * Cho phép logout
 */
export default function Header() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-16 bg-white border-b" />;
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-green-600">🌿 Plant Decor</h1>
          </div>

          {/* Right side: User Info + Logout */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Avatar */}
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* User Name */}
                <span className="text-sm font-medium text-gray-900">
                  {user.name}
                </span>

                {/* Logout Button */}
                <LogoutButton />
              </>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Đăng nhập
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
