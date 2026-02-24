import type { ReactNode } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return <MainLayout>{children}</MainLayout>;
}
