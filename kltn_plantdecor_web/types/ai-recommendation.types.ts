export interface AllergyPlantOption {
  plantId: number;
  plantName: string;
}

export type RoomDesignEnumName =
  | 'RoomType'
  | 'RoomStyle'
  | 'LightRequirement'
  | 'LightDirection'
  | 'DominantDirection'
  | 'RoomViewAngle'
  | 'LayoutDesignStatus'
  | 'RoomUploadModerationStatus'
  | 'AiLayoutResponseModerationStatus'
  | 'FengShuiElement'
  | string;

export interface RoomDesignEnumValue {
  value: number;
  name: string;
}

export interface RoomDesignEnumGroup {
  enumName: RoomDesignEnumName;
  values: RoomDesignEnumValue[];
}

export interface RoomAnalysisResult {
  numberOfPlantsSuggest?: number;
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

export type RoomViewAngle = 'Front' | 'Left' | 'Right' | 'Back' | string;

export interface UploadRoomImagesRequest {
  imagesByViewAngle: Partial<Record<RoomViewAngle, File>>;
}

export interface UploadedRoomImageItem {
  roomImageId: number;
  imageUrl: string | null;
  viewAngle: RoomViewAngle;
  moderationStatus?: string | null;
  moderationReason?: string | null;
  uploadedAt?: string | null;
}

export interface UploadRoomImagesPayload {
  roomImages: UploadedRoomImageItem[];
}

export interface AnalyzeRoomRequest {
  roomImageIds: number[];
  fengShuiElement?: string | null;
  roomType?: string | null;
  roomStyle?: string | null;
  roomArea?: number | null;
  lightDirection?: string | null;
  dominantDirection?: string | null;
  naturalLightLevel?: string | null;
  minBudget?: number | null;
  maxBudget?: number | null;
  careLevelType?: string | null;
  hasAllergy?: boolean | null;
  allergyNote?: string | null;
  allergicPlantIds?: number[] | null;
  petSafe?: boolean | null;
  childSafe?: boolean | null;
  preferredNurseryIds?: number[] | null;
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
