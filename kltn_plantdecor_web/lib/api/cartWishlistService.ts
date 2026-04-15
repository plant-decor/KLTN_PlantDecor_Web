import { del, get, patch, post } from '@/lib/api/apiService';
import { ResponseModel } from '@/types/api.types';

const DEFAULT_IMAGE = '/img/fallbackplant.avif';

type UnknownRecord = Record<string, unknown>;

export interface CartApiItemResponse {
  items: CartApiItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CartApiItem {
  cartId: number;
  commonPlantId: number | null;
  plantId?: number | null;
  plantComboId?: number | null;
  materialId?: number | null;
  createdAt?: string;
  createAt?: string;
  updateAt?: string;
  id: number;
  nurseryId?: number | null;
  nurseryMaterialId: number | null;
  nurseryPlantComboId: number | null;
  price: number;
  productName: string;
  quantity: number;
  subtotal: number;
  subTotal?: number;
  imageUrl: string | null;
}

export interface AddCartItemRequest {
  commonPlantId?: number | null;
  nurseryPlantComboId?: number | null;
  nurseryMaterialId?: number | null;
  quantity: number;
}

export type WishlistItemType =
  | 'Plant'
  | 'PlantInstance'
  | 'PlantCombo'
  | 'Material';

export interface WishlistListItem {
  id: number;
  itemType: WishlistItemType;
  itemId: number;
  plantId?: number;
  nurseryName?: string;
  itemName: string;
  itemImageUrl: string | null;
  price: number;
  quantity: number | null;
  additionalInfo: string;
  createdAt: string;
}

export interface WishlistPagedPayload {
  items: WishlistListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface FetchWishlistParams {
  pageNumber?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  value !== null && typeof value === 'object';

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const toStringSafe = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
};

const unwrapResponse = (response: unknown): unknown => {
  if (!isRecord(response)) {
    return response;
  }

  if ('payload' in response) {
    return response.payload;
  }

  if ('data' in response) {
    return response.data;
  }

  return response;
};

const parseWishlistItemType = (value: unknown): WishlistItemType => {
  const raw = toStringSafe(value);
  if (raw === 'PlantInstance' || raw === '1') return 'PlantInstance';
  if (raw === 'PlantCombo' || raw === 'NurseryPlantCombo' || raw === '2') return 'PlantCombo';
  if (raw === 'Material' || raw === 'NurseryMaterial' || raw === '3') return 'Material';
  return 'Plant';
};

const normalizeWishlistItem = (item: UnknownRecord): WishlistListItem => {
  const id = toNumber(item.id);
  const itemId = toNumber(
    item.itemId ?? item.commonPlantId ?? item.plantInstanceId ?? item.materialId ?? item.comboId ?? item.id
  );
  const itemType = parseWishlistItemType(item.itemType);
  const itemName = toStringSafe(item.itemName ?? item.name, `Item #${itemId || id}`);
  const itemImageUrl = toStringSafe(item.itemImageUrl ?? item.imageUrl, DEFAULT_IMAGE);
  const rawQuantity = item.quantity;
  const quantity =
    typeof rawQuantity === 'number' || typeof rawQuantity === 'string'
      ? Math.max(0, toNumber(rawQuantity))
      : null;
  const plantId = toNumber(item.plantId);
  const nurseryName = toStringSafe(item.nurseryName);

  return {
    id,
    itemType,
    itemId,
    ...(plantId > 0 ? { plantId } : {}),
    ...(nurseryName ? { nurseryName } : {}),
    itemName,
    itemImageUrl,
    price: toNumber(item.price),
    quantity,
    additionalInfo: toStringSafe(item.additionalInfo),
    createdAt: toStringSafe(item.createdAt),
  };
};

const normalizeWishlistPayload = (response: unknown): WishlistPagedPayload => {
  const unwrapped = unwrapResponse(response);

  if (!isRecord(unwrapped)) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    };
  }

  const rawItems = Array.isArray(unwrapped.items) ? unwrapped.items.filter(isRecord) : [];

