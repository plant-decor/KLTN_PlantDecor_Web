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
  | 'logout';

export const SIDEBAR_ITEMS_BY_ROLE: Record<UserRole, SidebarItem[]> = {
  guest: [],
  user: [],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { label: 'User Management', href: '/admin/user-management', icon: 'users' },
    { label: 'Revenue', href: '/admin/revenue', icon: 'revenue' },
    { label: 'Setting', href: '/admin/setting', icon: 'settings' },
    { label: 'Product Management', href: '/admin/product-management', icon: 'products' },
    { label: 'Materials Management', href: '/admin/materials-management', icon: 'materials' },
    { label: 'Service Management', href: '/admin/service-management', icon: 'services' },
    { label: 'Order Management', href: '/admin/order-management', icon: 'orders' },
  ],
  staff: [
    { label: 'Dashboard', href: '/staff/dashboard', icon: 'dashboard' },
    { label: 'Chat Management', href: '/staff/chat-management', icon: 'chat' },
    { label: 'Service Request', href: '/staff/service-request', icon: 'requests' },
  ],
  caretaker: [
    { label: 'Scheduled', href: '/caretaker/scheduled', icon: 'scheduled' },
    { label: 'Assign Task', href: '/caretaker/assign-task', icon: 'tasks' },
    { label: 'Care History', href: '/caretaker/care-history', icon: 'history' },
  ],
  shipper: [
    { label: 'Assign Delivery', href: '/shipper/assign-delivery', icon: 'delivery' },
    { label: 'Delivery History', href: '/shipper/delivery-history', icon: 'history' },
  ],
};

export const SIDEBAR_LOGOUT_ITEM: SidebarItem = {
  label: 'Log out',
  href: '/logout',
  icon: 'logout',
};
