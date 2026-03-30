export interface NurseryResponse {
  nurseryId: number;
  commonPlantId?: number | null;
  nurseryPlantComboId?: number | null;
  nurseryMaterialId?: number | null;
  nurseryName: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  availableInstanceCount: number;
  availableCommonQuantity: number | null;
  availableComboQuantity: number | null;
  availableMaterialQuantity: number | null;
  minPrice: number;
  maxPrice: number;
}