  return {
    items: rawItems.map(normalizeWishlistItem).filter((item) => item.itemId > 0),
    totalCount: Math.max(0, toNumber(unwrapped.totalCount)),
    pageNumber: Math.max(1, toNumber(unwrapped.pageNumber, 1)),
    pageSize: Math.max(1, toNumber(unwrapped.pageSize, 10)),
    totalPages: Math.max(0, toNumber(unwrapped.totalPages)),
    hasPrevious: Boolean(unwrapped.hasPrevious),
    hasNext: Boolean(unwrapped.hasNext),
  };
};

export const fetchCartItems = async (): Promise<ResponseModel<CartApiItemResponse>> => {
  const response = await get<ResponseModel<CartApiItemResponse>>(
    '/Cart',
    {
      PageNumber: 1,
      PageSize: 100,
    },
    false,
    false
  );
  return response || [];
};

export const addPlantToCart = async (plantId: number, quantity = 1): Promise<void> => {
  await addItemToCart({
    commonPlantId: plantId,
    quantity,
  });
};

export const addItemToCart = async (request: AddCartItemRequest): Promise<void> => {
  const payload: AddCartItemRequest = {
    quantity: Math.max(1, request.quantity),
    ...(request.commonPlantId ? { commonPlantId: request.commonPlantId } : {}),
    ...(request.nurseryPlantComboId ? { nurseryPlantComboId: request.nurseryPlantComboId } : {}),
    ...(request.nurseryMaterialId ? { nurseryMaterialId: request.nurseryMaterialId } : {}),
  };

  if (!payload.commonPlantId && !payload.nurseryPlantComboId && !payload.nurseryMaterialId) {
    throw new Error('Missing product identifier for cart item');
  }

  await post('/Cart/items', payload, false, false);
};

export const updateCartItemQuantity = async (
  cartItemId: number,
  quantity: number
): Promise<void> => {
  await patch(
    `/Cart/items/${cartItemId}`,
    {
      quantity: Math.max(1, quantity),
    },
    false,
    false
  );
};

export const deleteCartItem = async (cartItemId: number): Promise<void> => {
  await del(`/Cart/items/${cartItemId}`, false, false);
};

export const clearCartItems = async (): Promise<void> => {
  await del('/Cart', false, false);
};

export const fetchWishlistItems = async (
  params: FetchWishlistParams = {},
  isServer = false,
  loading = false
): Promise<WishlistPagedPayload> => {
  const query: Record<string, number> = {
    PageNumber: Math.max(1, params.pageNumber ?? 1),
    PageSize: Math.max(1, params.pageSize ?? 10),
  };

  if (typeof params.skip === 'number' && Number.isFinite(params.skip)) {
    query.Skip = Math.max(0, Math.floor(params.skip));
  }

  if (typeof params.take === 'number' && Number.isFinite(params.take)) {
    query.Take = Math.max(1, Math.floor(params.take));
  }

  const response = await get<unknown>(
    '/Wishlist',
    query,
    isServer,
    loading
  );

  return normalizeWishlistPayload(response);
};

export const addItemToWishlist = async (
  itemType: WishlistItemType,
  itemId: number
): Promise<void> => {
  await post(`/Wishlist/${itemType}/${itemId}`, undefined, false, false);
};

export const addPlantToWishlist = async (plantId: number): Promise<void> => {
  await addItemToWishlist('Plant', plantId);
};

export const addMaterialToWishlist = async (materialId: number): Promise<void> => {
  await addItemToWishlist('Material', materialId);
};

export const addComboToWishlist = async (comboId: number): Promise<void> => {
  await addItemToWishlist('PlantCombo', comboId);
};

export const addPlantInstanceToWishlist = async (plantInstanceId: number): Promise<void> => {
  await addItemToWishlist('PlantInstance', plantInstanceId);
};

export const removeItemFromWishlist = async (
  itemType: WishlistItemType,
  itemId: number
): Promise<void> => {
  await del(`/Wishlist/${itemType}/${itemId}`, false, false);
};

