import type { FieldError } from 'react-hook-form';
import type { PlantDetail, PlantFormData } from '@/types/store-management.types';
import type { PlantGuideFormData } from '@/types/admin-plant-guide.types';
// Plant Guide i18n labels
export const PLANT_GUIDE_LABELS = {
  lightRequirement: 'Light requirement',
  lightRequirementPlaceholder: 'Choose light requirement',
  watering: 'Watering',
  fertilizing: 'Fertilizing',
  pruning: 'Pruning',
  temperature: 'Temperature',
  humidity: 'Humidity',
  soil: 'Soil',
  careNotes: 'Care notes',
} as const;

// Boolean flags labels
export const BOOLEAN_FLAGS_LABELS = {
  toxicity: 'Toxicity',
  airPurifying: 'Air purifying',
  hasFlower: 'Has flower',
  petSafe: 'Pet safe',
  childSafe: 'Child safe',
  potIncluded: 'Pot included',
  isUniqueInstance: 'Unique instance',
  isActive: 'Active',
} as const;

const defaultPlant: PlantFormData = {
  name: '',
  specificName: '',
  origin: '',
  description: '',
  basePrice: 0,
  placementType: 0,
  size: 0,
  growthRate: 0,
  toxicity: false,
  airPurifying: false,
  hasFlower: false,
  petSafe: false,
  childSafe: false,
  fengShuiElement: 0,
  fengShuiMeaning: '',
  potIncluded: false,
  potSize: '',
  careLevelType: 0,
  careLevel: '',
  roomType: [],
  roomStyle: [],
  isActive: true,
  isUniqueInstance: false,
  categoryIds: [],
  tagIds: [],
  plantGuide: {
    lightRequirement: '',
    watering: '',
    fertilizing: '',
    pruning: '',
    temperature: '',
    humidity: '',
    soil: '',
    careNotes: '',
  },
};

/**
 * Map editingData to form structure
 */
export const mapEditingDataToForm = (
  editingData: PlantDetail,
  plantGuideData?: PlantGuideFormData
): PlantFormData => ({
  name: editingData.name,
  specificName: editingData.specificName || '',
  origin: editingData.origin || '',
  description: editingData.description || '',
  basePrice: editingData.basePrice,
  placementType: editingData.placementType,
  size: editingData.size,
  growthRate: editingData.growthRate ?? 0,
  toxicity: editingData.toxicity,
  airPurifying: editingData.airPurifying,
  hasFlower: editingData.hasFlower,
  petSafe: editingData.petSafe,
  childSafe: editingData.childSafe,
  fengShuiElement: editingData.fengShuiElement ?? 0,
  fengShuiMeaning: editingData.fengShuiMeaning || '',
  potIncluded: editingData.potIncluded,
  potSize: editingData.potSize || '',
  careLevelType: editingData.careLevelType,
  careLevel: editingData.careLevel,
  roomType: editingData.roomType || [],
  roomStyle: editingData.roomStyle || [],
  isActive: editingData.isActive,
  isUniqueInstance: editingData.isUniqueInstance,
  categoryIds: (editingData.categories ?? []).map((item) => item.id),
  tagIds: (editingData.tags ?? []).map((item) => item.id),
  plantGuide: plantGuideData || defaultPlant.plantGuide,
});

/**
 * Get default plant form data
 */
export const getDefaultPlant = (): PlantFormData => ({ ...defaultPlant });

/**
 * Convert multiple select event value to number array
 */
export const handleMultipleSelectChange = (value: number[] | string[]): number[] => {
  return value.map((item) => Number(item));
};

/**
 * Format validation error message
 */
export const getValidationMessage = (error?: FieldError): string => {
  if (!error) {
    return '';
  }

  if (error.message) {
    return error.message;
  }

  switch (error.type) {
    case 'required':
      return 'This field is required.';
    case 'min':
      return 'Please choose a valid value.';
    default:
      return 'Invalid value.';
  }
};
