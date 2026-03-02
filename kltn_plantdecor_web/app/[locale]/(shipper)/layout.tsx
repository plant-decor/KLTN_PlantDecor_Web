import type { ReactNode } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

interface ShipperLayoutProps {
  children: ReactNode;
}

export default function ShipperLayout({ children }: ShipperLayoutProps) {
  return <DashboardShell role="shipper">{children}</DashboardShell>;
}
