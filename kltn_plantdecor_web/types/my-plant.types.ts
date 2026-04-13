export interface MyPlantItem {
  id: number;
  plantId: number;
  plantInstanceId: number | null;
  plantName: string;
  plantSpecificName: string | null;
  imageUrl: string | null;
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
