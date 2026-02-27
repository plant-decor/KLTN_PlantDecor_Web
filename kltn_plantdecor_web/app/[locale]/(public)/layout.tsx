import type { ReactNode } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <MainLayout>{children}</MainLayout>;
}
