export const ROLE_TO_ROUTES: Record<string, string[]> = {
  Admin: [
    'admin', 'manager', 'staff', 'caretaker', 'shipper', 'categories-tags',
    'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation',
  ],
  Manager: [
    'manager', 'staff', 'caretaker', 'shipper',
    'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation',
  ],
  Staff: [
    'staff', 'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation',
  ],
  Caretaker: [
    'caretaker', 'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation',
  ],
  Shipper: [
    'shipper', 'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation',
  ],
  Customer: [
    'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation',
  ],
};

export const ROUTE_TO_ROLES: Record<string, string[]> = {
  admin: ['Admin'],
  manager: ['Admin', 'Manager'],
  staff: ['Admin', 'Manager', 'Staff'],
  caretaker: ['Admin', 'Manager', 'Caretaker'],
  shipper: ['Admin', 'Manager', 'Shipper'],
  consultant: ['Admin', 'Manager', 'Staff'],
  dashboard: ['Admin', 'Manager', 'Staff', 'Caretaker', 'Shipper'],
  sessions: ['Admin', 'Manager', 'Staff', 'Caretaker', 'Shipper'],
};
