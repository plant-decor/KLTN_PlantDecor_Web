'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import {
  GUEST_ACTIONS,
  NAV_ITEMS_BY_ROLE,
  USER_ACTIONS,
  USER_MENU_ITEMS,
  type HeaderIconKey,
} from '@/lib/constants/header';
import { ACTIVE_SAMPLE_USER_ID, SAMPLE_USERS } from '@/data/sampledata';

const ICONS: Record<HeaderIconKey, ReactNode> = {
  home: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5l9-7 9 7V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
    </svg>
  ),
  store: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18l-1 12a2 2 0 01-2 2H6a2 2 0 01-2-2L3 7zm2-3h14l2 3H3l2-3z" />
    </svg>
  ),
  services: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
    </svg>
  ),
  contact: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2l2 5-2 1a11 11 0 005 5l1-2 5 2v2a2 2 0 01-2 2h-1C9.163 18 6 14.837 6 11V10a2 2 0 012-2z" />
    </svg>
  ),
  about: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
  myPlant: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21v-7m0 0c-3 0-5-2-5-5 0-2 1-4 3-5 2 1 4 3 4 5m-2 5c3 0 5-2 5-5 0-2-1-4-3-5-2 1-4 3-4 5" />
    </svg>
  ),
  ai: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6M9 21h6M4 9v6M20 9v6M7 7h10v10H7z" />
    </svg>
  ),
};

const resolveHref = (href: string, userId?: number | null) => {
  if (href.includes('[userid]')) {
    return userId ? href.replace('[userid]', String(userId)) : '#';
  }
  return href;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join('') || 'U';
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const activeUser = useMemo(
    () => SAMPLE_USERS.find((user) => user.id === ACTIVE_SAMPLE_USER_ID) || null,
    []
  );
  const role = activeUser?.role ?? 'guest';
  const navItems = NAV_ITEMS_BY_ROLE[role] ?? NAV_ITEMS_BY_ROLE.guest;
  const isGuest = role === 'guest';
  const isUser = role === 'user';
  const userId = activeUser?.id ?? null;
  const avatarLabel = activeUser?.userName ? getInitials(activeUser.userName) : 'U';

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Plant Decor</span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={resolveHref(item.href, userId)}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
              >
                {ICONS[item.icon]}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {isGuest && (
              <>
                <Link href={GUEST_ACTIONS.login.href} className="text-gray-700 hover:text-green-600 transition-colors duration-200">
                  {GUEST_ACTIONS.login.label}
                </Link>
                <Link
                  href={GUEST_ACTIONS.register.href}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  {GUEST_ACTIONS.register.label}
                </Link>
              </>
            )}
            {isUser && (
              <>
                <Link
                  href={resolveHref(USER_ACTIONS.cart.href, userId)}
                  className="inline-flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.6 3M7 13h10l4-8H5.6M7 13l-1.5 6h13L17 13M7 13l-2-7M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                    />
                  </svg>
                  <span>{USER_ACTIONS.cart.label}</span>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 text-gray-700 hover:text-green-600"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                      {avatarLabel}
                    </span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-100 bg-white py-2 shadow-lg z-9999">
                      {USER_MENU_ITEMS.map((item) => (
                        <Link
                          key={item.label}
                          href={resolveHref(item.href, userId)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none focus:text-green-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={resolveHref(item.href, userId)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-green-600"
                >
                  {ICONS[item.icon]}
                  <span>{item.label}</span>
                </Link>
              ))}
              {isGuest && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <Link href={GUEST_ACTIONS.login.href} className="block px-3 py-2 text-gray-700 hover:text-green-600">
                    {GUEST_ACTIONS.login.label}
                  </Link>
                  <Link href={GUEST_ACTIONS.register.href} className="block px-3 py-2 text-green-600 font-medium">
                    {GUEST_ACTIONS.register.label}
                  </Link>
                </div>
              )}
              {isUser && (
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                  <Link
                    href={resolveHref(USER_ACTIONS.cart.href, userId)}
                    className="block px-3 py-2 text-gray-700 hover:text-green-600"
                  >
                    {USER_ACTIONS.cart.label}
                  </Link>
                  {USER_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.label}
                      href={resolveHref(item.href, userId)}
                      className="block px-3 py-2 text-gray-700 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}