/**
 * SERVICE FLOW - COMPLETE UI IMPLEMENTATION GUIDE
 * 
 * This file documents all components created for the service flow.
 * Each component is fully functional with MUI styling and form validation.
 */

// =============================================================================
// 1. TYPE DEFINITIONS
// =============================================================================
// File: types/service.types.ts
// Includes: 
//   - Enums: ServiceType, DifficultyLevel, ServiceRegistrationStatus, ServiceProgressAction
//   - Interfaces: CareServicePackage, ServiceRegistration, ServiceProgress, AddOnService, ServiceInvoice
//   - Form Data Types: ServiceRegistrationFormData, CareServicePackageFormData, etc.

// =============================================================================
// 2. CUSTOMER FLOW - SERVICE REGISTRATION
// =============================================================================

// Component: ServiceCatalog
// Location: components/Service/ServiceCatalog.tsx
// Purpose: Display available care service packages as cards
// Props:
//   - packages: CareServicePackage[]
//   - loading?: boolean
//   - onSelectPackage: (packageId: number) => void
// Features:
//   - Grid view of service packages
//   - Shows difficulty level, price, features
//   - Hover effects with elevation

// Component: ServiceDetail
// Location: components/Service/ServiceDetail.tsx
// Purpose: Show detailed information about a service package
// Props:
//   - package: CareServicePackage | null
//   - loading?: boolean
//   - onRegister: () => void
//   - onBack: () => void
// Features:
//   - Detailed package information
//   - Features list with checkmarks
//   - Call-to-action register button

// Component: ServiceRegistrationForm
// Location: components/Service/ServiceRegistrationForm.tsx
// Purpose: Multi-step form for customer to register a service
// Props:
//   - package: CareServicePackage
//   - onSubmit: (data: ServiceRegistrationFormData) => Promise<void>
//   - onCancel: () => void
//   - loading?: boolean
// Features:
//   - Stepper-based multi-step form
//   - Step 1: Package confirmation
//   - Step 2: Contact information (phone, address)
//   - Step 3: Service date & notes
//   - React Hook Form validation

// Client Component: CustomerServicePageClient
// Location: components/Service/CustomerServicePageClient.tsx
// Purpose: Container component managing the entire customer service flow
// Usage: Place in app/[locale]/(user)/services/page.tsx
// Features:
//   - Manages navigation between catalog, detail, and registration views
//   - Fetches available packages from API
//   - Handles form submission and API calls

// =============================================================================
// 3. ADMIN FLOW - CARE PACKAGE MANAGEMENT
// =============================================================================

// Component: CarePackageManagementTable
// Location: components/Service/CarePackageManagementTable.tsx
// Purpose: Display table of all care service packages with CRUD actions
// Props:
//   - packages: CareServicePackage[]
//   - loading?: boolean
//   - onEdit: (pkg: CareServicePackage) => void
//   - onDelete: (packageId: number) => Promise<void>
//   - onStatusToggle: (packageId: number, isActive: boolean) => Promise<void>
// Features:
//   - Sortable table view
//   - Status indicators (Active/Inactive)
//   - Edit, View, Delete buttons
//   - Delete confirmation dialog
//   - Click to toggle status

// Component: CarePackageForm
// Location: components/Service/CarePackageForm.tsx
// Purpose: Modal form for creating/editing care packages
// Props:
//   - open: boolean
//   - package?: CareServicePackage
//   - onSubmit: (data: CareServicePackageFormData) => Promise<void>
//   - onClose: () => void
//   - loading?: boolean
// Features:
//   - Modal dialog form
//   - Sections: General info, Service config, Price/Limits, Features
//   - Dynamic features list (add/remove)
//   - Conditional frequency field for periodic services
//   - React Hook Form validation

// Client Component: AdminCarePackagePageClient
// Location: components/Service/AdminCarePackagePageClient.tsx
// Purpose: Admin dashboard for managing care packages
// Usage: Place in app/[locale]/(admin)/services/packages/page.tsx
// Features:
//   - Displays package management table
//   - Open form dialog for create/edit
//   - API integration for CRUD operations
//   - Success/error notifications

// =============================================================================
// 4. STAFF FLOW - SERVICE REQUEST HANDLING
// =============================================================================

// Component: ServiceRequestList
// Location: components/Service/ServiceRequestList.tsx
// Purpose: Display pending service requests that need confirmation
// Props:
//   - requests: ServiceRegistration[]
//   - loading?: boolean
//   - onSelectRequest: (request: ServiceRegistration) => void
// Features:
//   - Card-based list view
//   - Shows customer info, package, address, phone, notes
//   - Status badge
//   - Click to view details

// Component: ServiceRequestDetail
// Location: components/Service/ServiceRequestDetail.tsx
// Purpose: Detailed view of a service request with confirm/reject actions
// Props:
//   - request: ServiceRegistration | null
//   - loading?: boolean
//   - onConfirm: (caretakerId: number, estimatedDuration: number) => Promise<void>
//   - onReject: (reason: string) => Promise<void>
//   - onBack: () => void
// Features:
//   - Customer information display
//   - Service package details
//   - Date & notes section
//   - Confirm and Reject action buttons
//   - AssignCaretakerModal integration

// Component: AssignCaretakerModal
// Location: components/Service/AssignCaretakerModal.tsx
// Purpose: Modal for selecting available caretaker and setting duration
// Props:
//   - open: boolean
//   - onClose: () => void
//   - onSubmit: (caretakerId: number, estimatedDuration: number) => Promise<void>
//   - loading?: boolean
// Features:
//   - Fetches available caretakers from API
//   - Radio selection of caretaker
//   - Shows rating and completed services
//   - Duration input field
//   - Displays caretaker details (name, email, availability)

