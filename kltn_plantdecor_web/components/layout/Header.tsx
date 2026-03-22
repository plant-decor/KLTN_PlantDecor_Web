'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import CartBadge from '@/components/cart/CartBadge';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import Navigation from './Navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from '@/i18n/navigation';
import { GUEST_ACTIONS, USER_MENU_ITEMS } from '@/lib/constants/header';
import { logoutAction } from '@/app/actions/loginAction';
import { InputAdornment, TextField } from '@mui/material';
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import type { CategoryResponse } from '@/lib/api/categoriesService';

/**
 * Header Component (Integrated with Navigation)
 *
 * Displays:
 * - Logo + Cart + User Info (Header section)
 * - Role-based Navigation menu
 * - Language Switcher (VI / EN)
 */

const resolveHref = (href: string, userId?: number | null) => {
  if (/\[(userid|userId)\]/.test(href)) {
    return userId
      ? href.replace(/\[(userid|userId)\]/g, String(userId))
      : `/login?redirectTo=${encodeURIComponent(href)}`;
  }
  return href;
};

interface HeaderProps {
  initialStoreCategories?: CategoryResponse[];
}

export default function Header({ initialStoreCategories = [] }: HeaderProps) {
  const { user, clearAll } = useAuthStore();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const isUser = !!user;
  const isGuest = !user;
  const userId = user?.id || null;
  const avatarLabel = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const t = useTranslations('common');
  const tAuth = useTranslations('auth');

  // Check if user has notification access (staff, manager, admin, shipper, caretaker)
  const hasNotificationAccess = user && ['ADMIN', 'MANAGER', 'STAFF', 'SHIPPER', 'CARETAKER'].includes(user.role?.toUpperCase() || '');

  const handleLogout = async () => {
    try {
      const result = await logoutAction();

      if (result.success) {
        // Clear Zustand store (user + tokens)
        clearAll();
        setIsUserMenuOpen(false);

        const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
        const loginPath = locale ? `/${locale}/login` : '/login';
        router.replace(loginPath);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Top Header Section — tablet & desktop only */}
      <header className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="shrink-0">
              <Link href="/">
                <h1 className="text-xl lg:text-2xl font-bold text-green-600">🌿 Plant Decor</h1>
              </Link>
            </div>

            {/* Right side: Search + Language + Cart + User */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search Bar — narrower on tablet, wider on desktop */}
              <TextField
                id="search"
                variant="standard"
                placeholder={t('searchPlaceholder')}
                sx={{ m: 1, width: { md: '18ch', lg: '28ch' } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className="text-gray-500" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Cart Badge */}
              <CartBadge />

              {/* Notification Bell (for staff, manager, admin, shipper, caretaker) */}
              {hasNotificationAccess && <NotificationBell />}

              {/* Auth Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                {isGuest && (
                  <>
                    <Link
                      href={GUEST_ACTIONS.login.href}
                      className="text-gray-700 hover:text-green-600 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                    >
                      {tAuth('login')}
                    </Link>
                    <Link
                      href={GUEST_ACTIONS.register.href}
                      className="bg-green-600 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                    >
                      {tAuth('register')}
                    </Link>
                  </>
                )}

                {isUser && (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen((open) => !open)}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 text-gray-700 hover:text-green-600"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                        {avatarLabel}
                      </span>
                      <ExpandMoreIcon sx={{ fontSize: 16 }} />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-100 bg-white py-2 shadow-lg z-50">
                        {USER_MENU_ITEMS.map((item) =>
                          item.href === '/logout' ? (
                            <button
                              key={item.label}
                              type="button"
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              onClick={handleLogout}
                            >
                              {item.label}
                            </button>
                          ) : (
                            <Link
                              key={item.label}
                              href={resolveHref(item.href, userId)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Section */}
      <Navigation initialStoreCategories={initialStoreCategories} />
    </>
  );
}
