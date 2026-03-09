import type { UserRole } from '@/lib/constants/header';

export const ROLE_OPTIONS: UserRole[] = ['user', 'admin', 'manager', 'staff', 'shipper', 'caretaker'];

export const STATUS_OPTIONS = ['active', 'inactive'] as const;

export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const DEFAULT_ROWS_PER_PAGE = 10;
