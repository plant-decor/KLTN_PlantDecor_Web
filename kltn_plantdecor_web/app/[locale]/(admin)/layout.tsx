import type { ReactNode } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <DashboardShell role="admin">{children}</DashboardShell>;
}
