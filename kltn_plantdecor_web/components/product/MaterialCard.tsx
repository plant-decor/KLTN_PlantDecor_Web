'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Button, Drawer } from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { addMaterialToWishlist, removeItemFromWishlist } from '@/lib/api/cartWishlistService';
import {
  getMaterialNurseries,
  type MaterialNursery,
  type ShopMaterialListItem,
} from '@/lib/api/shopMaterialsService';
import { formatCurrency } from '@/lib/utils/formatUtil';
import AddToCartButton from '@/components/cart/AddToCartButton';

interface MaterialCardProps {
  material: ShopMaterialListItem;
  initialWishlisted?: boolean;
  showNewBadge?: boolean;
  newBadgeLabel?: string;
}

export default function MaterialCard({
  material,
  initialWishlisted = false,
  showNewBadge = false,
  newBadgeLabel,
}: MaterialCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuthStore();
  const tProducts = useTranslations('products');
  const tWishlist = useTranslations('wishlist');
  const tCommon = useTranslations('common');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nurseries, setNurseries] = useState<MaterialNursery[]>([]);
  const [selectedNurseryMaterialId, setSelectedNurseryMaterialId] = useState<number | null>(null);
  const [isLoadingNurseries, setIsLoadingNurseries] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    let mounted = true;

    const loadNurseries = async () => {
      setIsLoadingNurseries(true);
      try {
        const response = await getMaterialNurseries(material.id, false, false);
        if (!mounted) return;

        const payload = response.payload ?? response.data ?? [];
        setNurseries(payload);
        setSelectedNurseryMaterialId(payload[0]?.nurseryMaterialId ?? null);
      } catch (error) {
        console.error('Fetch material nurseries error:', error);
        if (!mounted) return;
        setNurseries([]);
        setSelectedNurseryMaterialId(null);
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
  }, [isDrawerOpen, material.id]);

  const selectedNursery = useMemo(
    () => nurseries.find((item) => item.nurseryMaterialId === selectedNurseryMaterialId) ?? null,
    [nurseries, selectedNurseryMaterialId]
  );

  const handleOpenDrawer = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedNurseryMaterialId(null);
  };

  const handleToggleWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      setIsWishlistLoading(true);
      const nextState = !isWishlisted;
      if (nextState) {
        await addMaterialToWishlist(material.id);
      } else {
        await removeItemFromWishlist('Material', material.id);
      }
      setIsWishlisted(nextState);
    } catch (error) {
      console.error('Toggle material wishlist error:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const isActionDisabled = isWishlistLoading;
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
  const materialDescription = (
    <>
      <span>
        {tProducts('material.brand')}: {material.brand || tCommon('noData')}
      </span>
      <br />
      <span>
        {tProducts('material.unit')}: {material.unit || tCommon('noData')}
      </span>
    </>
  );

  return (
    <>
      <article className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow min-h-115 h-full flex flex-col">
        <Link href={`/${locale}/materials/${material.id}`} className="block basis-[60%] shrink-0">
          <div className="relative w-full h-full">
            <Image
              src={material.primaryImageUrl || '/img/fallbackplant.avif'}
              alt={material.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain"
              loading="eager"
            />
            {showNewBadge ? (
              <span className="absolute right-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
                {newBadgeLabel ?? tProducts('new')}
              </span>
            ) : null}
          </div>
        </Link>

        <div className="basis-[15%] min-h-0 p-2 sm:p-2 md:p-4 lg:p-5 overflow-hidden ">
          <Link href={`/${locale}/materials/${material.id}`} className="block">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{material.name}</h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{materialDescription}</p>
          </Link>
        </div>

        <div className="basis-[20%] min-h-0 p-2 sm:p-2 md:p-4 lg:p-5 pt-0 flex flex-col justify-between">
          <p className="text-green-600 font-bold text-lg">{formatCurrency(material.basePrice, locale)}</p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Button
                onClick={handleToggleWishlist}
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
            </div>
            <div>
              <Button
                onClick={handleOpenDrawer}
                variant="contained"
                size="medium"
                fullWidth
                disabled={isActionDisabled}
                sx={primaryActionButtonSx}
              >
                {tProducts('addToCartCompact')}
              </Button>
            </div>
          </div>
        </div>
      </article>

      <Drawer anchor="right" open={isDrawerOpen} onClose={handleCloseDrawer}>
        <div className="w-96 max-w-[92vw] p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{tProducts('nurseryDrawer.selectNursery')}</h3>
          <p className="text-sm text-gray-600">{material.name}</p>

          {isLoadingNurseries ? (
            <p className="text-sm text-gray-500">{tProducts('nurseryDrawer.loadingNurseries')}</p>
          ) : nurseries.length === 0 ? (
            <p className="text-sm text-gray-500">{tProducts('nurseryDrawer.noMaterialNursery')}</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {nurseries.map((nursery) => {
                const isSelected = selectedNurseryMaterialId === nursery.nurseryMaterialId;
                return (
                  <button
                    key={nursery.nurseryMaterialId}
                    type="button"
                    onClick={() => setSelectedNurseryMaterialId(nursery.nurseryMaterialId)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isSelected
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

          <AddToCartButton
            item={{
              id: material.id,
              name: material.name,
            }}
            maxQuantity={99}
            assumeInStock
            disabled={!selectedNursery}
            onAdded={handleCloseDrawer}
            cartItemTarget={
              selectedNursery
                ? {
                    nurseryMaterialId: selectedNursery.nurseryMaterialId,
                  }
                : undefined
            }
          />

          <div className="flex gap-2">
            <Button variant="outlined" fullWidth onClick={handleCloseDrawer}>
              {tCommon('cancel')}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
