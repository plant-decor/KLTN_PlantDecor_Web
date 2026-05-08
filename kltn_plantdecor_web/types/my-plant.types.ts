export interface MyPlantItem {
  id: number;
  plantId: number;
  plantInstanceId: number | null;
  plantName: string;
  plantSpecificName: string | null;
  imageUrl: string | null;
  primaryImageUrl: string | null;
  purchaseDate: string;
  lastWateredDate: string | null;
  lastFertilizedDate: string | null;
  lastPrunedDate: string | null;
  location: string | null;
  currentTrunkDiameter: number | null;
  currentHeight: number | null;
  healthStatus: string | null;
  age: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlantGuideDetail {
  id: number;
  plantId: number;
  plantName: string;
  lightRequirement: number;
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

export interface MyPlantItemWithGuide extends MyPlantItem {
  guide?: PlantGuideDetail | null;
}

export interface MyPlantUpdateRequest {
  purchaseDate: string;
  lastWateredDate: string;
  lastFertilizedDate: string;
  lastPrunedDate: string;
  location: string;
  currentTrunkDiameter: number;
  currentHeight: number;
  healthStatus: string;
  age: number;
}

export interface MyCareReminderItem {
  id: number;
  userPlantId: number;
  userId?: number;
  careType: number;
  careTypeName: string;
  plantName: string;
  plantImageUrl?: string | null;
  title?: string;
  message?: string;
  content?: string;
  reminderDate: string;
  scheduledDate: string | null;
  isCompleted?: boolean;
  createdAt: string;
}

export interface MyCareReminderListPayload {
  items: MyCareReminderItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface MyCareReminderCreateRequest {
  userPlantId: number;
  careType: number;
  content: string;
  reminderDate: string;
}
