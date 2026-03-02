import { SAMPLE_PLANT_INSTANCES, PlantInstance, STORE_USER_ID } from '@/data/sampledata';

/**
 * Get available plant instances for sale (store instances)
 * In real app, these would come from a database with status='available' or similar
 * For now, we use instances with STORE_USER_ID
 */
export const getAvailablePlantInstances = (plantId: number): PlantInstance[] => {
  return SAMPLE_PLANT_INSTANCES.filter(instance =>
    instance.plantId === plantId && 
    instance.userId === STORE_USER_ID
  );
};

/**
 * Get minimum price from available instances
 * Used to display lowest price in plant listing
 */
export const getMinPriceFromInstances = (instances: PlantInstance[], defaultPrice: number): number => {
  if (instances.length === 0) return defaultPrice;
  
  const prices = instances.map(i => i.price ?? defaultPrice);
  return Math.min(...prices);
};

/**
 * Get instances owned by a specific user
 */
export const getUserPlantInstances = (plantId: number, userId: number): PlantInstance[] => {
  return SAMPLE_PLANT_INSTANCES.filter(instance =>
    instance.plantId === plantId && instance.userId === userId
  );
};
