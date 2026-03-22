// Mock data for Store Catalog Management

export interface Category {
  id: number;
  parentCategoryId: number | null;
  name: string;
  isActive: boolean;
  categoryType: number;
  categoryTypeName: string;
  createdAt: string;
  updatedAt: string;
  parentCategoryName?: string;
  subCategories?: Category[];
  description: string;
}

export interface Tag {
  "id": number,
  "tagName": string,
  "tagType": number,
  "tagTypeName": string,
}

export interface PlantInstance {
  id: string;
  sku: string;
  quantity: number;
  price: number; // Price for this specific instance
  condition: 'excellent' | 'good' | 'fair';
  location: string;
  dateAdded: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  scientificName: string;
  imageUrl: string;
  thumbnailInstanceId?: string; // ID of instance to use for thumbnail
  price: number;
  categoryIds: number[];
  tagIds: number[];
  instances: PlantInstance[];
  createdAt: string;
  updatedAt: string;
}

