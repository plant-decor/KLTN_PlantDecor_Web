'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';
import { ACTIVE_SAMPLE_USER_ID, SAMPLE_USERS } from '@/data/sampledata';
import {
  SIDEBAR_ITEMS_BY_ROLE,
  SIDEBAR_LOGOUT_ITEM,
  type SidebarIconKey,
} from '@/lib/constants/sidebar';
import type { UserRole } from '@/lib/constants/header';

const ICONS: Record<SidebarIconKey, ReactNode> = {
  dashboard: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h7v7H4V4zm9 0h7v11h-7V4zM4 13h7v7H4v-7zm9 5h7" />
    </svg>
  ),
  users: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m9-10a4 4 0 11-8 0 4 4 0 018 0zm9 10v-2a4 4 0 00-3-3.87" />
    </svg>
  ),
  revenue: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 15l4-4 3 3 5-7" />
    </svg>
  ),
  settings: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6a3 3 0 100 6 3 3 0 000-6zm8 3l-2 1 1 2-2 2-2-1-1 2h-3l-1-2-2 1-2-2 1-2-2-1 1-3 2-1-1-2 2-2 2 1 1-2h3l1 2 2-1 2 2-1 2 2 1-1 3z" />
    </svg>
  ),
  products: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16l-1 12H5L4 7zm2-3h12l2 3H4l2-3z" />
    </svg>
  ),
  materials: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v4H4V4zm0 6h16v10H4V10z" />
    </svg>
  ),
  services: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
    </svg>
  ),
  orders: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
    </svg>
  ),
  chat: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 8l-4-4V4a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H7z" />
    </svg>
  ),
  requests: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h5M5 3h14a2 2 0 012 2v14l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  ),
  scheduled: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 5h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  ),
  tasks: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3L22 4M3 7h6M3 12h6M3 17h6" />
    </svg>
  ),
  history: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M3 12a9 9 0 1115.6 6M3 12H1" />
    </svg>
  ),
  delivery: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h11v10H3V6zm11 3h4l3 3v4h-7V9zM7 20a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  ),
  logout: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
    </svg>
  ),
};

const isActiveRoute = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role?: UserRole;
}

export default function Sidebar({ isOpen, onClose, role }: SidebarProps) {
  const pathname = usePathname();
  const activeUser = useMemo(
    () => SAMPLE_USERS.find((user) => user.id === ACTIVE_SAMPLE_USER_ID) || null,
    []
  );
  const resolvedRole = role ?? activeUser?.role ?? 'guest';
  const items = SIDEBAR_ITEMS_BY_ROLE[resolvedRole] ?? [];
  const activeItem = items.find((item) => isActiveRoute(pathname, item.href));
  const headerLabel = activeItem?.label ?? 'Dashboard';

  if (items.length === 0) {
    return null;
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white shadow-lg transition-transform duration-200 ease-out lg:static lg:h-full lg:translate-x-0 lg:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <div className="text-lg font-semibold text-gray-900">{headerLabel}</div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label="Close sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 px-6 pb-6">
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute(pathname, item.href)
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
              }`}
              onClick={onClose}
            >
              <span className="text-gray-500">{ICONS[item.icon]}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100 px-6 py-4">
        <Link
          href={SIDEBAR_LOGOUT_ITEM.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600"
          onClick={onClose}
        >
          <span className="text-gray-500">{ICONS[SIDEBAR_LOGOUT_ITEM.icon]}</span>
          <span>{SIDEBAR_LOGOUT_ITEM.label}</span>
        </Link>
      </div>
    </aside>
  );
}
