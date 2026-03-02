import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Navigation helpers with locale awareness
 *
 * Usage in components:
 *   import { Link, usePathname, useRouter, redirect } from '@/i18n/navigation';
 *
 * These wrappers ensure links and navigation include the correct locale prefix.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
