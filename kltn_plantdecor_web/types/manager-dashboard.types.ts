export interface NurseryOrderStatusSummaryItem {
  status: number;
  statusName: string;
  totalOrders: number;
}

export interface NurseryOrderStatusSummaryPayload {
  from: string;
  to: string;
  items: NurseryOrderStatusSummaryItem[];
}

export interface NurseryFailedOrdersPayload {
  from: string;
  to: string;
  totalFailedOrders: number;
}

export interface NurseryRevenueSummaryPayload {
  from: string;
  to: string;
  totalRevenue: number;
  totalOrders: number;
}

export interface NurseryTopProductItem {
  productType: string;
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface MyNurseryMaterialSummaryCommonPlants {
  totalProducts: number;
  totalQuantity: number;
  totalReservedQuantity: number;
  totalAvailableQuantity: number;
  lowStockProducts: number;
}

export interface MyNurseryMaterialSummaryPlantInstances {
  totalInstances: number;
  availableInstances: number;
  reservedInstances: number;
  soldInstances: number;
  damagedInstances: number;
  inactiveInstances: number;
  lowStockPlants: number;
}

export interface MyNurseryMaterialSummaryMaterials {
  totalProducts: number;
  totalQuantity: number;
  totalReservedQuantity: number;
  totalAvailableQuantity: number;
  expiringSoonProducts: number;
  lowStockProducts: number;
}

export interface MyNurseryMaterialSummaryPayload {
  nurseryId: number;
  nurseryName: string;
  generatedAt: string;
  commonPlants: MyNurseryMaterialSummaryCommonPlants;
  plantInstances: MyNurseryMaterialSummaryPlantInstances;
  materials: MyNurseryMaterialSummaryMaterials;
}
