'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import CartBadge from '@/components/cart/CartBadge';
// import { NotificationBell } from '@/components/notifications/NotificationBell';
import Navigation from './Navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from '@/i18n/navigation';
import { GUEST_ACTIONS, USER_MENU_ITEMS } from '@/lib/constants/header';
import { logoutAction } from '@/app/actions/loginAction';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import type { CategoryResponse } from '@/lib/api/categoriesService';
import Image from 'next/image';
import HeaderUnifiedSearch from './HeaderUnifiedSearch';

const USER_MENU_LABEL_KEYS: Record<string, string> = {
  '/profile/[userid]': 'profile',
  '/orders/[userid]': 'orderHistory',
  '/wishlist/[userid]': 'wishlist',
  '/logout': 'logout',
};

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
  const avatarImageSrc = user?.avatar?.trim() || null;
  const avatarLabel = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const [hasAvatarImageError, setHasAvatarImageError] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const tAuth = useTranslations('auth');
  const tUserMenu = useTranslations('headerUserMenu');

  useEffect(() => {
    setHasAvatarImageError(false);
  }, [avatarImageSrc]);

  const getUserMenuLabel = (href: string) => {
    const key = USER_MENU_LABEL_KEYS[href];
    return key ? tUserMenu(key) : href;
  };

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
      <header className="hidden md:block relative z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="shrink-0">
              <Link href="/" className="border-none! block w-32 lg:w-44 h-10 lg:h-12 overflow-hidden">
                <Image src="/logo/logo-landscape.png" 
                  alt="Plant Decor Logo"
                  width={176}
                  height={48}
                  className="w-full h-full object-cover object-center scale-[1.25] lg:scale-[1.35] border-none!"
                />
              </Link>
            </div>

            {/* Right side: Search + Language + Cart + User */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search Bar — narrower on tablet, wider on desktop */}
              <HeaderUnifiedSearch />

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Cart Badge */}
              <CartBadge />

              {/* Notification Bell (for staff, manager, admin, shipper, caretaker) */}
              {/* {hasNotificationAccess && <NotificationBell />} */}

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
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 text-gray-700 hover:text-green-600 hover:bg-primary"
                    >
                      {avatarImageSrc && !hasAvatarImageError ? (
                        <Image
                          src={avatarImageSrc}
                          width={32}
                          height={32}
                          alt={user?.name || 'User avatar'}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={() => setHasAvatarImageError(true)}
                        />
                      ) : (
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                          {avatarLabel}
                        </span>
                      )}
                      <ExpandMoreIcon sx={{ fontSize: 16 }} />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-100 bg-white py-2 shadow-lg z-99999">
                        {USER_MENU_ITEMS.map((item) =>
                          item.href === '/logout' ? (
                            <button
                              key={item.label}
                              type="button"
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              onClick={handleLogout}
                            >
                              {getUserMenuLabel(item.href)}
                            </button>
                          ) : (
                            <Link
                              key={item.label}
                              href={resolveHref(item.href, userId)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {getUserMenuLabel(item.href)}
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
