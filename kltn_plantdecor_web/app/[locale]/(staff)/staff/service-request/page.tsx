import ManagerServiceOrdersPageClient from "@/components/service/service-orders/ManagerServiceOrdersPageClient";

export default function StaffServiceRequestPage() {
  return (
    <ManagerServiceOrdersPageClient
      pageTitle="Service Requests Management"
      pageDescription="Review and manage customer service requests, including approval, cancellation, and caretaker assignment."
      entityLabel="service requests"
    />
  );
}