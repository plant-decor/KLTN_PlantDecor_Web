export interface AdminNursery {
  id: number;
  managerId: number | null;
  managerName: string | null;
  name: string;
  address: string;
  area: number | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  totalPlants?: number;
  totalMaterials?: number;
}

export interface AdminNurserySearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface AdminNurserySearchPayload {
  items: AdminNursery[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AdminNurseryUpsertRequest {
  name: string;
  address: string;
  area: number | null;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  isActive: boolean;
}

export interface AdminNurseryFormData {
  name: string;
  address: string;
  area: string;
  latitude: string;
  longitude: string;
  phone: string;
  isActive: boolean;
}
