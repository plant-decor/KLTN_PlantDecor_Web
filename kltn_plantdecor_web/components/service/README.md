# Service Flow UI Implementation - Complete Guide

## Overview

This document provides a complete guide to the service flow UI implementation for the Plant Decor web application. The implementation includes 5 main user flows with multiple components, all built with Material-UI (MUI) for consistent styling and React Hook Form for form management.

---

## Project Structure

```
components/Service/
├── SERVICE_COMPONENTS_GUIDE.ts          # Detailed component documentation
├── 
├── types/
│   └── service.types.ts                 # All type definitions and enums
│
├── CUSTOMER FLOW/
│   ├── ServiceCatalog.tsx              # Service packages list view
│   ├── ServiceDetail.tsx               # Service package details
│   ├── ServiceRegistrationForm.tsx     # Multi-step registration form
│   └── CustomerServicePageClient.tsx   # Container component
│
├── ADMIN FLOW/
│   ├── CarePackageManagementTable.tsx  # Package management table
│   ├── CarePackageForm.tsx             # Create/edit package form
│   └── AdminCarePackagePageClient.tsx  # Container component
│
├── STAFF FLOW - REQUEST HANDLING/
│   ├── ServiceRequestList.tsx          # Pending requests list
│   ├── ServiceRequestDetail.tsx        # Request details & actions
│   ├── AssignCaretakerModal.tsx        # Caretaker selection modal
│   └── StaffServiceRequestPageClient.tsx # Container component
│
├── STAFF FLOW - PROGRESS TRACKING/
│   ├── ServiceProgressTimeline.tsx     # Progress logs timeline
│   ├── ServiceProgressDetail.tsx       # Add-on review & invoicing
│   └── StaffServiceProgressPageClient.tsx # Container component
│
└── CARETAKER FLOW/
    ├── CaretakerTaskList.tsx           # Daily task list
    ├── CaretakerJobDetail.tsx          # Task execution with forms
    └── CaretakerTaskPageClient.tsx     # Container component
```

---

## Flow Diagrams

### Customer Flow
```
Catalog → Service Detail → Registration Form (Multi-step) → Confirmation
  ↓          ↓                    ↓
View all   Select package    Step 1: Confirm package
packages   Get details       Step 2: Contact info
                            Step 3: Date & notes
                            Submit → API Call
```

### Admin Flow
```
Package Table → [View/Edit/Delete/Toggle Status]
     ↓
[Edit/View] → Form Dialog → Submit
[Delete] → Confirmation → Remove
[Toggle] → Status update
[Create] → Form Dialog → Submit
```

### Staff Request Handling Flow
```
Pending Requests → Request Details → [Confirm OR Reject]
         ↓               ↓
List cards      Full info display
with basics     Customer details
                Package info    → Select Caretaker (Modal)
                                → Set Duration
                                → Confirm
                                
                OR
                
                → Input Reason
                → Reject
```

### Staff Progress Tracking Flow
```
In-Progress Services → Service Detail → [Approve/Reject Add-ons]
         ↓                   ↓                    ↓
Timeline view       Progress logs        Add-on dialog
Task list           Add-ons table        With reason input
                    Invoice summary
                                        → Generate Invoice
```

### Caretaker Flow
```
Daily Tasks → Task Details → Check-in → [Upload Photos]
    ↓            ↓               ↓           ↓
Task cards   Full info       Mark start   Evidence
by time      Customer        Active mode  multiline
Phone/maps   Package                      
Notes        Location/maps               Check-out → Survey Form
                                              ↓
                                        Plant description
                                        Add-on proposals
                                        Submit → API
```

---

## Component Specifications

### 1. ServiceCatalog
**Purpose:** Display available care service packages

**Props:**
```typescript
interface ServiceCatalogProps {
  packages: CareServicePackage[];
  loading?: boolean;
  onSelectPackage: (packageId: number) => void;
}
```

**Features:**
- Grid layout (3 columns on desktop, responsive)
- Card component for each package
- Shows: name, description, difficulty level, price, features
- Hover effects with elevation
- Tags for service type (1-time vs periodic)

**Usage:**
```tsx
<ServiceCatalog
  packages={packages}
  loading={loading}
  onSelectPackage={(id) => handleSelectPackage(id)}
/>
```

---

### 2. ServiceDetail
**Purpose:** Show full details of a selected service package

**Props:**
```typescript
interface ServiceDetailProps {
  package: CareServicePackage | null;
  loading?: boolean;
  onRegister: () => void;
  onBack: () => void;
}
```

**Features:**
- Full description and features list
- Price display prominent
- Service type, difficulty, duration, area limit
- Features with checkmark icons
- "Register now" CTA button
- Back button for navigation

