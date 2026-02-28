// Enums for Service Types and Status
export enum ServiceType {
  ONETIME = "ONETIME",
  PERIODIC = "PERIODIC",
}

export enum DifficultyLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  EXPERT = "EXPERT",
}

export enum ServiceRegistrationStatus {
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ServiceProgressAction {
  CHECK_IN = "CHECK_IN",
  SURVEY = "SURVEY",
  WORK_IN_PROGRESS = "WORK_IN_PROGRESS",
  PHOTO_EVIDENCE = "PHOTO_EVIDENCE",
  ADDON_PROPOSAL = "ADDON_PROPOSAL",
  CHECK_OUT = "CHECK_OUT",
  COMPLETED = "COMPLETED",
}

export enum CaretakerAvailabilityStatus {
  AVAILABLE = "AVAILABLE",
  BUSY = "BUSY",
  OFF_DUTY = "OFF_DUTY",
}

// CareServicePackage (Admin creates and manages this)
export interface CareServicePackage {
  id: number;
  name: string;
  description: string;
  features: string[]; // List of features/tasks
  serviceType: ServiceType;
  frequency?: string; // For PERIODIC packages (e.g., "Weekly", "Monthly")
  durationDays: number;
  difficultyLevel: DifficultyLevel;
  areaLimit: number; // Area limit in m²
  unitPrice: number; // Base price
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ServiceRegistration (Customer registers for a service)
export interface ServiceRegistration {
  id: number;
  customerId: number;
  servicePackageId: number;
  address: string;
  phone: string;
  serviceDate: string; // Desired service date/time
  note: string; // Customer's plant condition notes
  status: ServiceRegistrationStatus;
  cancelReason?: string;
  mainCaretakerId?: number;
  estimatedDuration?: number; // Duration in minutes
  createdAt: string;
  updatedAt: string;
  // Relationships
  servicePackage?: CareServicePackage;
  customer?: CustomerInfo;
  caretaker?: CaretakerInfo;
}

// ServiceProgress (Caretaker updates progress)
export interface ServiceProgress {
  id: number;
  serviceRegistrationId: number;
  caretakerId: number;
  action: ServiceProgressAction;
  description: string; // Work notes/observations
  evidenceImageUrl?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
}

// AddOn Service (Additional services proposed during execution)
export interface AddOnService {
  id: number;
  serviceRegistrationId: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  status: "PROPOSED" | "APPROVED" | "REJECTED";
  approvedBy?: number;
  createdAt: string;
  updatedAt: string;
}

// Invoice/Order for service completion
export interface ServiceInvoice {
  id: number;
  serviceRegistrationId: number;
  baseAmount: number; // From CareServicePackage
  addOnAmount: number; // From approved AddOns
  totalAmount: number;
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
  invoiceDate: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Customer Info (Simplified)
export interface CustomerInfo {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
}

// Caretaker Info (Simplified)
export interface CaretakerInfo {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  availabilityStatus: CaretakerAvailabilityStatus;
  totalCompletedServices: number;
  rating: number; // 1-5 stars
}

// Form submission types
export interface ServiceRegistrationFormData {
  servicePackageId: number;
  address: string;
  phone: string;
  serviceDate: string;
  note: string;
}

export interface CareServicePackageFormData {
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
}

export interface AssignCaretakerData {
  caretakerId: number;
  estimatedDuration: number;
}

export interface ServiceProgressData {
  action: ServiceProgressAction;
  description: string;
  evidenceImageUrl?: string;
}

// Response wrapper for API calls
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
