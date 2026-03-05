'use client';

import { useState, type ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import CartBadge from '@/components/cart/CartBadge';
import LanguageSwitcher from './LanguageSwitcher';
import { InputAdornment, TextField } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  Home as HomeIcon,
  Storefront as StorefrontIcon,
  MiscellaneousServices as ServicesIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  LocalFlorist as LocalFloristIcon,
  SmartToy as SmartToyIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  GUEST_ACTIONS,
  HeaderNavItem,
  NAV_ITEMS_BY_ROLE,
  USER_ACTIONS,
  UserRole,
  USER_MENU_ITEMS,
  type HeaderIconKey,
} from '@/lib/constants/header';
import { useAuthStore } from '@/store/authStore';

// Maps nav item icon key → translation key in 'nav' namespace
const NAV_LABEL_KEYS: Record<HeaderIconKey, string> = {
  home: 'home',
  store: 'plantStore',
  services: 'services',
  contact: 'contact',
  about: 'about',
  myPlant: 'myPlant',
  ai: 'aiRecommendation',
};

const ICONS: Record<HeaderIconKey, ReactNode> = {
  home: <HomeIcon sx={{ fontSize: 20 }} />,
  store: <StorefrontIcon sx={{ fontSize: 20 }} />,
  services: <ServicesIcon sx={{ fontSize: 20 }} />,
  contact: <PhoneIcon sx={{ fontSize: 20 }} />,
  about: <InfoIcon sx={{ fontSize: 20 }} />,
  myPlant: <LocalFloristIcon sx={{ fontSize: 20 }} />,
  ai: <SmartToyIcon sx={{ fontSize: 20 }} />,
};

const resolveHref = (href: string, userId?: number | null) => {
  if (/\[(userid|userId)\]/.test(href)) {
    if (userId) {
      return href.replace(/\[(userid|userId)\]/g, String(userId));
    }

    return `/login?redirectTo=${encodeURIComponent(href)}`;
  }

  return href;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join('') || 'U';
};

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const tNav = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  // Use authenticated user or null (guest)
  const activeUser = user || null;

  const role = (activeUser?.role ?? ('guest' as const));
  const navItems: HeaderNavItem[] = NAV_ITEMS_BY_ROLE[role as UserRole] ?? NAV_ITEMS_BY_ROLE.guest;
  const isGuest = role === 'guest';
  const isUser = role === 'user';
  const userId = activeUser?.id ?? null;
  const avatarLabel = activeUser?.email ? getInitials(activeUser.email) : 'U';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tablet + Desktop Navigation */}
        <div className="hidden md:flex items-center justify-around h-12">
          {/* Navigation Items */}
          <div className="flex items-center gap-1 lg:gap-6">
            {navItems.map((item:any) => (
              <Link
                key={item.icon}
                href={resolveHref(item.href, userId) as any}
                className="inline-flex items-center gap-1.5 lg:gap-2 text-gray-700 hover:text-green-600 transition-colors duration-200 hover:bg-green-50 px-2.5 lg:px-4 py-2 rounded-full"
              >
                <span className="hidden lg:inline-flex">{ICONS[item.icon as HeaderIconKey]}</span>
                <span className="text-xs lg:text-sm font-semibold whitespace-nowrap">
                  {tNav(NAV_LABEL_KEYS[item.icon as HeaderIconKey] as any)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Mobile Header Bar ── */}
        <div className="md:hidden flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-600">🌿 Plant Decor</span>
          </Link>

          {/* Right side: Cart + Language + Hamburger */}
          <div className="flex items-center gap-3">
            <CartBadge />
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none p-1"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-gray-100">

            {/* Search */}
            <div className="pt-3 px-2">
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                placeholder={tCommon('searchPlaceholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-gray-400" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Nav Links */}
            <div className="pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.icon}
                  href={resolveHref(item.href, userId) as any}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {ICONS[item.icon as HeaderIconKey]}
                  <span className="text-sm font-medium">
                    {tNav(NAV_LABEL_KEYS[item.icon as HeaderIconKey] as any)}
                  </span>
                </Link>
              ))}
            </div>

            {/* Auth Actions */}
            <div className="border-t border-gray-100 pt-3 mt-1 px-4 space-y-2">
              {isGuest && (
                <>
                  <Link
                    href={GUEST_ACTIONS.login.href as any}
                    className="block w-full text-center py-2 rounded-lg border border-green-600 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {tAuth('login')}
                  </Link>
                  <Link
                    href={GUEST_ACTIONS.register.href as any}
                    className="block w-full text-center py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {tAuth('register')}
                  </Link>
                </>
              )}

              {isUser && (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                      {avatarLabel}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{activeUser?.email}</span>
                  </div>
                  {USER_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.label}
                      href={resolveHref(item.href, userId) as any}
                      className="block px-2 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg text-sm transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
