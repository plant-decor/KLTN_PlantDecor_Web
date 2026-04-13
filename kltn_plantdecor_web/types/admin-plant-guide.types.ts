export interface PlantGuideFormData {
  lightRequirement: string;
  watering: string;
  fertilizing: string;
  pruning: string;
  temperature: string;
  humidity: string;
  soil: string;
  careNotes: string;
}

export interface AdminPlantGuideFormData extends PlantGuideFormData {
  plantId: string;
}

export interface AdminPlantGuideUpsertRequest extends PlantGuideFormData {
  plantId: number;
}

export interface AdminPlantGuideDetail {
  id: number;
  plantId: number;
  plantName: string;
  lightRequirementId: number;
  lightRequirementName: string;
  watering: string;
  fertilizing: string;
  pruning: string;
  temperature: string;
  humidity: string;
  soil: string;
  careNotes: string;
  createdAt: string;
}

export interface AdminPlantGuideListPayload {
  items: AdminPlantGuideDetail[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AdminPlantGuideSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  plantId?: number;
  keyword?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface AdminLightRequirementOption {
  value: number;
  name: string;
}

export interface AdminLightRequirementGroup {
  enumName: string;
  values: AdminLightRequirementOption[];
}
