export interface DesignTemplateSpecialization {
  id: number;
  name: string;
  description?: string;
}

export interface DesignTemplateTierItem {
  id?: number;
  designTemplateTierId?: number;
  materialId: number | null;
  plantId: number | null;
  itemType: number;
  quantity: number;
  createdAt?: string;
}

export interface DesignTemplateTier {
  id: number;
  designTemplateId: number;
  tierName: string;
  minArea: number;
  maxArea: number;
  packagePrice: number;
  scopedOfWork: string;
  estimatedDays: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  items: DesignTemplateTierItem[];
}

export interface AdminDesignTemplateListItem {
  id: number;
  name: string;
  description: string;
  style: number;
  imageUrl: string;
  roomTypes: number[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tiers: DesignTemplateTier[];
  specializations: DesignTemplateSpecialization[];
  nurseryOfferings?: DesignTemplateNurseryOffering[];
}

export interface AdminDesignTemplateDetail extends AdminDesignTemplateListItem {
  tiers: DesignTemplateTier[];
  specializations: DesignTemplateSpecialization[];
  nurseryOfferings: DesignTemplateNurseryOffering[];
}

export interface AdminDesignTemplateCreateRequest {
  name: string;
  description: string;
  style: number;
  roomTypes: number[];
  imageUrl: string;
  specializationIds: number[];
}

export interface AdminDesignTemplateUpdateRequest {
  name: string;
  description: string;
  style: number;
  roomTypes: number[];
  imageUrl: string;
}

export interface AdminDesignTemplateTierCreateRequest {
  designTemplateId: number;
  tierName: string;
  minArea: number;
  maxArea: number;
  packagePrice: number;
  scopedOfWork: string;
  estimatedDays: number;
  isActive: boolean;
  items: DesignTemplateTierItemCreateRequest[];
}

export interface AdminDesignTemplateTierUpdateRequest {
  tierName: string;
  minArea: number;
  maxArea: number;
  packagePrice: number;
  scopedOfWork: string;
  estimatedDays: number;
  isActive: boolean;
}

export interface DesignTemplateTierItemCreateRequest {
  materialId: number | null;
  plantId: number | null;
  itemType: number;
  quantity: number;
}

export interface DesignTemplateNurseryOffering {
  id?: number;
  nurseryDesignTemplateId?: number;
  nurseryId: number;
  nurseryName: string;
  designTemplateId?: number;
  designTemplateName?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface DesignTemplateStyleOption {
  value: number;
  label: string;
}

export interface DesignTemplateRoomTypeOption {
  value: number;
  label: string;
}

export interface DesignTemplateTierItemTypeOption {
  value: number;
  label: string;
}
