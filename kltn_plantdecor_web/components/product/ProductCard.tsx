'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { Button, Drawer } from '@mui/material';
import { DeleteOutline as DeleteOutlineIcon, Star as StarIcon } from '@mui/icons-material';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import {
  addItemToCart,
  removeItemFromWishlist,
  type WishlistItemType,
} from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import { get } from '@/lib/api/apiService.client';
import { ResponseModel } from '@/types/api.types';
import type { NurseryResponse } from '@/types/nursery.types';
import NurseryList from './NuseriesList';
import AddToWishlistButton from './AddToWishlistButton';
import { ShopPlantListItem } from '@/lib/api/shopPlantsService';
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
}

export default function ProductCard({
  plant,
  showAddToWishlistButton = true,
  showAddToCartButton = plant.availableInstances <= 0 ? true : false, 
  showRemoveFromWishlistButton = false,
  wishlistItemType = 'CommonPlant',
  wishlistItemId,
  onRemoveFromWishlist,
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
  const [isNurseryDrawerOpen, setIsNurseryDrawerOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cart' | null>(null);
  const [nurseries, setNurseries] = useState<NurseryResponse[]>([]);
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);
  const [selectedNursery, setSelectedNursery] = useState<NurseryResponse | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    if (!isNurseryDrawerOpen) return;
    let isMounted = true;
    const fetchNurseries = async () => {
      try {
        if (plant.availableCommonQuantity > 0) {
          const nurseries = await get<ResponseModel<NurseryResponse[]>>(`/shop/plants/${plant.id}/common-nurseries`, undefined, false)
          if (!isMounted) return;
          const nurseryPayload = nurseries?.payload || [];
          setNurseries(nurseryPayload);
          if (nurseryPayload.length > 0) {
            setSelectedNurseryId(nurseryPayload[0].nurseryId);
            setSelectedNursery(nurseryPayload[0]);
            setSelectedQuantity(1);
          }
          console.log('Fetch nursery list common plant', nurseries)
        } else {
          const nurseryResponse = await get<ResponseModel<NurseryResponse[]>>(`/plants/${plant.id}/nurseries`, undefined, false);
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

    fetchNurseries();
    return () => {
      isMounted = false;
    };
  }, [plant.id, plant.availableCommonQuantity, isNurseryDrawerOpen]);

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

    if (!pendingAction) return;
    if (!selectedNursery) return;
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

  const isActionDisabled = isWishlistRemoving;
  const isOutOfStock = plant.availableCommonQuantity <= 0 && plant.availableInstances <= 0 && plant.totalAvailableStock <= 0;
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
    setPendingAction(null);
  };

  return (
    <>
      <Link
        href={`/products/${plant.id}`}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="relative w-full h-48">
        <Image
          src={plant.primaryImageUrl || '/img/fallbackplant.avif'}
          alt={plant.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        {/* {plant.tagNames.some(tag => tag.tagName === 'new') && (
          <span className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 text-xs rounded">
            {tProducts('new')}
          </span>
        )} */}
        {/* {plant.basePrice && (
          <span className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 text-xs rounded">
            {tProducts('sale')}
          </span>
        )} */}
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{plant.name}</h3>
       <p className="text-gray-600 text-sm mb-4 line-clamp-2">
  {[
      `${tProducts('careLevelLabel')}: ${plant.careLevel || tCommon('noData')}`,
      `${tProducts('sizeLabel')}: ${plant.size || tCommon('noData')}`,
      plant.categoryNames?.length > 0 ? `${tProducts('categoryLabel')}: ${plant.categoryNames.map(c => c.name).join(', ')}` : ''
  ].filter(Boolean).join(' • ')}
</p>

        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <StarIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
            <span className="ml-1 text-sm text-gray-600">
              {/* {plant.rating} ({plant.reviewCount}) */}
              4.5 (120)
            </span>
          </div>
        </div>

        <div className="mb-4">
          {plant.basePrice ? (
            <div className="flex flex-col">
              <span className="text-gray-400 line-through text-sm">
                {formatCurrency(plant.basePrice, 'vi-VN')} VND
              </span>
              <span className="text-green-600 font-bold text-lg">{formatCurrency(plant.basePrice * 0.8, 'vi-VN')} VND</span>
            </div>
          ) : (
            <span className="text-green-600 font-bold text-lg">
              {/* {plant.basePrice?.toLocaleString(numberLocale)}  */}
              Liên hệ 
              {/* VND */}
              </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch sm:gap-2">
          {showAddToWishlistButton && (
            <div className="sm:flex-1">
              <AddToWishlistButton
                plant={plant}
                label={tWishlist('addToWishlistCompact')}
                fullWidth
                size="medium"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              />
            </div>
          )}

          {showRemoveFromWishlistButton && (
            <div className="sm:flex-1">
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
            <div className="sm:flex-1">
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
          ): (
            <div className="sm:flex-1">
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
          <p className="text-sm text-gray-600 mb-4">
            {tProducts('nurseryDrawer.chooseBeforeContinue')}
          </p>

          {nurseries.length === 0 ? (
            <p className="text-sm text-gray-500">{tProducts('nurseryDrawer.noNurseries')}</p>
          ) : (
            <NurseryList
              isNurseryAvailable={nurseries}
              selectedNurseryId={selectedNurseryId}
              onSelectNursery={handleSelectNursery}
            />
          )}

          {selectedNursery && (
            <div className="mt-4">
              <QuantitySelector
                value={selectedQuantity}
                max={selectedNurseryMaxQuantity}
                onChange={setSelectedQuantity}
                showAvailable
                preventEventBubbling
              />
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              variant="outlined"
              fullWidth
              onClick={handleCancelNurserySelection}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="contained"
              fullWidth
              disabled={!selectedNursery || selectedNurseryMaxQuantity <= 0}
              onClick={handleConfirmWithNursery}
              sx={{
                bgcolor: 'var(--primary)',
                '&:hover': { bgcolor: '#45a049' },
              }}
            >
              {tProducts('nurseryDrawer.continue')}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
