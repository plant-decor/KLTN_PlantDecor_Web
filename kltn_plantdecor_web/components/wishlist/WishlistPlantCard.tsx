'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Button, Chip, Drawer } from '@mui/material';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import {
  addItemToCart,
  type WishlistItemType,
  type WishlistListItem,
} from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import { get } from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type { NurseryResponse } from '@/types/nursery.types';
import { formatCurrency } from '@/lib/utils/formatUtil';
import { getMaterialNurseries, type MaterialNursery } from '@/lib/api/shopMaterialsService';
import { getPlantComboNurseries, type ShopNurseryListItem } from '@/lib/api/shopPlantsService';

interface WishlistPlantCardProps {
  item: WishlistListItem;
  isRemoving: boolean;
  onRemoveFromWishlist: (itemType: WishlistItemType, itemId: number) => Promise<void>;
}

interface NurseryOption {
  id: number;
  name: string;
  address: string;
  phone: string;
  commonPlantId?: number | null;
  nurseryMaterialId?: number | null;
  nurseryPlantComboId?: number | null;
}

const toPositiveId = (value: number): number | null => {
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.floor(value);
};

const resolveWishlistItemHref = (item: WishlistListItem): string | null => {
  if (item.itemType === 'Plant' || item.itemType === 'PlantInstance') {
    const productId = toPositiveId(item.itemType === 'PlantInstance' ? (item.plantId ?? 0) : item.itemId);
    if (!productId) {
      return null;
    }

    return `/products/${productId}`;
  }

  if (item.itemType === 'PlantCombo') {
    const comboId = toPositiveId(item.itemId);
    if (!comboId) {
      return null;
    }

    return `/combo/${comboId}`;
  }

  if (item.itemType === 'Material') {
    const materialId = toPositiveId(item.itemId);
    if (!materialId) {
      return null;
    }

    return `/materials/${materialId}`;
  }

  return null;
};

// const formatCreatedAt = (value: string, locale: string, fallback: string): string => {
//   if (!value) return fallback;
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return value;

//   return new Intl.DateTimeFormat(locale, {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//   }).format(date);
// };

