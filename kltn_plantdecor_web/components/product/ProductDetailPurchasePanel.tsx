'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import type { Plant } from '@/data/sampledata';
import type { NurseryResponse } from '@/types/nursery.types';
import NurseryList from './NuseriesList';
import AddToCartButton from '@/components/cart/AddToCartButton';
import AddToWishlistButton from './AddToWishlistButton';
import { useAuthStore } from '@/lib/store/authStore';
import {
  searchNurseryPlantInstances,
  type NurseryPlantInstanceItem,
} from '@/lib/api/shopPlantsService';

interface ProductDetailPurchasePanelProps {
  plant: Plant;
  nurseries: NurseryResponse[];
  initialSelectedInstanceId?: number | null;
}

const getNurseryStock = (nursery: NurseryResponse): number =>
  Math.max(
    0,
    nursery.availableInstanceCount ?? 0,
    nursery.availableCommonQuantity ?? 0,
    nursery.availableComboQuantity ?? 0,
    nursery.availableMaterialQuantity ?? 0
  );

export default function ProductDetailPurchasePanel({
  plant,
  nurseries,
  initialSelectedInstanceId,
}: ProductDetailPurchasePanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('productDetail');
  const tProducts = useTranslations('products');
  const { user } = useAuthStore();

  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(
    nurseries[0]?.nurseryId ?? null
  );
  const [instanceItems, setInstanceItems] = useState<NurseryPlantInstanceItem[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const initialSelectedInstanceIdRef = useRef<number | null>(initialSelectedInstanceId ?? null);
  const selectedInstanceIdRef = useRef<number | null>(null);

  useEffect(() => {
    initialSelectedInstanceIdRef.current = initialSelectedInstanceId ?? null;
  }, [initialSelectedInstanceId]);

  useEffect(() => {
    selectedInstanceIdRef.current = selectedInstanceId;
  }, [selectedInstanceId]);

  const isPlantInstanceFlow = plant.availableInstances > 0;

  const updateInstanceInUrl = useCallback((instanceId: number | null) => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const currentInstanceId = params.get('instanceId');
    const nextInstanceId = instanceId && instanceId > 0 ? String(instanceId) : null;

    if (currentInstanceId === nextInstanceId) {
      return;
    }

    if (instanceId && instanceId > 0) {
      params.set('instanceId', String(instanceId));
    } else {
      params.delete('instanceId');
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router]);

  const selectedNursery = useMemo(
    () =>
      nurseries.find((nursery) => nursery.nurseryId === selectedNurseryId) ??
      nurseries[0] ??
      null,
    [nurseries, selectedNurseryId]
  );

  useEffect(() => {
    if (!isPlantInstanceFlow || !selectedNursery?.nurseryId) {
      setInstanceItems([]);
      setSelectedInstanceId(null);
      updateInstanceInUrl(null);
      return;
    }

    let isMounted = true;

    async function loadInstances() {
      setIsLoadingInstances(true);

      try {
        const response = await searchNurseryPlantInstances(
          selectedNursery.nurseryId,
          {
            pagination: {
              pageNumber: 1,
              pageSize: 10,
            },
            nurseryId: selectedNursery.nurseryId,
            plantId: plant.id,
          },
          false
        );

        if (!isMounted) return;
        console.log('response', response);
        const payloadItems = response.payload?.items ?? [];
        setInstanceItems(payloadItems);

        const validCurrentSelectedInstanceId =
          selectedInstanceIdRef.current &&
          payloadItems.some((item) => item.plantInstanceId === selectedInstanceIdRef.current)
            ? selectedInstanceIdRef.current
            : null;
        const validInitialInstanceId =
          initialSelectedInstanceIdRef.current &&
          payloadItems.some((item) => item.plantInstanceId === initialSelectedInstanceIdRef.current)
            ? initialSelectedInstanceIdRef.current
            : null;
        const nextSelectedInstanceId =
          validCurrentSelectedInstanceId ?? validInitialInstanceId ?? payloadItems[0]?.plantInstanceId ?? null;

        setSelectedInstanceId(nextSelectedInstanceId);
        updateInstanceInUrl(nextSelectedInstanceId);
      } catch (error) {
        if (!isMounted) return;
        console.error('Load plant instances error:', error);
        setInstanceItems([]);
        setSelectedInstanceId(null);
        updateInstanceInUrl(null);
      } finally {
        if (!isMounted) return;
        setIsLoadingInstances(false);
      }
    }

    void loadInstances();

    return () => {
      isMounted = false;
    };
  }, [
    isPlantInstanceFlow,
    plant.id,
    selectedNursery?.nurseryId,
    updateInstanceInUrl,
  ]);

  const handleSelectNursery = (nursery: NurseryResponse) => {
    setSelectedNurseryId(nursery.nurseryId);
  };

  const handleSelectInstance = (instanceId: number) => {
    setSelectedInstanceId(instanceId);
    updateInstanceInUrl(instanceId);
  };

  const maxQuantity = useMemo(
    () => (selectedNursery ? getNurseryStock(selectedNursery) : null),
    [selectedNursery]
  );

  const selectedInstance = useMemo(
    () =>
      instanceItems.find((instance) => instance.plantInstanceId === selectedInstanceId) ??
      null,
    [instanceItems, selectedInstanceId]
  );

  const handleProceedPlantInstanceCheckout = () => {
    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!selectedNursery || !selectedInstance) {
      return;
    }

    const query = new URLSearchParams({
      orderType: '2',
      paymentStrategy: '1',
      plantId: String(plant.id),
      nurseryId: String(selectedNursery.nurseryId),
      plantInstanceId: String(selectedInstance.plantInstanceId),
      instanceName: selectedInstance.plantName,
      instancePrice: String(selectedInstance.specificPrice),
    });

    router.push(`/${locale}/checkout/${user.id}/0?${query.toString()}`);
  };

  const handleProceedCommonPlantCheckout = () => {
    if (!user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    const commonPlantId = selectedNursery?.commonPlantId ?? null;
    if (!commonPlantId || commonPlantId <= 0) {
      return;
    }

    const query = new URLSearchParams({
      orderType: '3',
      paymentStrategy: '1',
      buyNowItemId: String(commonPlantId),
      buyNowItemType: '1',
      buyNowQuantity: '1',
      buyNowItemName: plant.name ?? '',
      buyNowItemPrice: String(plant.basePrice ?? 0),
    });

    router.push(`/${locale}/checkout/${user.id}/0?${query.toString()}`);
  };

  return (
    <div className="space-y-3">
      {nurseries.length > 0 ? (
        <NurseryList
          isNurseryAvailable={nurseries}
          selectedNurseryId={selectedNursery?.nurseryId ?? null}
          onSelectNursery={handleSelectNursery}
        />
      ) : (
        <p className="text-sm text-gray-500">{t('purchasePanel.noNurseriesAvailable')}</p>
      )}

      {isPlantInstanceFlow ? (
        <div className="space-y-3">
          {isLoadingInstances ? (
            <p className="text-sm text-gray-500">{t('purchasePanel.loadingPlantInstances')}</p>
          ) : instanceItems.length === 0 ? (
            <p className="text-sm text-gray-500">{t('purchasePanel.noPlantInstancesAtNursery')}</p>
          ) : (
            <div className="space-y-2">
              {instanceItems.map((instance) => (
                <button
                  key={instance.plantInstanceId}
                  type="button"
                  onClick={() => handleSelectInstance(instance.plantInstanceId)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedInstanceId === instance.plantInstanceId
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                    <p className="font-medium text-gray-900">SKU: {instance.sku}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-600">Height: {instance.height} cm</p>
                      <p className="text-sm text-gray-600">Health: {instance.healthStatus}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-600">Trunk Diameter: {instance.trunkDiameter} cm</p>
                      <p className="text-sm text-gray-600">Age: {instance.age}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-base font-semibold text-green-700">
                      {instance.specificPrice.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleProceedPlantInstanceCheckout}
            disabled={!selectedInstance || !selectedNursery}
            className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors ${
              selectedInstance && selectedNursery
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            {tProducts('buyNow')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AddToCartButton
            plant={plant}
            maxQuantity={maxQuantity}
            assumeInStock
            disabled={!selectedNursery}
            cartItemTarget={
              selectedNursery
                ? {
                    commonPlantId: selectedNursery.commonPlantId ?? null,
                    nurseryPlantComboId: selectedNursery.nurseryPlantComboId ?? null,
                    nurseryMaterialId: selectedNursery.nurseryMaterialId ?? null,
                  }
                : undefined
            }
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleProceedCommonPlantCheckout}
              disabled={!selectedNursery?.commonPlantId}
              className={`rounded-lg px-6 py-3 font-semibold transition-colors ${
                selectedNursery?.commonPlantId
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
            >
              {tProducts('buyNow')}
            </button>

            <AddToWishlistButton plant={plant} fullWidth variant="outlined" />
          </div>
        </div>
      )}

      {isPlantInstanceFlow && <AddToWishlistButton plant={plant} fullWidth variant="outlined" />}
    </div>
  );
}
