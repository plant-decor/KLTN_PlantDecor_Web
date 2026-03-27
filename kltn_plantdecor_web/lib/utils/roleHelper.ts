/**
 * Role-based Access Control Helpers
 * Dùng trong components để check permissions
 */

import { ROLE_TO_ROUTES, ROUTE_TO_ROLES } from '@/proxy';

const normalizeRole = (role: string | undefined): string | undefined => {
  if (!role) return undefined;
  const trimmed = role.trim();
  if (!trimmed) return undefined;

  const map: Record<string, string> = {
    admin: 'Admin',
    manager: 'Manager',
    staff: 'Staff',
    caretaker: 'Caretaker',
    shipper: 'Shipper',
    customer: 'Customer',
    user: 'User',
  };

  return map[trimmed.toLowerCase()] || trimmed;
};

/**
 * Check if user role has access to a specific route
 */
export function canAccessRoute(userRole: string | undefined, route: string): boolean {
  const normalizedRole = normalizeRole(userRole);
  if (!normalizedRole) return false;
  return ROLE_TO_ROUTES[normalizedRole]?.includes(route) ?? false;
}

/**
 * Get all routes that a role can access
 */
export function getAccessibleRoutes(userRole: string | undefined): string[] {
  const normalizedRole = normalizeRole(userRole);
  if (!normalizedRole) return [];
  return ROLE_TO_ROUTES[normalizedRole] ?? [];
}

/**
 * Get all roles that can access a route
 */
export function getAllowedRoles(route: string): string[] {
  return ROUTE_TO_ROLES[route] ?? [];
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: string | undefined): boolean {
  return normalizeRole(userRole) === 'Admin';
}

/**
 * Check if user is staff (Admin, Manager, Staff, Caretaker, Shipper)
 */
export function isStaff(userRole: string | undefined): boolean {
  return ['Admin', 'Manager', 'Staff', 'Caretaker', 'Shipper'].includes(normalizeRole(userRole) || '');
}

/**
 * Check if user is regular user
 */
export function isRegularUser(userRole: string | undefined): boolean {
  return normalizeRole(userRole) === 'User';
}

/**
 * Filter menu items based on user role
 * Usage in Sidebar/Navigation component
 */
export function filterMenuByRole<T extends { route: string }>(
  menuItems: T[],
  userRole: string | undefined
): T[] {
  const normalizedRole = normalizeRole(userRole);
  if (!normalizedRole) return [];
  
  const accessibleRoutes = getAccessibleRoutes(normalizedRole);
  return menuItems.filter(item => accessibleRoutes.includes(item.route));
}

// Example menu structure for reference
export interface MenuItem {
  label: string;
  route: string;
  icon?: string;
  children?: MenuItem[];
}

/**
 * Role-specific default redirect paths
 */
export const ROLE_DEFAULT_PATHS: Record<string, string> = {
  'Admin': '/admin',
  'Manager': '/manager',
  'Staff': '/staff',
  'Caretaker': '/caretaker',
  'Shipper': '/shipper',
  'User': '/profile',
};

/**
 * Get default redirect path for a role
 */
export function getDefaultPath(userRole: string | undefined): string {
  const normalizedRole = normalizeRole(userRole);
  if (!normalizedRole) return '/';
  return ROLE_DEFAULT_PATHS[normalizedRole] ?? '/';
}