---

### 3. ServiceRegistrationForm
**Purpose:** Multi-step form for customer registration

**Props:**
```typescript
interface ServiceRegistrationFormProps {
  package: CareServicePackage;
  onSubmit: (data: ServiceRegistrationFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Features:**
- 3-step stepper
  - **Step 1:** Package confirmation (display selected package)
  - **Step 2:** Contact information (phone, address with validation)
  - **Step 3:** Service date & notes (datetime picker, optional notes)
- Form validation with React Hook Form
- Success/error handling
- Previous/Next/Submit buttons

**Validation Rules:**
- Phone: 10-11 digits
- Address: minimum 10 characters
- Service Date: required, must be future date
- Note: optional

---

### 4. CarePackageManagementTable
**Purpose:** Admin table for managing all care packages

**Props:**
```typescript
interface CarePackageManagementTableProps {
  packages: CareServicePackage[];
  loading?: boolean;
  onEdit: (pkg: CareServicePackage) => void;
  onDelete: (packageId: number) => Promise<void>;
  onStatusToggle: (packageId: number, isActive: boolean) => Promise<void>;
}
```

**Features:**
- Table with columns: Name, Type, Difficulty, Price, Status
- Action buttons: View, Edit, Delete
- Status badge (clickable to toggle)
- Delete confirmation dialog
- Hover highlight

---

### 5. CarePackageForm
**Purpose:** Create/edit care service packages

**Props:**
```typescript
interface CarePackageFormProps {
  open: boolean;
  package?: CareServicePackage;
  onSubmit: (data: CareServicePackageFormData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}
```

**Features:**
- Modal dialog form
- 4 sections:
  1. **General Info:** Name, description
  2. **Service Config:** Type, frequency (conditional), duration, difficulty
  3. **Features:** Dynamic list (add/remove features)
  4. **Pricing:** Area limit, base price
- Toggle for active status
- React Hook Form validation
- Submit button with loading state

---

### 6. ServiceRequestList
**Purpose:** Display pending service requests for staff

**Props:**
```typescript
interface ServiceRequestListProps {
  requests: ServiceRegistration[];
  loading?: boolean;
  onSelectRequest: (request: ServiceRegistration) => void;
}
```

**Features:**
- Card-based list view
- Shows: Customer name with avatar, phone, address, service date, notes
- Package preview (name + price)
- Status badge ("Chờ Xác Nhận")
- Click to view details

---

### 7. ServiceRequestDetail
**Purpose:** View request details and confirm/reject

**Props:**
```typescript
interface ServiceRequestDetailProps {
  request: ServiceRegistration | null;
  loading?: boolean;
  onConfirm: (caretakerId: number, estimatedDuration: number) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onBack: () => void;
}
```

**Features:**
- Full customer information display
- Complete service package details
- Service date and notes
- **Confirm button:** Opens AssignCaretakerModal
- **Reject button:** Shows reason confirmation dialog

---

### 8. AssignCaretakerModal
**Purpose:** Select available caretaker and set estimated duration

**Props:**
```typescript
interface AssignCaretakerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (caretakerId: number, estimatedDuration: number) => Promise<void>;
  loading?: boolean;
}
```

**Features:**
- Fetches available caretakers from API
- Radio selection list
- Shows per caretaker:
  - Name with person icon
  - Email
  - Star rating (1-5)
  - Completed services count
  - Availability badge
- Duration input (minimum 30 mins, step 15 mins)
- Submit button with loading state

---

### 9. ServiceProgressTimeline
**Purpose:** Display progress logs in timeline format

**Props:**
```typescript
interface ServiceProgressTimelineProps {
  registration: ServiceRegistration;
  progressLogs: ServiceProgress[];
  onSelectRegistration: (registration: ServiceRegistration) => void;
  back?: boolean;
}
```

**Features:**
- Timeline component with dots and connectors
- Each log shows:
  - Action type (icon)
  - Timestamp
  - Description
  - Evidence image (if available)
  - Time duration (check-in to check-out)
- Color coding by action type
- "View details" button

---

### 10. ServiceProgressDetail
**Purpose:** Review add-ons, approve/reject, generate invoice

**Props:**
```typescript
interface ServiceProgressDetailProps {
  registration: ServiceRegistration | null;
  progressLogs: ServiceProgress[];
  addOns: AddOnService[];
  loading?: boolean;
  onApproveAddOn: (addOnId: number) => Promise<void>;
  onRejectAddOn: (addOnId: number, reason: string) => Promise<void>;
  onGenerateInvoice: () => Promise<void>;
  onBack: () => void;
}
```

**Features:**
- Progress logs section (read-only display)
- Add-ons table with columns:
  - Name, Description
  - Quantity, Unit Price, Total
  - Status badge
  - Action buttons (Approve/Reject)
- Approve Add-on: Single click
- Reject Add-on: Dialog with reason input
- Invoice Summary:
  - Base amount (package price)
  - Add-on amount (approved only)
  - Total amount (highlighted)
- Generate Invoice button (action)

---

### 11. CaretakerTaskList
**Purpose:** Display daily tasks for caretaker

**Props:**
```typescript
interface CaretakerTaskListProps {
  tasks: ServiceRegistration[];
  loading?: boolean;
  onSelectTask: (task: ServiceRegistration) => void;
}
```

**Features:**
- Card-based task grid
- Each card shows:
  - Customer avatar + name
  - Task ID badge
  - Service package name
  - Time (with icon)
  - Address (first part)
  - Phone (clickable for call)
  - Status badge with color coding
  - Progress bar (if in progress)
  - Customer notes preview
- Task sorted by service date

---

### 12. CaretakerJobDetail
**Purpose:** Execute task with check-in/out and work submission

**Props:**
```typescript
interface CaretakerJobDetailProps {
  task: ServiceRegistration | null;
  loading?: boolean;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  onUploadEvidence: (photos: File[]) => Promise<void>;
  onSubmitSurvey: (description: string, addOns: AddOnProposal[]) => Promise<void>;
  onBack: () => void;
}
```

**Features:**
- Customer info with avatar
- Phone (clickable)
- Address with Google Maps link
- Service date/time
- Package details and features
- **Check-in Button:**
  - Initially labeled "Check-in / Bắt Đầu"
  - Changes to "Check-out / Kết Thúc" after check-in
  - Shows active alert after check-in
- **Photo Upload Section** (only after check-in):
  - File input for multiple images
  - Image preview grid
  - Delete button per photo
- **Check-out Survey Form** (modal appears after check-out):
  - Plant condition description textarea
  - Dynamic add-on proposals (name, description, price)
  - Add more add-ons button
  - Submit button

---

## Type Definitions

### Enums
```typescript
enum ServiceType { ONETIME, PERIODIC }
enum DifficultyLevel { EASY, MEDIUM, HARD, EXPERT }
enum ServiceRegistrationStatus {
  PENDING_CONFIRMATION, CONFIRMED, REJECTED,
  IN_PROGRESS, COMPLETED, CANCELLED
}
enum ServiceProgressAction {
  CHECK_IN, SURVEY, WORK_IN_PROGRESS,
  PHOTO_EVIDENCE, ADDON_PROPOSAL, CHECK_OUT, COMPLETED
}
```

### Main Interfaces
```typescript
interface CareServicePackage {
  id: number;
  name: string;
  description: string;
  features: string[];
  serviceType: ServiceType;
  frequency?: string;
  durationDays: number;
  difficultyLevel: DifficultyLevel;
  areaLimit: number;
  unitPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceRegistration {
  id: number;
  customerId: number;
  servicePackageId: number;
  address: string;
  phone: string;
  serviceDate: string;
  note: string;
  status: ServiceRegistrationStatus;
  mainCaretakerId?: number;
  estimatedDuration?: number;
  // ... relationships
}

interface ServiceProgress {
  id: number;
  serviceRegistrationId: number;
  caretakerId: number;
  action: ServiceProgressAction;
  description: string;
  evidenceImageUrl?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
}
```

---

## Integration Steps

### 1. Install Dependencies
```bash
npm install react-hook-form
npm install @mui/material @emotion/react @emotion/styled
# Already in project: next, react, typescript
```

### 2. Add Types
```typescript
// types/service.types.ts - Already created
import { ... } from '@/types/service.types';
```

### 3. Create Route Pages

**Customer Page:**
```typescript
// app/[locale]/(user)/services/page.tsx
import CustomerServicePageClient from '@/components/Service/CustomerServicePageClient';

export default function ServicesPage() {
  return <CustomerServicePageClient />;
}
```

**Admin Page:**
```typescript
// app/[locale]/(admin)/services/packages/page.tsx
import AdminCarePackagePageClient from '@/components/Service/AdminCarePackagePageClient';

export default function PackagesPage() {
  return <AdminCarePackagePageClient />;
}
```

**Staff Request Page:**
```typescript
// app/[locale]/(staff)/services/requests/page.tsx
import StaffServiceRequestPageClient from '@/components/Service/StaffServiceRequestPageClient';

export default function RequestsPage() {
  return <StaffServiceRequestPageClient />;
}
```

**Staff Progress Page:**
```typescript
// app/[locale]/(staff)/services/progress/page.tsx
import StaffServiceProgressPageClient from '@/components/Service/StaffServiceProgressPageClient';

export default function ProgressPage() {
  return <StaffServiceProgressPageClient />;
}
```

**Caretaker Page:**
```typescript
// app/[locale]/(caretaker)/tasks/page.tsx
import CaretakerTaskPageClient from '@/components/Service/CaretakerTaskPageClient';

export default function TasksPage() {
  return <CaretakerTaskPageClient />;
}
```

### 4. Implement API Routes
See `app/api/services/EXAMPLE_API_ROUTES.ts` for implementation patterns

### 5. Set Up Database Schema
Use Prisma schema example provided in EXAMPLE_API_ROUTES.ts

---

## API Endpoints Required

### Customer
```
GET    /api/services/packages              # List packages
GET    /api/services/packages/:id          # Package detail
POST   /api/services/register              # Register service
```

### Admin
```
GET    /api/services/packages              # List all packages
POST   /api/services/packages              # Create package
PUT    /api/services/packages/:id          # Update package
DELETE /api/services/packages/:id          # Delete package
PATCH  /api/services/packages/:id/status   # Toggle active status
```

### Staff - Requests
```
GET    /api/services/registrations?status=PENDING_CONFIRMATION
GET    /api/services/registrations/:id
GET    /api/services/caretakers/available  # Available caretakers
POST   /api/services/registrations/:id/confirm
POST   /api/services/registrations/:id/reject
```

### Staff - Progress
```
GET    /api/services/registrations?status=IN_PROGRESS
GET    /api/services/registrations/:id/progress
GET    /api/services/registrations/:id/addons
POST   /api/services/addons/:id/approve
POST   /api/services/addons/:id/reject
POST   /api/services/registrations/:id/invoice
```

### Caretaker
```
GET    /api/services/caretaker/tasks?date=YYYY-MM-DD
POST   /api/services/registrations/:id/progress
POST   /api/services/registrations/:id/evidence
POST   /api/services/registrations/:id/survey
```

---

## Styling & MUI Configuration

All components use MUI theming:
- Colors: primary, success, warning, error, info
- Spacing: scale of 8px
- Elevation: cards use shadows
- Typography: Roboto font (default MUI)

### Custom Color Usage
- Primary: Actions, headers, CTA buttons
- Success: Confirmations, approve actions
- Warning: In-progress status, caution items
- Error: Delete, reject, failure actions
- Info: Informational content, neutral actions

---

## Form Validation

All forms use React Hook Form with:
- Client-side validation
- Server-side validation (implement in API)
- Error messages displayed below fields
- Form-level validation before submission

### Validation Examples
```typescript
// Phone: 10-11 digits
pattern: {
  value: /^[0-9]{10,11}$/,
  message: "Invalid phone number"
}

// Address: min 10 chars
minLength: {
  value: 10,
  message: "Address must be at least 10 characters"
}

// Required fields
required: "This field is required"
```

---

## Loading & Error Handling

- Loading states: CircularProgress component
- Error messages: Alert component with severity
- API errors: Caught and displayed to user
- Success feedback: Temporary success alerts
- Disabled states: During submission

---

## Mobile Optimization

- Responsive Grid layouts (xs, sm, md breakpoints)
- Touch-friendly buttons (48px minimum)
- Stack layouts on mobile
- Readable text sizes
- Full-width inputs on mobile

---

## Accessibility

- Semantic HTML tags
- ARIA labels on necessary components
- Color contrast meets WCAG
- Keyboard navigation support
- Screen reader friendly

---

## Future Enhancements

1. **Real-time Updates:**
   - WebSocket for progress updates
   - SignalR for live notifications

2. **Advanced Features:**
   - Calendar views for scheduling
   - Map integration for route optimization
   - File uploads for multiple evidence
   - Invoice PDF generation

3. **Analytics:**
   - Service completion rates
   - Caretaker performance metrics
   - Customer satisfaction tracking

4. **Internationalization:**
   - Already set up via i18n
   - Translate all UI text to Vietnamese/English

---

## Troubleshooting

### Form Validation Not Working
- Check React Hook Form Controller usage
- Verify validation rules are correct
- Ensure form is inside form tag with handleSubmit

### API Calls Returning 404
- Implement API routes in `app/api/services/`
- Check endpoint paths match component calls
- Add proper error handling

### Styling Issues
- Import MUI components correctly
- Ensure MUI provider is in layout
- Check theme configuration in next.config

### Type Errors
- Import types from `@/types/service.types`
- Verify all required props are provided
- Check API response matches type definitions

---

## Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com)
- [React Hook Form Documentation](https://react-hook-form.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Last Updated:** February 28, 2026
**Status:** Complete Implementation
