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
  | 'inventory'
  | 'logout';

export const SIDEBAR_ITEMS_BY_ROLE: Record<UserRole, SidebarItem[]> = {
  guest: [],
  customer: [],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { label: 'User Management', href: '/admin/user-management', icon: 'users' },
    { label: 'Nursery Management', href: '/admin/nursery-management', icon: 'inventory' },
    { label: 'Product Management', href: '/admin/store-management', icon: 'store' },
    { label: 'Plant Care Management', href: '/admin/plant-guide-management', icon: 'tasks' },
    { label: 'Service Package Management', href: '/admin/service-management', icon: 'services' },
    { label: 'Specialization Management', href: '/admin/specializations-management', icon: 'catalog' },
    { label: 'Categories & Tags', href: '/admin/categories-tags', icon: 'tags' },
    // { label: 'Reminder Management', href: '/admin/reminder-management', icon: 'reminder' },
    { label: 'Settings', href: '/admin/setting', icon: 'settings' },
  ],
  manager: [
    { label: 'Dashboard', href: '/manager', icon: 'dashboard' },
    { label: 'Store Metrics', href: '/manager/store-metrics', icon: 'metrics' },
    { label: 'Store Staff', href: '/manager/store-users', icon: 'users' },
    { label: 'Product Catalog', href: '/manager/store-catalog', icon: 'catalog' },
    { label: 'Care Service Management', href: '/manager/care-service-management', icon: 'services' },
    { label: 'Sales Orders', href: '/manager/sales-orders', icon: 'orders' },
    { label: 'Store Payment', href: '/manager/store-payment', icon: 'payment' },
    { label: 'Service Schedule', href: '/manager/schedule-services', icon: 'scheduled' },
    { label: 'Service Orders', href: '/manager/service-orders', icon: 'requests' },
    { label: 'Nursery Profile', href: '/manager/nursery-profile', icon: 'inventory' },
  ],
  staff: [
    { label: 'Dashboard', href: '/staff', icon: 'dashboard' },
    { label: 'Caretaker Management', href: '/staff/caretaker-management', icon: 'users'},
    { label: 'Service Requests', href: '/staff/service-request', icon: 'requests' },
    { label: 'Service Progress', href: '/staff/service-progress', icon: 'scheduled' },
    { label: 'Current Nursery Inventory', href: '/staff/inventory-current-nursery', icon: 'store' },
    { label: 'Cross-Nursery Inventory', href: '/staff/inventory-cross-nursery', icon: 'store' },
  ],
  consultant: [
    { label: 'Dashboard', href: '/consultant', icon: 'dashboard' },
    { label: 'Chat Support', href: '/consultant/chat-support', icon: 'chat' },
    { label: 'Customer Orders', href: '/consultant/customer-orders', icon: 'orders' },
    { label: 'Products & Inventory', href: '/consultant/products-inventory', icon: 'products' },
  ],
  caretaker: [
    { label: 'Dashboard', href: '/caretaker', icon: 'dashboard' },
    { label: 'Schedule', href: '/caretaker/scheduled', icon: 'scheduled' },
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
  label: 'Logout',
  href: '/logout',
  icon: 'logout',
};
