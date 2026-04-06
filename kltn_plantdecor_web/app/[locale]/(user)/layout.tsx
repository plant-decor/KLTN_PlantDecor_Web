import type { ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SupportChatWidget from "@/components/chat/CustomerSupportChatWidget";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <MainLayout>
      {children}
      <SupportChatWidget />
    </MainLayout>
  );
}
