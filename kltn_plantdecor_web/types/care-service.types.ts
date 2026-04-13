export interface CareServiceSpecialization {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
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
  nurseryCareServiceId: number;
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
  nurseryCareService: {
    id: number;
    nurseryId: number;
    nurseryName: string;
    careServicePackage: Pick<CareServicePackage, "id" | "name" | "description" | "visitPerWeek" | "durationDays" | "serviceType" | "unitPrice">;
  };
}
