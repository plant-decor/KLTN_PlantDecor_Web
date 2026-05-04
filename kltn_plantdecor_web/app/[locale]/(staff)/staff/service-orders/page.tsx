'use client';

import ManagerServiceOrdersPageClient from '@/components/service/service-orders/ManagerServiceOrdersPageClient';

export default function StaffServiceOrdersPage() {
  return (
    <ManagerServiceOrdersPageClient
      pageTitle="Service Requests Management"
      pageDescription="Review and manage customer service requests and design service orders for your nursery."
      entityLabel="service requests"
    />
  );
}
