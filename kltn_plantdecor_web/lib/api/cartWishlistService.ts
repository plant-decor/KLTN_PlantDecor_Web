import { del, get, patch, post } from '@/lib/api/apiService';

const DEFAULT_IMAGE = '/img/background-login.jpg';

type UnknownRecord = Record<string, unknown>;

export interface CartApiItem {
  cartItemId: number;
  plantId: number;
  quantity: number;
  unitPrice: number;
  name: string;
  scientificName: string;
  imageUrl: string;
}

export interface WishlistApiItem {
  plantId: number;
  name: string;
  scientificName: string;
  description: string;
  price: number;
  imageUrl: string;
  careLevel: 'easy' | 'medium' | 'hard';
  size: 'small' | 'medium' | 'large';
  stock: number;
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

const toArray = (response: unknown): UnknownRecord[] => {
  const unwrapped = unwrapResponse(response);

  if (Array.isArray(unwrapped)) {
    return unwrapped.filter(isRecord);
  }

  if (isRecord(unwrapped) && Array.isArray(unwrapped.items)) {
    return unwrapped.items.filter(isRecord);
  }

  return [];
};

const normalizeCartItem = (item: UnknownRecord): CartApiItem => {
  const cartItemId = toNumber(item.cartItemId ?? item.id);
  const plantId = toNumber(item.commonPlantId ?? item.plantId ?? item.id);
  const quantity = Math.max(1, toNumber(item.quantity, 1));
  const unitPrice = toNumber(item.unitPrice ?? item.price ?? item.basePrice);
  const name = toStringSafe(
    item.commonPlantName ?? item.plantName ?? item.name,
    `Plant #${plantId || cartItemId}`
  );
  const scientificName = toStringSafe(
    item.commonPlantScientificName ?? item.scientificName,
    name
  );
  const imageUrl = toStringSafe(
    item.commonPlantImageUrl ?? item.imageUrl ?? item.primaryImageUrl,
    DEFAULT_IMAGE
  );

  return {
    cartItemId,
    plantId,
    quantity,
    unitPrice,
    name,
    scientificName,
    imageUrl,
  };
};

const normalizeWishlistItem = (item: UnknownRecord): WishlistApiItem => {
  const plantId = toNumber(item.commonPlantId ?? item.plantId ?? item.id);
  const name = toStringSafe(
    item.commonPlantName ?? item.plantName ?? item.name,
    `Plant #${plantId}`
  );
  const scientificName = toStringSafe(
    item.commonPlantScientificName ?? item.scientificName,
    name
  );
  const description = toStringSafe(item.description, '');
  const price = toNumber(item.basePrice ?? item.price ?? item.unitPrice);
  const imageUrl = toStringSafe(
    item.commonPlantImageUrl ?? item.imageUrl ?? item.primaryImageUrl,
    DEFAULT_IMAGE
  );
  const careLevelRaw = toStringSafe(item.careLevel, 'easy').toLowerCase();
  const sizeRaw = toStringSafe(item.size, 'medium').toLowerCase();
  const stock = Math.max(0, toNumber(item.availableInstances ?? item.stock, 0));

  const careLevel: WishlistApiItem['careLevel'] =
    careLevelRaw === 'hard' || careLevelRaw === 'medium' ? careLevelRaw : 'easy';
  const size: WishlistApiItem['size'] =
    sizeRaw === 'small' || sizeRaw === 'large' ? sizeRaw : 'medium';

  return {
    plantId,
    name,
    scientificName,
    description,
    price,
    imageUrl,
    careLevel,
    size,
    stock,
  };
};

export const fetchCartItems = async (): Promise<CartApiItem[]> => {
  const response = await get<unknown>(
    '/Cart',
    {
      PageNumber: 1,
      PageSize: 100,
    },
    false,
    false
  );

  return toArray(response).map(normalizeCartItem).filter((item) => item.cartItemId > 0);
};

export const addPlantToCart = async (plantId: number, quantity = 1): Promise<void> => {
  await post(
    '/Cart/items',
    {
      commonPlantId: plantId,
      quantity: Math.max(1, quantity),
    },
    false,
    false
  );
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

export const fetchWishlistItems = async (): Promise<WishlistApiItem[]> => {
  const response = await get<unknown>(
    '/Wishlist',
    {
      PageNumber: 1,
      PageSize: 100,
    },
    false,
    false
  );

  return toArray(response).map(normalizeWishlistItem).filter((item) => item.plantId > 0);
};

export const addPlantToWishlist = async (plantId: number): Promise<void> => {
  await post(`/Wishlist/${plantId}`, undefined, false, false);
};

export const removePlantFromWishlist = async (plantId: number): Promise<void> => {
  await del(`/Wishlist/${plantId}`, false, false);
};

export const checkWishlistPlantInStock = async (plantId: number): Promise<boolean> => {
  const response = await get<unknown>(`/Wishlist/${plantId}/check`, undefined, false, false);
  const unwrapped = unwrapResponse(response);

  if (typeof unwrapped === 'boolean') {
    return unwrapped;
  }

  if (isRecord(unwrapped)) {
    if (typeof unwrapped.inStock === 'boolean') return unwrapped.inStock;
    if (typeof unwrapped.available === 'boolean') return unwrapped.available;
    if (typeof unwrapped.result === 'boolean') return unwrapped.result;
    if (typeof unwrapped.value === 'boolean') return unwrapped.value;
  }

  return false;
};
