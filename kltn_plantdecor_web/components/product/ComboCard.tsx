'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, type MouseEvent } from 'react';
import { Button, Chip, Drawer } from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useLocale, useTranslations } from 'next-intl';
import type { ShopUnifiedComboItem } from '@/lib/api/shopUnifiedService';
import { formatCurrency } from '@/lib/utils/formatUtil';
import { useAuthStore } from '@/lib/store/authStore';
import { getPlantComboNurseries, type ShopNurseryListItem } from '@/lib/api/shopPlantsService';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { addComboToWishlist, removeItemFromWishlist } from '@/lib/api/cartWishlistService';

interface ComboCardProps {
  combo: ShopUnifiedComboItem;
  initialWishlisted?: boolean;
}

export default function ComboCard({ combo, initialWishlisted = false }: ComboCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const tProducts = useTranslations('products');
  const tWishlist = useTranslations('wishlist');
  const tCommon = useTranslations('common');
  const { user } = useAuthStore();
  const availableQuantity = (combo.nurseries ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingNurseries, setIsLoadingNurseries] = useState(false);
  const [nurseries, setNurseries] = useState<ShopNurseryListItem[]>([]);
  const [selectedNurseryComboId, setSelectedNurseryComboId] = useState<number | null>(null);
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
        const response = await getPlantComboNurseries(combo.id, false, false);
        if (!mounted) return;

        const payload = response.payload ?? response.data ?? [];
        setNurseries(payload);

        const firstComboId =
          payload[0]?.nurseryPlantComboId ??
          payload[0]?.id ??
          null;
        setSelectedNurseryComboId(firstComboId);
      } catch (error) {
        if (!mounted) return;
        console.error('Fetch combo nurseries error:', error);
        setNurseries([]);
        setSelectedNurseryComboId(null);
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
  }, [combo.id, isDrawerOpen]);

  const selectedNursery = useMemo(
    () =>
      nurseries.find(
        (nursery) => (nursery.nurseryPlantComboId ?? nursery.id) === selectedNurseryComboId
      ) ?? null,
    [nurseries, selectedNurseryComboId]
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
    setSelectedNurseryComboId(null);
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
        await addComboToWishlist(combo.id);
      } else {
        await removeItemFromWishlist('PlantCombo', combo.id);
      }
      setIsWishlisted(nextState);
    } catch (error) {
      console.error('Toggle combo wishlist error:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <>
      <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow min-h-115 h-full flex flex-col">
        <Link href={`/combo/${combo.id}`} className="block basis-[50%] shrink-0">
          <div className="relative w-full h-full">
            <Image
              src={combo.imageUrl || '/img/fallbackplant.avif'}
              alt={combo.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              loading="eager"
            />
          </div>
        </Link>

        <div className="basis-[25%] min-h-0 p-4 sm:p-5 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/combo/${combo.id}`} className="block min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{combo.name}</h3>
            </Link>
            {combo.comboTypeName ? (
              <Chip
                size="small"
                label={combo.comboTypeName}
                sx={{
                  bgcolor: 'color-mix(in srgb, var(--primary) 14%, white)',
                  color: 'var(--foreground)',
                }}
              />
            ) : null}
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-3">
            {combo.description || tCommon('noData')}
          </p>
        </div>

        <div className="basis-[20%] min-h-0 sm:p-5 pt-0 flex flex-col justify-between">
          <div className='flex justify-between items-center'>
            <p className="text-green-600 font-bold text-lg">{formatCurrency(combo.price, locale)}</p>
            <p className="text-sm text-gray-600">{tProducts('inStock')}: {availableQuantity}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* <div className="sm:flex-1">
              <Button
                component={Link}
                href={`/combo/${combo.id}`}
                variant="outlined"
                size="medium"
                fullWidth
                sx={{
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  minHeight: 44,
                  px: 1.5,
                  fontSize: '0.95rem',
                  lineHeight: 1.2,
                }}
              >
                {tProducts('productDetail')}
              </Button>
            </div> */}
            <div>
              <Button
                onClick={handleToggleWishlist}
                variant="outlined"
                size="medium"
                fullWidth
                startIcon={isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                color={isWishlisted ? 'error' : 'inherit'}
                disabled={isWishlistLoading}
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
                sx={{
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  minHeight: 44,
                  px: 1.5,
                  fontSize: '0.95rem',
                  lineHeight: 1.2,
                  bgcolor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  '&:hover': {
                    bgcolor: 'var(--primary)',
                    filter: 'brightness(0.95)',
                  },
                }}
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
          <p className="text-sm text-gray-600">{combo.name}</p>

          {isLoadingNurseries ? (
            <p className="text-sm text-gray-500">{tProducts('nurseryDrawer.loadingNurseries')}</p>
          ) : nurseries.length === 0 ? (
            <p className="text-sm text-gray-500">{tProducts('nurseryDrawer.noNurseries')}</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {nurseries.map((nursery) => {
                const nurseryComboId = nursery.nurseryPlantComboId ?? nursery.id;
                const isSelected = selectedNurseryComboId === nurseryComboId;

                return (
                  <button
                    key={`${nursery.id}-${nurseryComboId}`}
                    type="button"
                    onClick={() => setSelectedNurseryComboId(nurseryComboId)}
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
              id: combo.id,
              name: combo.name,
            }}
            maxQuantity={99}
            assumeInStock
            disabled={!selectedNursery}
            onAdded={handleCloseDrawer}
            cartItemTarget={
              selectedNursery
                ? {
                    nurseryPlantComboId:
                      selectedNursery.nurseryPlantComboId ??
                      selectedNursery.id,
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
