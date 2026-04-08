'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Button, Chip, Drawer, Stack } from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import {
  addItemToCart,
  addPlantInstanceToWishlist,
  checkWishlistPlantInstanceByPlantId,
  removeItemFromWishlist,
  type WishlistItemType,
} from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import { get } from '@/lib/api/apiService.client';
import { ResponseModel } from '@/types/api.types';
import type { NurseryResponse } from '@/types/nursery.types';
import NurseryList from './NuseriesList';
import AddToWishlistButton from './AddToWishlistButton';
import { searchNurseryPlantInstances, type NurseryPlantInstanceItem, type ShopPlantListItem } from '@/lib/api/shopPlantsService';
import { formatCurrency } from '@/lib/utils/formatUtil';
import QuantitySelector from './QuantitySelector';
interface ProductCardProps {
  plant: ShopPlantListItem;
  showAddToWishlistButton?: boolean;
  showAddToCartButton?: boolean;
  showRemoveFromWishlistButton?: boolean;
  wishlistItemType?: WishlistItemType;
  wishlistItemId?: number;
  onRemoveFromWishlist?: (itemType: WishlistItemType, itemId: number) => void;
  initialWishlisted?: boolean;
}

type PendingAction = 'cart' | 'wishlist-add' | 'wishlist-remove' | null;