// Client Component: StaffServiceRequestPageClient
// Location: components/Service/StaffServiceRequestPageClient.tsx
// Purpose: Staff dashboard for handling service requests
// Usage: Place in app/[locale]/(staff)/services/requests/page.tsx
// Features:
//   - Lists pending requests
//   - View request details
//   - Confirm & assign caretaker
//   - Reject with reason

// =============================================================================
// 5. STAFF FLOW - SERVICE PROGRESS TRACKING
// =============================================================================

// Component: ServiceProgressTimeline
// Location: components/Service/ServiceProgressTimeline.tsx
// Purpose: Timeline view of service progress logs
// Props:
//   - registration: ServiceRegistration
//   - progressLogs: ServiceProgress[]
//   - onSelectRegistration: (registration: ServiceRegistration) => void
//   - back?: boolean
// Features:
//   - Timeline visual representation
//   - Shows action, timestamp, description
//   - Evidence photo display
//   - Duration tracking (check-in to check-out)

// Component: ServiceProgressDetail
// Location: components/Service/ServiceProgressDetail.tsx
// Purpose: Detailed progress view with add-on approval and invoice generation
// Props:
//   - registration: ServiceRegistration | null
//   - progressLogs: ServiceProgress[]
//   - addOns: AddOnService[]
//   - loading?: boolean
//   - onApproveAddOn: (addOnId: number) => Promise<void>
//   - onRejectAddOn: (addOnId: number, reason: string) => Promise<void>
//   - onGenerateInvoice: () => Promise<void>
//   - onBack: () => void
// Features:
//   - Progress logs display
//   - Add-ons table with approve/reject buttons
//   - Invoice summary with calculations
//   - Generate invoice button

// Client Component: StaffServiceProgressPageClient
// Location: components/Service/StaffServiceProgressPageClient.tsx
// Purpose: Staff dashboard for tracking service progress
// Usage: Place in app/[locale]/(staff)/services/progress/page.tsx
// Features:
//   - Tabbed interface (In Progress, Help)
//   - View in-progress services
//   - Access service details, logs, and add-ons
//   - Approve/reject add-ons
//   - Generate invoices

// =============================================================================
// 6. CARETAKER FLOW - TASK EXECUTION
// =============================================================================

// Component: CaretakerTaskList
// Location: components/Service/CaretakerTaskList.tsx
// Purpose: Daily task list for caretaker showing scheduled services
// Props:
//   - tasks: ServiceRegistration[]
//   - loading?: boolean
//   - onSelectTask: (task: ServiceRegistration) => void
// Features:
//   - Card-based task list sorted by time
//   - Shows customer, address, phone, package info
//   - Status badges (Scheduled/In Progress/Completed)
//   - Progress bar for in-progress tasks
//   - Quick access to phone and maps

// Component: CaretakerJobDetail
// Location: components/Service/CaretakerJobDetail.tsx
// Purpose: Detailed task with check-in/out, photo upload, and survey form
// Props:
//   - task: ServiceRegistration | null
//   - loading?: boolean
//   - onCheckIn: () => Promise<void>
//   - onCheckOut: () => Promise<void>
//   - onUploadEvidence: (photos: File[]) => Promise<void>
//   - onSubmitSurvey: (description: string, addOns: AddOnProposal[]) => Promise<void>
//   - onBack: () => void
// Features:
//   - Customer and package information
//   - Check-in button (activates after checking in)
//   - Photo upload for evidence (only after check-in)
//   - Check-out button (shows survey form)
//   - Survey form with:
//     - Plant condition description
//     - Add-on service proposals (name, description, price)
//   - Map link to customer location
//   - Direct call button

// Client Component: CaretakerTaskPageClient
// Location: components/Service/CaretakerTaskPageClient.tsx
// Purpose: Caretaker app for task management
// Usage: Place in app/[locale]/(caretaker)/tasks/page.tsx
// Features:
//   - Fetch daily tasks from API
//   - Task list view
//   - Task detail with full execution workflow
//   - Check-in/out tracking
//   - Photo evidence upload
//   - Work survey and add-on proposals


// =============================================================================
// 7. API ROUTES NEEDED
// =============================================================================

// Customer API
// POST /api/services/register
// GET /api/services/packages
// GET /api/services/packages/:id

// Admin API
// GET /api/services/packages
// POST /api/services/packages
// PUT /api/services/packages/:id
// DELETE /api/services/packages/:id
// PATCH /api/services/packages/:id/status

// Staff API - Request Handling
// GET /api/services/registrations?status=PENDING_CONFIRMATION
// GET /api/services/registrations/:id
// POST /api/services/registrations/:id/confirm
// POST /api/services/registrations/:id/reject
// GET /api/services/caretakers/available

// Staff API - Progress Tracking
// GET /api/services/registrations?status=IN_PROGRESS
// GET /api/services/registrations/:id/progress
// GET /api/services/registrations/:id/addons
// POST /api/services/addons/:id/approve
// POST /api/services/addons/:id/reject
// POST /api/services/registrations/:id/invoice

// Caretaker API
// GET /api/services/caretaker/tasks?date=YYYY-MM-DD
// POST /api/services/registrations/:id/progress
// POST /api/services/registrations/:id/evidence
// POST /api/services/registrations/:id/survey

export default {};
