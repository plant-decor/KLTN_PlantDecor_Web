export interface AllergyPlantOption {
  plantId: number;
  plantName: string;
}

export interface RoomAnalysisResult {
  availableSpace: string;
  colorPalette: string[];
  summary: string;
}

export interface RoomPlantRecommendation {
  entityType: 'CommonPlant' | 'PlantInstance' | string;
  entityId: number;
  productId: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  fengShuiElement: string | null;
  matchScore: number;
  nurseryId: number | null;
  nurseryName: string | null;
  reasonForRecommendation: string | null;
  suggestedPlacement: string | null;
  careDifficulty: string | null;
  isPurchasable: boolean;
}

export interface AnalyzeRoomUploadPayload {
  roomAnalysis: RoomAnalysisResult;
  recommendations: RoomPlantRecommendation[];
  totalCount: number;
  processingTimeMs: number;
  userId: number;
  layoutDesignId: number;
}

export interface AnalyzeRoomUploadRequest {
  image: File;
  fengShuiElement?: string | null;
  roomType: string;
  roomStyle: string;
  minBudget?: number;
  maxBudget?: number;
  careLevelType?: string;
  hasAllergy?: boolean;
  allergyNote?: string;
  allergicPlantIds?: number[];
  petSafe?: boolean;
  childSafe?: boolean;
  preferredNurseryIds?: number[];
}

export interface GeneratedLayoutImageItem {
  layoutDesignPlantId: number;
  commonPlantId: number | null;
  plantInstanceId: number | null;
  placementPosition: string | null;
  isSuccess: boolean;
  imageUrl: string | null;
  fluxPromptUsed: string | null;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface GenerateLayoutImagesPayload {
  layoutDesignId: number;
  totalItems: number;
  successCount: number;
  failureCount: number;
  statusAfter: number;
  items: GeneratedLayoutImageItem[];
}

export interface GeneratedImageItem {
  id: number;
  layoutDesignId?: number | null;
  layoutDesignPlantId?: number | null;
  commonPlantId?: number | null;
  plantInstanceId?: number | null;
  imageUrl: string | null;
  fluxPromptUsed: string | null;
  createdAt: string;
}
