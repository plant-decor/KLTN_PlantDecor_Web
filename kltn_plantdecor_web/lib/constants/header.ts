export type UserRole = 'guest' | 'customer' | 'admin' | 'manager' | 'staff' | 'consultant' | 'shipper' | 'caretaker';

const CUSTOMER_NAV_ITEMS: HeaderNavItem[] = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Plant Store', href: '/plant-store', icon: 'store' },
  { label: 'Services', href: '/services/[userId]', icon: 'services' },
  { label: 'My Plant', href: '/my-plant/[userId]', icon: 'myPlant', requiresUserId: true },
  {
    label: 'AI Plant Recommendation',
    href: '/ai-plant-recommendation/[userId]',
    icon: 'ai',
    requiresUserId: true,
  },
  { label: 'Contact', href: '/contact', icon: 'contact' },
  { label: 'About Us', href: '/about', icon: 'about' },
];

export type HeaderIconKey =
  | 'home'
  | 'store'
  | 'services'
  | 'contact'
  | 'about'
  | 'myPlant'
  | 'ai';

export interface HeaderNavItem {
  label: string;
  href: string;
  icon: HeaderIconKey;
  requiresUserId?: boolean;
}

export interface HeaderActionItem {
  label: string;
  href: string;
  requiresUserId?: boolean;
}

export const NAV_ITEMS_BY_ROLE: Record<UserRole, HeaderNavItem[]> = {
  guest: [
    { label: 'Home', href: '/', icon: 'home' },
    { label: 'Plant Store', href: '/plant-store', icon: 'store' },
    { label: 'Services', href: '/services/[userId]', icon: 'services' },
    {
      label: 'AI Plant Recommendation',
      href: '/ai-plant-recommendation/[userId]',
      icon: 'ai',
    },
    { label: 'Contact', href: '/contact', icon: 'contact' },
    { label: 'About Us', href: '/about', icon: 'about' },
  ],
  customer: CUSTOMER_NAV_ITEMS,
  admin: [],
  manager: [],
  staff: [],
  consultant: [],
  shipper: [],
  caretaker: [],
};

export const GUEST_ACTIONS = {
  login: { label: 'Đăng nhập', href: '/login' },
  register: { label: 'Đăng ký', href: '/register' },
};

export const USER_ACTIONS = {
  cart: { label: 'Cart', href: '/cart/[userid]', requiresUserId: true },
};

export const USER_MENU_ITEMS: HeaderActionItem[] = [
  { label: 'Profile', href: '/profile/[userid]', requiresUserId: true },
  { label: 'Order history', href: '/orders/[userid]', requiresUserId: true },
  { label: 'Wishlist', href: '/wishlist/[userid]', requiresUserId: true },
  { label: 'Log out', href: '/logout' },
];
