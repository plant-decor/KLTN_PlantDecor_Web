import type { DesignTemplateNurseryOffering } from '@/types/admin-design-template.types';

export interface MarketedDesignTemplateTierItem {
  id: number;
  designTemplateTierId: number;
  materialId: number | null;
  plantId: number | null;
  itemType: number;
  quantity: number;
  createdAt?: string;
}

export interface MarketedDesignTemplateTier {
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
  items: MarketedDesignTemplateTierItem[];
}

export interface MarketedDesignTemplate {
  id: number;
  name: string;
  description: string;
  style: number;
  roomTypes: number[];
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
  specializations?: Array<{ id: number; name: string; description?: string }>;
  tiers: MarketedDesignTemplateTier[];
  nurseryOfferings: DesignTemplateNurseryOffering[];
}

export interface MarketedDesignTemplateTierNursery {
  id: number;
  nurseryId: number;
  nurseryName: string;
  designTemplateId: number;
  designTemplateName: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CustomerDesignRegistrationRequest {
  nurseryId: number;
  designTemplateTierId: number;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  customerNote?: string;
}

export interface CustomerDesignRegistrationResponse {
  id: number;
  nurseryId: number;
  designTemplateTierId: number;
  totalPrice: number;
  depositAmount: number;
  address: string;
  phone: string;
  customerNote?: string;
  status: number;
  statusName: string;
  createdAt?: string;
}
