export interface CareServiceSpecialization {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CareServicePackageSuitabilityRule {
  id?: number;
  careServicePackageId?: number;
  categoryId?: number | null;
  categoryName?: string | null;
  careDifficultyLevel?: number | null;
  careDifficultyLevelName?: string | null;
}

export interface CareServicePackage {
  id: number;
  name: string;
  description: string;
  features: string;
  visitPerWeek: number;
  durationDays: number;
  totalSessions?: number;
  serviceType: number;
  areaLimit: number;
  unitPrice: number;
  isActive: boolean;
  createdAt?: string;
  specializations: CareServiceSpecialization[];
  suitabilityRules?: CareServicePackageSuitabilityRule[];
}

export interface AiRecommendedPackage {
  packageId: number;
  packageName: string;
  unitPrice: number;
  score: number;
  reason: string;
  ecosystemMatchPercentage: number;
  coveragePercentage: number;
}

export interface NurseryCareService {
  id: number;
  nurseryId: number;
  nurseryName: string;
  isActive: boolean;
  createdAt?: string;
  careServicePackage: CareServicePackage;
}

export interface NearbyServiceReference {
  id: number;
  nurseryId: number;
  nurseryName: string;
  careServicePackage: Pick<
    CareServicePackage,
    "id" | "name" | "description" | "visitPerWeek" | "durationDays" | "serviceType" | "unitPrice"
  >;
}

export interface NearbyNursery {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  availableServices: NearbyServiceReference[];
}

export interface EnumOption {
  value: number;
  name: string;
}

export interface NearbyNurseryQuery {
  packageId: number;
  radiusKm: number;
  lat?: number;
  lng?: number;
}

export interface CreateServiceRegistrationRequest {
  careServicePackageId: number;
  preferredNurseryId?: number;
  serviceDate: string;
  scheduleDaysOfWeek: number[];
  preferredShiftId: number;
  address: string;
  phone: string;
  note: string;
  latitude?: number;
  longitude?: number;
}

export interface CreatedServiceRegistration {
  id: number;
  status: number;
  statusName: string;
  serviceDate: string;
  totalSessions: number;
  address: string;
  phone: string;
  note: string;
  latitude: number;
  longitude: number;
  scheduleDaysOfWeek: string;
  createdAt: string;
  prefferedShift: ServiceRegistrationShift | null;
  nurseryCareService: {
    id: number;
    nurseryId: number;
    nurseryName: string;
    careServicePackage: Pick<CareServicePackage, "id" | "name" | "description" | "visitPerWeek" | "durationDays" | "serviceType" | "unitPrice">;
  };
}

export interface ServiceRegistrationShift {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
}

export type PublicShift = ServiceRegistrationShift;

export enum ServiceRegistrationStatusEnum {
  WaitingForNursery = 0,
  PendingApproval = 1,
  AwaitPayment = 2,
  Active = 3,
  Completed = 4,
  Cancelled = 5,
  Rejected = 6,
}

export interface ServiceRegistrationCustomer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export interface ServiceRegistrationActor {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export interface ServiceRegistrationProgress {
  id: number;
  action: string;
  description: string;
  createdAt: string;
}

export interface ServiceRegistrationRating {
  id: number;
  score: number;
  comment?: string;
}

export interface MyServiceRegistration {
  id: number;
  status: number;
  statusName: string;
  serviceDate: string;
  totalSessions: number;
  address: string;
  phone: string;
  note: string;
  latitude: number;
  longitude: number;
  scheduleDaysOfWeek: number[];
  cancelReason: string | null;
  createdAt: string;
  approvedAt: string | null;
  orderId: number | null;
  nurseryCareService: {
    id: number;
    nurseryId: number;
    nurseryName: string;
    careServicePackage: Pick<CareServicePackage, "id" | "name" | "description" | "visitPerWeek" | "durationDays" | "serviceType" | "unitPrice">;
  };
  prefferedShift: ServiceRegistrationShift | null;
  customer: ServiceRegistrationCustomer | null;
  mainCaretaker: ServiceRegistrationActor | null;
  currentCaretaker: ServiceRegistrationActor | null;
  progresses: ServiceRegistrationProgress[];
  rating: ServiceRegistrationRating | null;
}

export type ManagerServiceRegistration = MyServiceRegistration;

export interface PaginatedApiResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ServiceRegistrationsQuery {
  pageNumber?: number;
  pageSize?: number;
}

export interface ManagerServiceRegistrationsQuery extends ServiceRegistrationsQuery {
  skip?: number;
  take?: number;
  status?: ServiceRegistrationStatusEnum;
}

export interface AssignServiceRegistrationCaretakerRequest {
  caretakerId: number;
}

export interface EligibleCaretakerSpecialization {
  id: number;
  name: string;
  description: string;
}

export interface EligibleCaretaker {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  status: number;
  specializations: EligibleCaretakerSpecialization[];
}

export interface ServiceProgressShift {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
}

export interface ServiceProgressCaretaker {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export interface ServiceProgressCustomer {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

export interface ServiceProgressCareServicePackage {
  id: number;
  name: string;
  description: string;
  visitPerWeek: number | null;
  durationDays: number;
  serviceType: number;
  unitPrice: number;
}

export interface ServiceProgressNurseryCareService {
  id: number;
  nurseryId: number;
  nurseryName: string;
  careServicePackage: ServiceProgressCareServicePackage;
}

export interface ServiceProgressServiceRegistration {
  id: number;
  address: string;
  phone: string;
  nurseryCareService: ServiceProgressNurseryCareService;
  customer: ServiceProgressCustomer | null;
}

export interface NurseryServiceScheduleItem {
  id: number;
  serviceRegistrationId: number;
  status: number | string;
  statusName: string;
  taskType?: "CareService" | "DesignService" | (string & {});
  taskTypeName?: string;
  taskDate: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  description: string | null;
  incidentReason: string | null;
  incidentImageUrl: string | null;
  hasIncidents: boolean;
  evidenceImageUrl: string | null;
  shift: ServiceProgressShift | null;
  caretaker: ServiceProgressCaretaker | null;
  customer?: {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
  } | null;
  servicePackage?: {
    id: number;
    name: string;
    description?: string | null;
  } | null;
  serviceRegistration: ServiceProgressServiceRegistration | null;
}

export type ServiceProgressDetail = NurseryServiceScheduleItem;

export interface ServiceProgressReassignRequest {
  newCaretakerId: number;
}
