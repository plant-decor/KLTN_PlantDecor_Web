import type { UserRole } from '@/lib/constants/header';

export interface SidebarItem {
  label: string;
  href: string;
  icon: SidebarIconKey;
}

export type SidebarIconKey =
  | 'dashboard'
  | 'users'
  | 'revenue'
  | 'settings'
  | 'products'
  | 'materials'
  | 'services'
  | 'orders'
  | 'chat'
  | 'requests'
  | 'scheduled'
  | 'tasks'
  | 'history'
  | 'delivery'
  | 'catalog'
  | 'tags'
  | 'metrics'
  | 'payment'
  | 'reminder'
  | 'store'
  | 'logout';

export const SIDEBAR_ITEMS_BY_ROLE: Record<UserRole, SidebarItem[]> = {
  guest: [],
  user: [],
  admin: [
    { label: 'System Dashboard', href: '/admin', icon: 'dashboard' },
    { label: 'Reminder Management', href: '/admin/reminder-management', icon: 'reminder' },
    { label: 'Service Management', href: '/admin/service-management', icon: 'services' },
    { label: 'User Management', href: '/admin/user-management', icon: 'users' },
    { label: 'Store Management', href: '/admin/store-management', icon: 'store' },
    { label: 'Setting', href: '/admin/setting', icon: 'settings' },
  ],
  manager: [
    { label: 'Store Dashboard', href: '/manager', icon: 'dashboard' },
    { label: 'Store Metrics', href: '/manager/store-metrics', icon: 'metrics' },
    { label: 'Store Catalog', href: '/manager/store-catalog', icon: 'catalog' },
    { label: 'Categories & Tags', href: '/manager/categories-tags', icon: 'tags' },
    { label: 'Store Users', href: '/manager/store-users', icon: 'users' },
    { label: 'Sales Orders', href: '/manager/sales-orders', icon: 'orders' },
    { label: 'Service Orders', href: '/manager/service-orders', icon: 'services' },
    { label: 'Store Payment', href: '/manager/store-payment', icon: 'payment' },
  ],
  staff: [
    { label: 'Dashboard', href: '/staff', icon: 'dashboard' },
    { label: 'Chat Management', href: '/staff/chat-management', icon: 'chat' },
    { label: 'Service Request', href: '/staff/service-request', icon: 'requests' },
    { label: 'Service Process', href: '/staff/service-process', icon: 'scheduled' },
  ],
  caretaker: [
    { label: 'Dashboard', href: '/caretaker', icon: 'dashboard' },
    { label: 'Scheduled', href: '/caretaker/scheduled', icon: 'scheduled' },
    { label: 'Assign Task', href: '/caretaker/assign-task', icon: 'tasks' },
    { label: 'Care History', href: '/caretaker/care-history', icon: 'history' },
  ],
  shipper: [
    { label: 'Dashboard', href: '/shipper', icon: 'dashboard' },
    { label: 'Assign Delivery', href: '/shipper/assign-delivery', icon: 'delivery' },
    { label: 'Delivery History', href: '/shipper/delivery-history', icon: 'history' },
  ],
};

export const SIDEBAR_LOGOUT_ITEM: SidebarItem = {
  label: 'Log out',
  href: '/logout',
  icon: 'logout',
};
