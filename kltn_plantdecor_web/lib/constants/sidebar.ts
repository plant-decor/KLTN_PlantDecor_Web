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
    { label: 'Bảng điều khiển hệ thống', href: '/admin', icon: 'dashboard' },
    { label: 'Quản lý vựa', href: '/admin/nursery-management', icon: 'inventory' },
    { label: 'Quản lý nhắc nhở', href: '/admin/reminder-management', icon: 'reminder' },
    { label: 'Quản lý dịch vụ', href: '/admin/service-management', icon: 'services' },
    { label: 'Quản lý chuyên môn', href: '/admin/specializations-management', icon: 'catalog' },
    { label: 'Quản lý người dùng', href: '/admin/user-management', icon: 'users' },
    { label: 'Quản lý cửa hàng', href: '/admin/store-management', icon: 'store' },
    { label: 'Danh mục & Thẻ', href: '/admin/categories-tags', icon: 'tags' },
    { label: 'Cài đặt', href: '/admin/setting', icon: 'settings' },
  ],
  manager: [
    { label: 'Bảng điều khiển cửa hàng', href: '/manager', icon: 'dashboard' },
    { label: 'Số liệu cửa hàng', href: '/manager/store-metrics', icon: 'metrics' },
    { label: 'Danh mục cửa hàng', href: '/manager/store-catalog', icon: 'catalog' },
    { label: 'Người dùng cửa hàng', href: '/manager/store-users', icon: 'users' },
    { label: 'Thông tin vựa', href: '/manager/nursery-profile', icon: 'inventory' },
    { label: 'Đơn hàng bán', href: '/manager/sales-orders', icon: 'orders' },
    { label: 'Đơn dịch vụ', href: '/manager/service-orders', icon: 'services' },
    { label: 'Thanh toán cửa hàng', href: '/manager/store-payment', icon: 'payment' },
  ],
  staff: [
    { label: 'Bảng điều khiển', href: '/staff', icon: 'dashboard' },
    { label: 'Yêu cầu dịch vụ', href: '/staff/service-request', icon: 'requests' },
    { label: 'Quy trình dịch vụ', href: '/staff/service-process', icon: 'scheduled' },
    { label: 'Tồn kho vườn hiện tại', href: '/staff/inventory-current-nursery', icon: 'store' },
    { label: 'Tồn kho liên vườn', href: '/staff/inventory-cross-nursery', icon: 'store' },
  ],
  consultant: [
    { label: 'Bảng điều khiển', href: '/consultant', icon: 'dashboard' },
    { label: 'Hỗ trợ chat', href: '/consultant/chat-support', icon: 'chat' },
    { label: 'Đơn hàng khách hàng', href: '/consultant/customer-orders', icon: 'orders' },
    { label: 'Sản phẩm & Tồn kho', href: '/consultant/products-inventory', icon: 'products' },
  ],
  caretaker: [
    { label: 'Bảng điều khiển', href: '/caretaker', icon: 'dashboard' },
    { label: 'Lịch trình', href: '/caretaker/scheduled', icon: 'scheduled' },
    { label: 'Giao nhiệm vụ', href: '/caretaker/assign-task', icon: 'tasks' },
    { label: 'Lịch sử chăm sóc', href: '/caretaker/care-history', icon: 'history' },
  ],
  shipper: [
    { label: 'Bảng điều khiển', href: '/shipper', icon: 'dashboard' },
    { label: 'Giao hàng', href: '/shipper/assign-delivery', icon: 'delivery' },
    { label: 'Lịch sử giao hàng', href: '/shipper/delivery-history', icon: 'history' },
  ],
};

export const SIDEBAR_LOGOUT_ITEM: SidebarItem = {
  label: 'Đăng xuất',
  href: '/logout',
  icon: 'logout',
};
