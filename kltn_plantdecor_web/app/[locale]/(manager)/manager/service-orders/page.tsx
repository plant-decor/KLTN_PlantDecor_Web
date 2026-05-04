'use client';

import ManagerServiceOrdersPageClient from '@/components/service/service-orders/ManagerServiceOrdersPageClient';

export default function ManagerServiceOrdersPage() {
  return (
    <ManagerServiceOrdersPageClient
      pageTitle="Service Orders Management"
      pageDescription="Manage service registration orders for your nursery, including approval, cancellation, and caretaker assignment."
      entityLabel="service orders"
    />
  );
}
