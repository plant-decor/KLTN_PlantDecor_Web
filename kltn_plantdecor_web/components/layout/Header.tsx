'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import CartBadge from '@/components/Cart/CartBadge';
import Navigation from './Navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from '@/i18n/navigation';
import { GUEST_ACTIONS, USER_MENU_ITEMS } from '@/lib/constants/header';
import { InputAdornment, TextField } from '@mui/material';
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

/**
 * Header Component (Integrated with Navigation)
 *
 * Displays:
 * - Logo + Cart + User Info (Header section)
 * - Role-based Navigation menu
 * - Language Switcher (VI / EN)
 */

const resolveHref = (href: string, userId?: number | null) => {
  if (href.includes('[userid]')) {
    return userId ? href.replace('[userid]', String(userId)) : '#';
  }
  return href;
};

export default function Header() {
  const { user } = useAuthStore();
  const isUser = !!user;
  const isGuest = !user;
  const userId = user?.id || null;
  const avatarLabel = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('common');
  const tAuth = useTranslations('auth');

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-16 bg-white border-b" />;
  }

  return (
    <>
      {/* Top Header Section — tablet & desktop only */}
      <header className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex-shrink-0">
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

              {/* Auth Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                {isGuest && (
                  <>
                    <Link
                      href={GUEST_ACTIONS.login.href as any}
                      className="text-gray-700 hover:text-green-600 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                    >
                      {tAuth('login')}
                    </Link>
                    <Link
                      href={GUEST_ACTIONS.register.href as any}
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
                        {USER_MENU_ITEMS.map((item) => (
                          <Link
                            key={item.label}
                            href={resolveHref(item.href, userId) as any}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
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
      <Navigation />
    </>
  );
}
