export interface ManagerNurseryDesignTemplateListItem {
  id: number;
  nurseryId: number;
  nurseryName: string;
  designTemplateId: number;
  designTemplateName: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ManagerNotOfferedDesignTemplate {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export interface ManagerCreateNurseryDesignTemplateRequest {
  designTemplateId: number;
}
