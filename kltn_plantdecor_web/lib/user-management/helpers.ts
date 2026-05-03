import type { UserRole } from '@/lib/constants/header';
import type { SampleUser } from '@/data/sampledata';

const KNOWN_ROLES: UserRole[] = [
  'guest',
  'customer',
  'admin',
  'manager',
  'staff',
  'consultant',
  'shipper',
  'caretaker',
];

/** Map API role string (e.g. Customer) to app UserRole */
export const mapApiRoleToUserRole = (role: string): UserRole => {
  const normalized = role?.trim().toLowerCase();
  if (KNOWN_ROLES.includes(normalized as UserRole)) {
    return normalized as UserRole;
  }
  return 'customer';
};

/** Map API status Active/Inactive to UI literal used by chips */
export const mapApiUserStatusToUi = (status: string): 'active' | 'inactive' =>
  status?.trim().toLowerCase() === 'inactive' ? 'inactive' : 'active';

/** UserRole -> API role string (e.g. Customer) */
export const formatUserRoleForApi = (role: UserRole): string =>
  role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

export const formatStatusForApi = (status: 'active' | 'inactive'): 'Active' | 'Inactive' =>
  status === 'inactive' ? 'Inactive' : 'Active';

export const getRoleColor = (role: UserRole): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
  const colorMap: Record<UserRole, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
    guest: 'secondary',
    customer: 'default',
    admin: 'error',
    manager: 'warning',
    staff: 'info',
    consultant: 'primary',
    shipper: 'secondary',
    caretaker: 'success',
  };
  return colorMap[role] || 'default';
};

export const getStatusColor = (status: string): 'success' | 'error' => {
  return status === 'active' ? 'success' : 'error';
};

export const formatRoleLabel = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const generateNextUserId = (users: SampleUser[]): number => {
  if (users.length === 0) return 1;
  return Math.max(...users.map((u) => u.id)) + 1;
};

export const getStatsData = (users: SampleUser[]) => {
  const activeCount = users.filter((u) => u.status === 'active').length;
  const inactiveCount = users.filter((u) => u.status === 'inactive').length;

  return [
    {
      label: 'Total Users',
      value: users.length,
      color: '#1976d2',
    },
    {
      label: 'Active',
      value: activeCount,
      color: '#4caf50',
    },
    {
      label: 'Inactive',
      value: inactiveCount,
      color: '#ff9800',
    },
  ];
};
