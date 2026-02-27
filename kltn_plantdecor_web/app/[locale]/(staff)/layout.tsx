import type { ReactNode } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  return <DashboardShell role="staff">{children}</DashboardShell>;
}
