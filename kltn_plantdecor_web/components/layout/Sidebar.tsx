'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ShoppingBag as ShoppingBagIcon,
  Layers as LayersIcon,
  MiscellaneousServices as ServicesIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
  EventNote as EventNoteIcon,
  Checklist as ChecklistIcon,
  History as HistoryIcon,
  LocalShipping as LocalShippingIcon,
  Logout as LogoutIcon,
  Payment as PaymentIcon,
  Notifications as ReminderIcon,
} from '@mui/icons-material';
import { ACTIVE_SAMPLE_USER_ID, SAMPLE_USERS } from '@/data/sampledata';
import {
  SIDEBAR_ITEMS_BY_ROLE,
  SIDEBAR_LOGOUT_ITEM,
  type SidebarIconKey,
} from '@/lib/constants/sidebar';
import type { UserRole } from '@/lib/constants/header';

const ICONS: Record<SidebarIconKey, ReactNode> = {
  dashboard: <DashboardIcon sx={{ fontSize: 18 }} />,
  users: <PeopleIcon sx={{ fontSize: 18 }} />,
  revenue: <BarChartIcon sx={{ fontSize: 18 }} />,
  settings: <SettingsIcon sx={{ fontSize: 18 }} />,
  products: <ShoppingBagIcon sx={{ fontSize: 18 }} />,
  materials: <LayersIcon sx={{ fontSize: 18 }} />,
  services: <ServicesIcon sx={{ fontSize: 18 }} />,
  orders: <DescriptionIcon sx={{ fontSize: 18 }} />,
  chat: <ChatIcon sx={{ fontSize: 18 }} />,
  requests: <DescriptionIcon sx={{ fontSize: 18 }} />,
  scheduled: <EventNoteIcon sx={{ fontSize: 18 }} />,
  tasks: <ChecklistIcon sx={{ fontSize: 18 }} />,
  history: <HistoryIcon sx={{ fontSize: 18 }} />,
  delivery: <LocalShippingIcon sx={{ fontSize: 18 }} />,
  store: <ShoppingBagIcon sx={{ fontSize: 18 }} />,
  catalog: <LayersIcon sx={{ fontSize: 18 }} />,
  tags: <DescriptionIcon sx={{ fontSize: 18 }} />,
  metrics: <BarChartIcon sx={{ fontSize: 18 }} />,
  payment: <PaymentIcon sx={{ fontSize: 18 }} />,
  reminder: <ReminderIcon sx={{ fontSize: 18 }} />,
  logout: <LogoutIcon sx={{ fontSize: 18 }} />,
};

const isActiveRoute = (pathname: string, href: string, allHrefs: string[]) => {
  if (href === '/') return pathname === '/';
  
  // Exact match
  if (pathname === href) return true;
  
  // Check if current path starts with this href
  if (pathname.startsWith(`${href}/`)) {
    // Make sure no other href is a longer match
    const hasLongerMatch = allHrefs.some(
      (otherHref) =>
        otherHref !== href &&
        otherHref.length > href.length &&
        pathname.startsWith(`${otherHref}/`) ||
        pathname === otherHref
    );
    return !hasLongerMatch;
  }
  
  return false;
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
  const allHrefs = items.map((item) => item.href);
  const activeItem = items.find((item) => isActiveRoute(pathname, item.href, allHrefs));
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
                isActiveRoute(pathname, item.href, allHrefs)
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
