/**
 * Service Components Index
 * Central export file for all service-related components
 * 
 * Usage:
 * import { ServiceCatalog, CustomerServicePageClient } from '@/components/Service';
 */

// Type definitions
export {
  ServiceType,
  DifficultyLevel,
  ServiceRegistrationStatus,
  ServiceProgressAction,
  CaretakerAvailabilityStatus,
  type CareServicePackage,
  type ServiceRegistration,
  type ServiceProgress,
  type AddOnService,
  type ServiceInvoice,
  type CustomerInfo,
  type CaretakerInfo,
  type ServiceRegistrationFormData,
  type CareServicePackageFormData,
  type AssignCaretakerData,
  type ServiceProgressData,
  type ApiResponse,
  type PaginatedResponse,
} from '@/types/service.types';

// Customer Flow Components
export { default as ServiceCatalog } from './ServiceCatalog';
export { default as ServiceDetail } from './ServiceDetail';
export { default as ServiceRegistrationForm } from './ServiceRegistrationForm';
export { default as CustomerServicePageClient } from './CustomerServicePageClient';

// Admin Flow Components
export { default as CarePackageManagementTable } from './CarePackageManagementTable';
export { default as CarePackageForm } from './CarePackageForm';
export { default as AdminCarePackagePageClient } from './AdminCarePackagePageClient';

// Staff Request Handling Flow Components
export { default as ServiceRequestList } from './ServiceRequestList';
export { default as ServiceRequestDetail } from './ServiceRequestDetail';
export { default as AssignCaretakerModal } from './AssignCaretakerModal';
export { default as StaffServiceRequestPageClient } from './StaffServiceRequestPageClient';

// Staff Progress Tracking Flow Components
export { default as ServiceProgressTimeline } from './ServiceProgressTimeline';
export { default as ServiceProgressDetail } from './ServiceProgressDetail';
export { default as StaffServiceProgressPageClient } from './StaffServiceProgressPageClient';

// Caretaker Flow Components
export { default as CaretakerTaskList } from './CaretakerTaskList';
export { default as CaretakerJobDetail } from './CaretakerJobDetail';
export { default as CaretakerTaskPageClient } from './CaretakerTaskPageClient';

/**
 * Quick Reference - Component Exports
 * 
 * CUSTOMER FLOW:
 * - ServiceCatalog: Browse available packages
 * - ServiceDetail: View package details
 * - ServiceRegistrationForm: Multi-step registration
 * - CustomerServicePageClient: Main page component
 * 
 * ADMIN FLOW:
 * - CarePackageManagementTable: Manage packages
 * - CarePackageForm: Create/edit packages
 * - AdminCarePackagePageClient: Main page component
 * 
 * STAFF REQUEST FLOW:
 * - ServiceRequestList: View pending requests
 * - ServiceRequestDetail: Request details & confirm/reject
 * - AssignCaretakerModal: Select caretaker
 * - StaffServiceRequestPageClient: Main page component
 * 
 * STAFF PROGRESS FLOW:
 * - ServiceProgressTimeline: View progress logs
 * - ServiceProgressDetail: Review add-ons & invoice
 * - StaffServiceProgressPageClient: Main page component
 * 
 * CARETAKER FLOW:
 * - CaretakerTaskList: Daily task list
 * - CaretakerJobDetail: Task execution
 * - CaretakerTaskPageClient: Main page component
 */