export default function WishlistPlantCard({
  item,
  isRemoving,
  onRemoveFromWishlist,
}: WishlistPlantCardProps) {
  const locale = useLocale();
  const router = useRouter();
  const tWishlist = useTranslations('wishlist');
  const tCommon = useTranslations('common');
  const { user } = useAuthStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingNurseries, setIsLoadingNurseries] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [nurseryOptions, setNurseryOptions] = useState<NurseryOption[]>([]);
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);

  const selectedNursery = useMemo(
    () => nurseryOptions.find((nursery) => nursery.id === selectedNurseryId) ?? null,
    [nurseryOptions, selectedNurseryId]
  );

  const typeLabel = useMemo(() => {
    if (item.itemType === 'Plant') return tWishlist('typePlant');
    if (item.itemType === 'PlantInstance') return tWishlist('typePlantInstance');
    if (item.itemType === 'PlantCombo') return tWishlist('typePlantCombo');
    return tWishlist('typeMaterial');
  }, [item.itemType, tWishlist]);

  const itemHref = useMemo(() => resolveWishlistItemHref(item), [item]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    if (item.itemType === 'PlantInstance') return;
    let mounted = true;

    const mapPlantNurseries = (nurseries: NurseryResponse[]): NurseryOption[] =>
      nurseries.map((nursery) => ({
        id: nursery.nurseryId,
        name: nursery.nurseryName,
        address: nursery.address,
        phone: nursery.phone,
        commonPlantId: nursery.commonPlantId ?? null,
      }));

    const mapMaterialNurseries = (nurseries: MaterialNursery[]): NurseryOption[] =>
      nurseries.map((nursery) => ({
        id: nursery.nurseryMaterialId,
        name: nursery.name,
        address: nursery.address,
        phone: nursery.phone,
        nurseryMaterialId: nursery.nurseryMaterialId,
      }));

    const mapComboNurseries = (nurseries: ShopNurseryListItem[]): NurseryOption[] =>
      nurseries.map((nursery) => ({
        id: nursery.nurseryPlantComboId ?? nursery.id,
        name: nursery.name,
        address: nursery.address,
        phone: nursery.phone,
        nurseryPlantComboId: nursery.nurseryPlantComboId ?? nursery.id,
      }));

    const loadNurseries = async () => {
      setIsLoadingNurseries(true);
      try {
        if (item.itemType === 'Plant') {
          const commonResponse = await get<ResponseModel<NurseryResponse[]>>(
            `/shop/plants/${item.itemId}/common-nurseries`,
            undefined,
            false
          );
          const commonPayload = commonResponse?.payload ?? [];

          if (!mounted) return;

          if (commonPayload.length > 0) {
            const mapped = mapPlantNurseries(commonPayload);
            setNurseryOptions(mapped);
            setSelectedNurseryId(mapped[0]?.id ?? null);
            return;
          }

          const fallbackResponse = await get<ResponseModel<NurseryResponse[]>>(
            `/plants/${item.itemId}/nurseries`,
            undefined,
            false
          );
          const fallbackPayload = fallbackResponse?.payload ?? [];

          if (!mounted) return;

          const mapped = mapPlantNurseries(fallbackPayload);
          setNurseryOptions(mapped);
          setSelectedNurseryId(mapped[0]?.id ?? null);
          return;
        }

        if (item.itemType === 'Material') {
          const response = await getMaterialNurseries(item.itemId, false, false);
          if (!mounted) return;
          const payload = response.payload ?? response.data ?? [];
          const mapped = mapMaterialNurseries(payload);
          setNurseryOptions(mapped);
          setSelectedNurseryId(mapped[0]?.id ?? null);
          return;
        }

        if (item.itemType === 'PlantCombo') {
          const response = await getPlantComboNurseries(item.itemId, false, false);
          if (!mounted) return;
          const payload = response.payload ?? response.data ?? [];
          const mapped = mapComboNurseries(payload);
          setNurseryOptions(mapped);
          setSelectedNurseryId(mapped[0]?.id ?? null);
        }
      } catch (error) {
        console.error('Fetch wishlist nurseries error:', error);
        if (!mounted) return;
        setNurseryOptions([]);
        setSelectedNurseryId(null);
      } finally {
        if (mounted) {
          setIsLoadingNurseries(false);
        }
      }
    };

    void loadNurseries();

    return () => {
      mounted = false;
    };
  }, [isDrawerOpen, item.itemId, item.itemType]);

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setNurseryOptions([]);
    setSelectedNurseryId(null);
  };

  const handlePrimaryAction = () => {
    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    if (item.itemType === 'PlantInstance') {
      const query = new URLSearchParams({
        orderType: '2',
        paymentStrategy: '1',
        plantId: String(item.plantId ?? 0),
        plantInstanceId: String(item.itemId),
        instanceName: item.itemName,
        instancePrice: String(item.price),
      });
      router.push(`/${locale}/checkout/${user.id}/0?${query.toString()}`);
      return;
    }

    setIsDrawerOpen(true);
  };

  const handleAddToCart = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!selectedNursery) return;

    try {
      setIsAddingToCart(true);

      if (item.itemType === 'Plant' && selectedNursery.commonPlantId) {
        await addItemToCart({ commonPlantId: selectedNursery.commonPlantId, quantity: 1 });
      } else if (item.itemType === 'Material' && selectedNursery.nurseryMaterialId) {
        await addItemToCart({ nurseryMaterialId: selectedNursery.nurseryMaterialId, quantity: 1 });
      } else if (item.itemType === 'PlantCombo' && selectedNursery.nurseryPlantComboId) {
        await addItemToCart({
          nurseryPlantComboId: selectedNursery.nurseryPlantComboId,
          quantity: 1,
        });
      } else {
        return;
      }

      notifyCartUpdated();
      handleCloseDrawer();
    } catch (error) {
      console.error('Add wishlist item to cart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const drawerConfirmDisabled =
    isAddingToCart ||
    !selectedNursery ||
    (item.itemType === 'Plant' && !selectedNursery.commonPlantId) ||
    (item.itemType === 'Material' && !selectedNursery.nurseryMaterialId) ||
    (item.itemType === 'PlantCombo' && !selectedNursery.nurseryPlantComboId);

  const cardActionButtonSx = {
    textTransform: 'none' as const,
    whiteSpace: 'nowrap' as const,
    minHeight: 44,
    px: 1.5,
    fontSize: '0.95rem',
    lineHeight: 1.2,
  };
  const primaryActionButtonSx = {
    ...cardActionButtonSx,
    bgcolor: 'var(--primary)',
    '&:hover': { bgcolor: '#45a049' },
  };

  console.log(item);
  return (
    <>
      {itemHref && (
        <Link href={itemHref}
          className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow min-h-115 flex flex-col"
        >
          {/* <article className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow min-h-115 h-full flex flex-col"> */}
          <div className="relative w-full basis-[60%] shrink-0">
            <Image
              src={item.itemImageUrl || '/img/fallbackplant.avif'}
              alt={item.itemName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain"
              loading='eager'
            />
          </div>

          <div className="hidden 2xl:flex 2xl:basis-[15%] min-h-0 space-y-1 p-2 sm:p-2 md:p-4 lg:p-5 flex-col overflow-hidden">
            <div className="w-full flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                {item.itemName && (
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 min-w-0">
                    {item.itemName}
                  </h3>
                )}

                {/* Chỉ hiện Chip ở đây nếu không phải là PlantInstance */}
                {!(item.nurseryName && item.itemType === 'PlantInstance') && (
                  <Chip
                    className="shrink-0"
                    size="small"
                    label={typeLabel}
                    sx={{
                      bgcolor: 'color-mix(in srgb, var(--primary) 14%, white)',
                      color: 'var(--foreground)',
                    }}
                  />
                )}
              </div>

              {/* Hiện Nursery ở dòng riêng bên dưới tên cây */}
              {item.nurseryName && item.itemType === 'PlantInstance' && (
                <p className="text-sm text-gray-500 truncate">
                  {tWishlist('nursery')}: {item.nurseryName}
                </p>
              )}
            </div>
          </div>

          <div className="basis-[35%] 2xl:basis-[20%] min-h-0 p-2 sm:p-2 md:p-4 lg:p-5 pt-0 flex flex-col justify-between">
            <div>
              <p className="text-green-600 font-bold text-lg">{formatCurrency(item.price, locale)}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-1 2xl:grid-cols-2">
              <div>
                <Button
                  variant="outlined"
                  color="error"
                  size="medium"
                  fullWidth
                  disabled={isRemoving}
                  onClick={() => void onRemoveFromWishlist(item.itemType, item.itemId)}
                  sx={cardActionButtonSx}
                >
                  {tWishlist('removeItem')}
                </Button>
              </div>
              <div>
                <Button
                  variant="contained"
                  size="medium"
                  fullWidth
                  onClick={handlePrimaryAction}
                  sx={primaryActionButtonSx}
                >
                  {item.itemType === 'PlantInstance'
                    ? tWishlist('proceedToCheckout')
                    : tWishlist('addToCart')}
                </Button>
              </div>
            </div>
          </div>
          {/* </article> */}
        </Link>
      )}

      <Drawer anchor="right" open={isDrawerOpen} onClose={handleCloseDrawer}>
        <div className="w-90 max-w-[90vw] p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{tWishlist('selectNursery')}</h3>
          <p className="text-sm text-gray-600">{item.itemName}</p>

          {isLoadingNurseries ? (
            <p className="text-sm text-gray-500">{tWishlist('loadingNurseries')}</p>
          ) : nurseryOptions.length === 0 ? (
            <p className="text-sm text-gray-500">{tWishlist('noNurseries')}</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {nurseryOptions.map((nursery) => {
                const isSelected = selectedNurseryId === nursery.id;
                return (
                  <button
                    key={nursery.id}
                    type="button"
                    onClick={() => setSelectedNurseryId(nursery.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${isSelected
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300'
                      }`}
                  >
                    <p className="font-medium text-gray-900">{nursery.name}</p>
                    <p className="text-sm text-gray-600">{nursery.address}</p>
                    <p className="text-sm text-gray-600">{nursery.phone}</p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outlined" fullWidth onClick={handleCloseDrawer}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={(event) => void handleAddToCart(event)}
              disabled={drawerConfirmDisabled}
              sx={{
                bgcolor: 'var(--primary)',
                '&:hover': { bgcolor: '#45a049' },
              }}
            >
              {tWishlist('confirmAddToCart')}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