export const removePlantFromWishlist = async (plantId: number): Promise<void> => {
  await removeItemFromWishlist('Plant', plantId);
};

export const checkWishlistItem = async (
  itemType: WishlistItemType,
  itemId: number,
  isServer = false,
  loading = false
): Promise<boolean> => {
  const response = await get<unknown>(
    `/Wishlist/${itemType}/${itemId}/check`,
    undefined,
    isServer,
    loading
  );
  const unwrapped = unwrapResponse(response);

  if (typeof unwrapped === 'boolean') {
    return unwrapped;
  }

  if (isRecord(unwrapped)) {
    if (typeof unwrapped.inWishlist === 'boolean') return unwrapped.inWishlist;
    if (typeof unwrapped.exists === 'boolean') return unwrapped.exists;
    if (typeof unwrapped.inStock === 'boolean') return unwrapped.inStock;
    if (typeof unwrapped.available === 'boolean') return unwrapped.available;
    if (typeof unwrapped.result === 'boolean') return unwrapped.result;
    if (typeof unwrapped.value === 'boolean') return unwrapped.value;
  }

  return false;
};

export const checkWishlistPlantInStock = async (plantId: number): Promise<boolean> => {
  return checkWishlistItem('Plant', plantId);
};

interface WishlistNurseryCandidate {
  nurseryId?: number | null;
}

interface WishlistPlantInstanceCandidate {
  plantInstanceId?: number | null;
}

const extractNurseryIds = (response: unknown): number[] => {
  const unwrapped = unwrapResponse(response);
  const items = Array.isArray(unwrapped)
    ? unwrapped
    : isRecord(unwrapped) && Array.isArray(unwrapped.items)
      ? unwrapped.items
      : [];

  return items
    .filter(isRecord)
    .map((item) => toNumber((item as WishlistNurseryCandidate).nurseryId))
    .filter((value) => value > 0);
};

const extractPlantInstanceIds = (response: unknown): number[] => {
  const unwrapped = unwrapResponse(response);
  const payload = isRecord(unwrapped) ? unwrapped : {};
  const items = Array.isArray(payload.items) ? payload.items : [];

  return items
    .filter(isRecord)
    .map((item) => toNumber((item as WishlistPlantInstanceCandidate).plantInstanceId))
    .filter((value) => value > 0);
};

export const checkWishlistPlantInstanceByPlantId = async (
  plantId: number,
  isServer = false,
  loading = false
): Promise<boolean> => {
  if (!Number.isFinite(plantId) || plantId <= 0) {
    return false;
  }

  try {
    const nurseryResponse = await get<unknown>(
      `/plants/${plantId}/nurseries`,
      undefined,
      isServer,
      loading
    );
    const nurseryIds = extractNurseryIds(nurseryResponse);

    if (nurseryIds.length === 0) {
      return false;
    }

    const instanceSearches = await Promise.allSettled(
      nurseryIds.map((nurseryId) =>
        post<unknown>(
          `/shop/nurseries/${nurseryId}/plant-instances/search`,
          {
            pagination: {
              pageNumber: 1,
              pageSize: 100,
            },
            nurseryId,
            plantId,
          },
          isServer,
          loading
        )
      )
    );

    const instanceIds = instanceSearches.flatMap((result) =>
      result.status === 'fulfilled' ? extractPlantInstanceIds(result.value) : []
    );
    const uniqueInstanceIds = Array.from(new Set(instanceIds));

    if (uniqueInstanceIds.length === 0) {
      return false;
    }

    const checks = await Promise.allSettled(
      uniqueInstanceIds.map((instanceId) =>
        checkWishlistItem('PlantInstance', instanceId, isServer, loading)
      )
    );

    return checks.some((result) => result.status === 'fulfilled' && result.value);
  } catch (error) {
    console.error('Check wishlist plant-instance by plant error:', error);
    return false;
  }
};
