import type { ReactNode } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

interface ConsultantLayoutProps {
  children: ReactNode;
}

export default function ConsultantLayout({ children }: ConsultantLayoutProps) {
  return <DashboardShell role="consultant">{children}</DashboardShell>;
}
