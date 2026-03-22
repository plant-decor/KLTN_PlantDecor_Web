// Plant Types
export interface PlantGuide {
  id?: number;
  plantId: number;
  lightRequirement: string;
  watering: string;
  fertilizing: string;
  pruning: string;
  temperature: string;
  careNotes: string;
  createdAt?: string;
}

export interface Plant {
  plantId: number;
  name: string;
  specificName: string;
  origin: string;
  description: string;
  basePrice: number;
  placement: string;
  size: string;
  minHeight: number;
  maxHeight: number;
  growthRate: string;
  toxicity: boolean;
  airPurifying: boolean;
  hasFlower: boolean;
  fengShuiElement: string;
  fengShuiMeaning: string;
  potIncluded: boolean;
  potSize: string;
  plantType: string;
  careLevel: string;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
  guide?: PlantGuide;
  images?: PlantImage[];
}

export interface PlantImage {
  id?: number;
  plantId?: number;
  url: string;
  preview?: string;
  isThumbnail: boolean;
  createdAt?: string;
}

// Plant Combo Types
export interface PlantCombo {
  plantComboId: number;
  comboCode: string;
  comboName: string;
  comboType: string;
  description: string;
  suitableSpace: string;
  suitableRooms: string;
  fengShuiElement: string;
  fengShuiPurpose: string;
  themeName: string;
  themeDescription: string;
  originalPrice: number;
  comboPrice: number;
  discountPercent: number;
  minPlants: number;
  maxPlants: number;
  tags: string;
  season: string;
  viewCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  images?: PlantComboImage[];
}

export interface PlantComboImage {
  id?: number;
  plantComboId?: number;
  url: string;
  preview?: string;
  isThumbnail: boolean;
  createdAt?: string;
}

// Plant Instance Types
export interface PlantInstance {
  id: number;
  plantId: number;
  currentNurseryId: number;
  sku: string;
  specificPrice: number;
  height: number;
  trunkDiameter: number;
  healthStatus: string;
  age: number;
  description: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
  images?: PlantInstanceImage[];
}

export interface PlantInstanceImage {
  id?: number;
  plantInstanceId?: number;
  url: string;
  preview?: string;
  isThumbnail: boolean;
  createdAt?: string;
}

// Material (Vật tư tiêu hao) Types
export interface Material {
  id: number;
  materialCode: string;
  name: string;
  description: string;
  basePrice: number;
  unit: string;
  brand: string;
  specifications: Record<string, any>;
  expiryMonths: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  images?: MaterialImage[];
}

export interface MaterialImage {
  id?: number;
  materialId?: number;
  url: string;
  preview?: string;
  isThumbnail: boolean;
  createdAt?: string;
}

// Common types
export interface ImageUploadData {
  file: File;
  isThumbnail: boolean;
  preview: string;
  id?: number;
  plantId?: number;
  plantComboId?: number;
  plantInstanceId?: number;
  materialId?: number;
  url?: string;
  createdAt?: string;
}

export interface DialogState {
  open: boolean;
  editingId: number | null;
  editingData: any;
}
