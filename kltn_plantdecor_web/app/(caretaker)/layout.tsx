import type { ReactNode } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

interface CaretakerLayoutProps {
  children: ReactNode;
}

export default function CaretakerLayout({ children }: CaretakerLayoutProps) {
  return <DashboardShell role="caretaker">{children}</DashboardShell>;
}