export default function ProductCard({
  plant,
  showAddToWishlistButton = true,
  showAddToCartButton = plant.availableInstances <= 0 ? true : false,
  showRemoveFromWishlistButton = false,
  wishlistItemType = 'Plant',
  wishlistItemId,
  onRemoveFromWishlist,
  initialWishlisted = false,
}: ProductCardProps) {
  const primaryActionButtonSx = {
    textTransform: 'none',
    whiteSpace: 'nowrap',
    minHeight: 44,
    px: 1.5,
    fontSize: '0.95rem',
    lineHeight: 1.2,
    bgcolor: 'var(--primary)',
    '&:hover': { bgcolor: '#45a049' },
  };

  const router = useRouter();
  const locale = useLocale();
  const tProducts = useTranslations('products');
  const tWishlist = useTranslations('wishlist');
  const tCommon = useTranslations('common');
  const { user } = useAuthStore();
  const [isWishlistRemoving, setIsWishlistRemoving] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isNurseryDrawerOpen, setIsNurseryDrawerOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [nurseries, setNurseries] = useState<NurseryResponse[]>([]);
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);
  const [selectedNursery, setSelectedNursery] = useState<NurseryResponse | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [instanceItems, setInstanceItems] = useState<NurseryPlantInstanceItem[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  useEffect(() => {
    if (!isNurseryDrawerOpen) return;
    let isMounted = true;

    const fetchNurseries = async () => {
      try {
        if (plant.availableCommonQuantity > 0) {
          const nurseryResponse = await get<ResponseModel<NurseryResponse[]>>(
            `/shop/plants/${plant.id}/common-nurseries`,
            undefined,
            false
          );
          if (!isMounted) return;
          const nurseryPayload = nurseryResponse?.payload || [];
          setNurseries(nurseryPayload);
          if (nurseryPayload.length > 0) {
            setSelectedNurseryId(nurseryPayload[0].nurseryId);
            setSelectedNursery(nurseryPayload[0]);
            setSelectedQuantity(1);
          }
        } else {
          const nurseryResponse = await get<ResponseModel<NurseryResponse[]>>(
            `/plants/${plant.id}/nurseries`,
            undefined,
            false
          );
          if (!isMounted) return;
          const nurseryPayload = nurseryResponse?.payload || [];
          setNurseries(nurseryPayload);
          if (nurseryPayload.length > 0) {
            setSelectedNurseryId(nurseryPayload[0].nurseryId);
            setSelectedNursery(nurseryPayload[0]);
            setSelectedQuantity(1);
          }
        }
      } catch (error) {
        console.error('Fetch nurseries error:', error);
        if (!isMounted) return;
        setNurseries([]);
      }
    };

    void fetchNurseries();
    return () => {
      isMounted = false;
    };
  }, [plant.id, plant.availableCommonQuantity, isNurseryDrawerOpen]);

  useEffect(() => {
    const needsInstanceSelection = pendingAction === 'wishlist-add' || pendingAction === 'wishlist-remove';
    if (!isNurseryDrawerOpen || !needsInstanceSelection || !selectedNurseryId || !plant.id) {
      setInstanceItems([]);
      setSelectedInstanceId(null);
      return;
    }

    let isMounted = true;

    const loadPlantInstances = async () => {
      setIsLoadingInstances(true);
      try {
        const response = await searchNurseryPlantInstances(
          selectedNurseryId,
          {
            pagination: {
              pageNumber: 1,
              pageSize: 100,
            },
            nurseryId: selectedNurseryId,
            plantId: plant.id,
          },
          false
        );

        if (!isMounted) return;

        const payloadItems = response.payload?.items ?? [];
        setInstanceItems(payloadItems);
        setSelectedInstanceId(payloadItems[0]?.plantInstanceId ?? null);
      } catch (error) {
        console.error('Fetch plant instances error:', error);
        if (!isMounted) return;
        setInstanceItems([]);
        setSelectedInstanceId(null);
      } finally {
        if (isMounted) {
          setIsLoadingInstances(false);
        }
      }
    };

    void loadPlantInstances();

    return () => {
      isMounted = false;
    };
  }, [isNurseryDrawerOpen, pendingAction, plant.id, selectedNurseryId]);

  const isPlantInstanceFlow = plant.availableInstances > 0;

  const handleAddToCart = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    setSelectedNurseryId(null);
    setSelectedNursery(null);
    setSelectedQuantity(1);
    setPendingAction('cart');
    setIsNurseryDrawerOpen(true);
  };

  const handleTogglePlantInstanceWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    setSelectedNurseryId(null);
    setSelectedNursery(null);
    setSelectedInstanceId(null);
    setPendingAction(isWishlisted ? 'wishlist-remove' : 'wishlist-add');
    setIsNurseryDrawerOpen(true);
  };

  const handleCreateOrder = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/${locale}/products/${plant.id}`);
  };

  const getNurseryMaxQuantity = (nursery: NurseryResponse | null): number => {
    if (!nursery) return 0;
    return Math.max(
      0,
      nursery.availableCommonQuantity ?? 0,
      nursery.availableInstanceCount ?? 0,
      nursery.availableComboQuantity ?? 0,
      nursery.availableMaterialQuantity ?? 0
    );
  };

  const selectedNurseryMaxQuantity = getNurseryMaxQuantity(selectedNursery);

  const handleConfirmWithNursery = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!pendingAction || !selectedNursery) return;

    if (pendingAction === 'cart') {
      if (selectedNurseryMaxQuantity <= 0) return;

      const hasCartItemId =
        !!selectedNursery.commonPlantId ||
        !!selectedNursery.nurseryPlantComboId ||
        !!selectedNursery.nurseryMaterialId;

      const addToCartPayload = {
        quantity: Math.min(selectedQuantity, selectedNurseryMaxQuantity),
        commonPlantId: hasCartItemId ? (selectedNursery.commonPlantId ?? null) : plant.id,
        nurseryPlantComboId: selectedNursery.nurseryPlantComboId ?? null,
        nurseryMaterialId: selectedNursery.nurseryMaterialId ?? null,
      };

      try {
        await addItemToCart(addToCartPayload);
        notifyCartUpdated();
        setIsNurseryDrawerOpen(false);
        setPendingAction(null);
      } catch (error) {
        console.error('Add to cart with nursery error:', error);
      }

      return;
    }

    if (!selectedInstanceId) {
      return;
    }

    try {
      setIsWishlistLoading(true);

      if (pendingAction === 'wishlist-add') {
        await addPlantInstanceToWishlist(selectedInstanceId);
      } else {
        await removeItemFromWishlist('PlantInstance', selectedInstanceId);
      }

      const stillWishlisted = await checkWishlistPlantInstanceByPlantId(plant.id, false, false);
      setIsWishlisted(stillWishlisted);
      setIsNurseryDrawerOpen(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Toggle plant-instance wishlist error:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      setIsWishlistRemoving(true);
      const targetItemId = wishlistItemId ?? plant.id;
      if (onRemoveFromWishlist) {
        await Promise.resolve(onRemoveFromWishlist(wishlistItemType, targetItemId));
      } else {
        await removeItemFromWishlist(wishlistItemType, targetItemId);
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
    } finally {
      setIsWishlistRemoving(false);
    }
  };

  const isActionDisabled = isWishlistRemoving || isWishlistLoading;
  const isOutOfStock =
    plant.availableCommonQuantity <= 0 && plant.availableInstances <= 0 && plant.totalAvailableStock <= 0;

  const handleSelectNursery = (nursery: NurseryResponse) => {
    setSelectedNurseryId(nursery.nurseryId);
    setSelectedNursery(nursery);
    setSelectedQuantity(1);
  };

  const handleCancelNurserySelection = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsNurseryDrawerOpen(false);
    setSelectedNurseryId(null);
    setSelectedNursery(null);
    setSelectedQuantity(1);
    setInstanceItems([]);
    setSelectedInstanceId(null);
    setPendingAction(null);
  };

  const drawerConfirmDisabled = useMemo(() => {
    if (!selectedNursery) {
      return true;
    }

    if (pendingAction === 'cart') {
      return selectedNurseryMaxQuantity <= 0;
    }

    return !selectedInstanceId;
  }, [pendingAction, selectedInstanceId, selectedNursery, selectedNurseryMaxQuantity]);

  const drawerConfirmLabel = useMemo(() => {
    if (pendingAction === 'wishlist-add') {
      return tWishlist('addToWishlistCompact');
    }

    if (pendingAction === 'wishlist-remove') {
      return tWishlist('removeItem');
    }

    return tProducts('nurseryDrawer.continue');
  }, [pendingAction, tProducts, tWishlist]);

  const normalizedTagNames = useMemo(() => {
    if (!Array.isArray(plant.tagNames)) return [];

    return plant.tagNames
      .map((tag) => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object' && 'tagName' in tag) {
          return String(tag.tagName ?? '').trim();
        }
        return '';
      })
      .filter((tag) => tag.length > 0);
  }, [plant.tagNames]);

  return (
    <>
      <Link
        href={`/products/${plant.id}`}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow min-h-115 flex flex-col"
      >
        <div className="relative w-full basis-[50%] shrink-0">
          <Image
            src={plant.primaryImageUrl || '/img/fallbackplant.avif'}
            alt={plant.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading='eager'
          />
        </div>
        <div className="basis-[25%] min-h-0 space-y-1 sm:p-5 flex flex-col overflow-hidden">
          <h3 className="font-semibold text-gray-900">{plant.name}</h3>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{color: 'gray', fontSize: '8px', fontWeight:"300"}}>
            {normalizedTagNames.length > 0 ?
            normalizedTagNames.slice(0, 4).map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))      
            : tCommon('noTags')}
            </Stack>
            {plant.description && (
              <p className="text-sm text-gray-600 line-clamp-3">{plant.description}</p>
            )}
        </div>

        <div className="basis-[20%] min-h-0 sm:p-5 pt-0 flex flex-col justify-between">
          <div>
            {plant.basePrice ? (
              <div className="flex flex-col">
                <span className="text-green-600 font-bold text-lg">
                  {formatCurrency(plant.basePrice, 'vi-VN')} VND
                </span>
              </div>
            ) : (
              <span className="text-green-600 font-bold text-lg">Contact us</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {showAddToWishlistButton && (
              <div>
                {isPlantInstanceFlow ? (
                  <Button
                    onClick={handleTogglePlantInstanceWishlist}
                    variant="outlined"
                    size="medium"
                    fullWidth
                    startIcon={isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    color={isWishlisted ? 'error' : 'inherit'}
                    disabled={isActionDisabled}
                    sx={{
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      minHeight: 44,
                      px: 1.5,
                      fontSize: '0.95rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {tWishlist('addToWishlistCompact')}
                  </Button>
                ) : (
                  <AddToWishlistButton
                    plant={plant}
                    label={tWishlist('addToWishlistCompact')}
                    fullWidth
                    size="medium"
                    initialWishlisted={isWishlisted}
                    onChange={setIsWishlisted}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  />
                )}
              </div>
            )}

            {showRemoveFromWishlistButton && (
              <div>
                <Button
                  onClick={handleRemoveFromWishlist}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  color="error"
                  disabled={isActionDisabled}
                  startIcon={<DeleteOutlineIcon fontSize="small" />}
                  sx={{
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    minHeight: 44,
                    px: 1.5,
                    fontSize: '0.95rem',
                    lineHeight: 1.2,
                  }}
                >
                  {tWishlist('removeItem')}
                </Button>
              </div>
            )}

            {showAddToCartButton ? (
              <div>
                <Button
                  onClick={handleAddToCart}
                  variant="contained"
                  size="medium"
                  fullWidth
                  disabled={isActionDisabled || isOutOfStock}
                  sx={primaryActionButtonSx}
                >
                  {isOutOfStock ? tProducts('outOfStock') : tProducts('addToCartCompact')}
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  onClick={handleCreateOrder}
                  variant="contained"
                  size="medium"
                  fullWidth
                  disabled={isActionDisabled}
                  sx={primaryActionButtonSx}
                >
                  {tProducts('createOrder')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Link>

      <Drawer
        anchor="right"
        open={isNurseryDrawerOpen}
        onClose={() => {
          setIsNurseryDrawerOpen(false);
          setSelectedNurseryId(null);
          setSelectedNursery(null);
          setSelectedQuantity(1);
          setInstanceItems([]);
          setSelectedInstanceId(null);
          setPendingAction(null);
        }}
      >
        <div
          className="w-90 max-w-[90vw] p-4"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <h3 className="text-lg font-semibold mb-2">{tProducts('nurseryDrawer.selectNursery')}</h3>
          <p className="text-sm text-gray-600 mb-4">{tProducts('nurseryDrawer.chooseBeforeContinue')}</p>

          {nurseries.length === 0 ? (
            <p className="text-sm text-gray-500">{tProducts('nurseryDrawer.noNurseries')}</p>
          ) : (
            <NurseryList
              isNurseryAvailable={nurseries}
              selectedNurseryId={selectedNurseryId}
              onSelectNursery={handleSelectNursery}
            />
          )}

          {pendingAction === 'cart' && selectedNursery ? (
            <div className="mt-4">
              <QuantitySelector
                value={selectedQuantity}
                max={selectedNurseryMaxQuantity}
                onChange={setSelectedQuantity}
                showAvailable
                preventEventBubbling
              />
            </div>
          ) : null}

          {(pendingAction === 'wishlist-add' || pendingAction === 'wishlist-remove') && selectedNursery ? (
            <div className="mt-4 space-y-2">
              {isLoadingInstances ? (
                <p className="text-sm text-gray-500">Loading plant instances...</p>
              ) : instanceItems.length === 0 ? (
                <p className="text-sm text-gray-500">No plant instances at this nursery.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-auto pr-1">
                  {instanceItems.map((instance) => (
                    <button
                      key={instance.plantInstanceId}
                      type="button"
                      onClick={() => setSelectedInstanceId(instance.plantInstanceId)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selectedInstanceId === instance.plantInstanceId
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-green-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">SKU: {instance.sku}</p>
                      <p className="text-sm text-gray-600">Height: {instance.height} cm</p>
                      <p className="text-sm text-gray-600">Health: {instance.healthStatus}</p>
                      <p className="text-sm font-semibold text-green-700">{formatCurrency(instance.specificPrice, locale)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-4 flex gap-2">
            <Button variant="outlined" fullWidth onClick={handleCancelNurserySelection}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="contained"
              fullWidth
              disabled={drawerConfirmDisabled}
              onClick={handleConfirmWithNursery}
              sx={{
                bgcolor: 'var(--primary)',
                '&:hover': { bgcolor: '#45a049' },
              }}
            >
              {drawerConfirmLabel}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
