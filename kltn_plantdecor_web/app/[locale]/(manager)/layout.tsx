import type { ReactNode } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role='manager'>{children}</DashboardShell>;
}
