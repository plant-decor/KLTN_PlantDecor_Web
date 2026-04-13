'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useAuthStore } from '@/lib/store/authStore';
import {
    addComboToWishlist,
    addItemToCart,
    checkWishlistItem,
    removeItemFromWishlist,
} from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import type { ShopNurseryListItem } from '@/lib/api/shopPlantsService';

interface ComboDetailPurchasePanelProps {
    comboId: number;
    comboName: string;
    comboPrice: number;
    nurseries: ShopNurseryListItem[];
    quantityByNurseryId?: Record<number, number>;
}

export default function ComboDetailPurchasePanel({
    comboId,
    comboName,
    comboPrice,
    nurseries,
    quantityByNurseryId = {},
}: ComboDetailPurchasePanelProps) {
    const locale = useLocale();
    const router = useRouter();
    const { user } = useAuthStore();
    const tProducts = useTranslations('products');
    const tWishlist = useTranslations('wishlist');
    const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(nurseries[0]?.id ?? null);
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    const selectedNursery = useMemo(
        () => nurseries.find((nursery) => nursery.id === selectedNurseryId) ?? null,
        [nurseries, selectedNurseryId]
    );

    const maxQuantity = useMemo(() => {
        if (!selectedNursery) return 0;
        const explicitQuantity = quantityByNurseryId[selectedNursery.id];

        if (typeof explicitQuantity === 'number' && Number.isFinite(explicitQuantity)) {
            return Math.max(0, Math.floor(explicitQuantity));
        }

        return 99;
    }, [quantityByNurseryId, selectedNursery]);

    useEffect(() => {
        setQuantity((prev) => Math.min(Math.max(1, prev), Math.max(1, maxQuantity)));
    }, [maxQuantity]);

    useEffect(() => {
        if (!user?.id || !comboId) {
            setIsWishlisted(false);
            return;
        }

        let isMounted = true;

        const loadWishlistState = async () => {
            try {
                const exists = await checkWishlistItem('PlantCombo', comboId, false, false);
                if (isMounted) {
                    setIsWishlisted(Boolean(exists));
                }
            } catch (wishlistError) {
                console.error('Check combo wishlist error:', wishlistError);
            }
        };

        void loadWishlistState();

        return () => {
            isMounted = false;
        };
    }, [comboId, user?.id]);

    const handleAddToCart = async () => {
        if (!user?.id) {
            router.push(`/${locale}/login`);
            return;
        }

        if (!selectedNursery) return;

        try {
            setIsSubmitting(true);
            setError('');
            await addItemToCart({
                quantity: Math.max(1, quantity),
                nurseryPlantComboId: selectedNursery.nurseryPlantComboId ?? selectedNursery.id,
            });
            notifyCartUpdated();
        } catch (err) {
            console.error('Add combo to cart error:', err);
            setError(err instanceof Error ? err.message : 'Failed to add to cart');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBuyNow = () => {
        if (!user?.id) {
            router.push(`/${locale}/login`);
            return;
        }

        if (!selectedNursery || comboPrice <= 0) {
            return;
        }

        const nurseryComboId = selectedNursery.nurseryPlantComboId ?? selectedNursery.id;
        const query = new URLSearchParams({
            orderType: '3',
            paymentStrategy: '1',
            buyNowItemId: String(nurseryComboId),
            buyNowItemType: '2',
            buyNowQuantity: String(Math.max(1, quantity)),
            buyNowItemName: comboName,
            buyNowItemPrice: String(comboPrice),
        });

        router.push(`/${locale}/checkout/${user.id}/0?${query.toString()}`);
    };

    const handleToggleWishlist = async () => {
        if (!user?.id) {
            router.push(`/${locale}/login`);
            return;
        }

        try {
            setIsWishlistLoading(true);
            if (isWishlisted) {
                await removeItemFromWishlist('PlantCombo', comboId);
            } else {
                await addComboToWishlist(comboId);
            }
            setIsWishlisted((prev) => !prev);
        } catch (wishlistError) {
            console.error('Toggle combo wishlist error:', wishlistError);
            setError(wishlistError instanceof Error ? wishlistError.message : 'Failed to update wishlist');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {nurseries.length === 0 ? (
                <p className="text-sm text-gray-500">{tProducts('nurseryDrawer.noNurseries')}</p>
            ) : (
                <div className="space-y-2">
                    {nurseries.map((nursery) => {
                        const quantityAvailable = quantityByNurseryId[nursery.id];
                        return (
                            <button
                                key={`${nursery.id}-${nursery.nurseryPlantComboId ?? 0}`}
                                type="button"
                                onClick={() => setSelectedNurseryId(nursery.id)}
                                className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedNurseryId === nursery.id
                                        ? 'border-(--primary) bg-[color-mix(in_srgb,var(--primary)_12%,white)]'
                                        : 'border-gray-200 bg-white hover:border-(--primary)'
                                    }`}
                            >
                                <p className="font-semibold text-gray-900">{nursery.name}</p>
                                <p className="text-sm text-gray-600">{nursery.address}</p>
                                <p className="text-sm text-gray-600">{nursery.phone}</p>
                                {typeof quantityAvailable === 'number' ? (
                                    <p className="mt-1 text-sm text-gray-600">
                                        {tProducts('nurseryDrawer.quantity')}: {Math.max(0, Math.floor(quantityAvailable))}
                                    </p>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            )}
            <div className='flex center gap-4'>

                <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="px-4 py-2 transition-colors hover:bg-gray-100"
                        disabled={quantity <= 1 || isSubmitting}
                    >
                        -
                    </button>
                    <span className="min-w-14 border-x border-gray-300 px-6 py-2 text-center">{quantity}</span>
                    <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.min(Math.max(1, maxQuantity), prev + 1))}
                        className="px-4 py-2 transition-colors hover:bg-gray-100"
                        disabled={isSubmitting || quantity >= maxQuantity}
                    >
                        +
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!selectedNursery || isSubmitting || maxQuantity <= 0}
                    className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors ${selectedNursery && !isSubmitting && maxQuantity > 0
                            ? 'border border-green-600 text-green-700 hover:bg-green-50'
                            : 'cursor-not-allowed border border-gray-300 text-gray-400'
                        }`}
                >
                    {isSubmitting ? 'Processing...' : tProducts('addToCart')}
                </button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!selectedNursery || isSubmitting || !comboPrice}
                    className={`rounded-lg px-6 py-3 font-semibold transition-colors ${selectedNursery && !isSubmitting && comboPrice
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'cursor-not-allowed bg-gray-300 text-gray-500'
                        }`}
                >
                    {tProducts('buyNow')}
                </button>

                <button
                    type="button"
                    onClick={handleToggleWishlist}
                    disabled={isWishlistLoading}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-colors ${isWishlisted
                            ? 'border-red-500 text-red-600 hover:bg-red-50'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {isWishlisted ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                    <span>{isWishlisted ? tWishlist('removeItem') : tWishlist('addToWishlist')}</span>
                </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
