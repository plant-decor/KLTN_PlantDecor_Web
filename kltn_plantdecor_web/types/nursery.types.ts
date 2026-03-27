export interface NurseryResponse {
  nurseryId: number;
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
