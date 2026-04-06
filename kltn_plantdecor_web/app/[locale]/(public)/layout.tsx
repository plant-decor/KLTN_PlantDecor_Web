import type { ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SupportChatWidget from "@/components/chat/CustomerSupportChatWidget";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <MainLayout>
      {children}
      <SupportChatWidget />
    </MainLayout>
  );
}
