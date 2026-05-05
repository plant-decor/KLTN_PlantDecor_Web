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
  /** Present on public design-template payloads (e.g. GET public/design-templates/{id}). */
  itemTypeName?: string;
  /** Display name for plant/material when returned by API. */
  name?: string;
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

export interface AdminDesignTemplateCreateInput {
  name: string;
  description: string;
  style: number;
  roomTypes: number[];
  imageFile: File;
  specializationIds: number[];
}

export interface AdminDesignTemplateUpdateInput {
  name: string;
  description: string;
  style: number;
  roomTypes: number[];
  imageFile?: File | null;
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

/** Body for PUT `/api/admin/design-template-tiers/{id}/items` — plantId/materialId không dùng gửi 0. */
export interface AdminDesignTemplateTierItemApiBody {
  materialId: number;
  plantId: number;
  itemType: number;
  quantity: number;
}

export interface AdminDesignTemplateTierItemsUpdateRequest {
  items: AdminDesignTemplateTierItemApiBody[];
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
