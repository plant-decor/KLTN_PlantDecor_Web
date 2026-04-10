'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import AddToCartButton from '@/components/cart/AddToCartButton';
import type { ShopNurseryListItem } from '@/lib/api/shopPlantsService';

interface ComboDetailPurchasePanelProps {
  comboId: number;
  comboName: string;
  nurseries: ShopNurseryListItem[];
  quantityByNurseryId?: Record<number, number>;
}

export default function ComboDetailPurchasePanel({
  comboId,
  comboName,
  nurseries,
  quantityByNurseryId = {},
}: ComboDetailPurchasePanelProps) {
  const tProducts = useTranslations('products');
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(nurseries[0]?.id ?? null);

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

  return (
    <div className="space-y-4">
      {nurseries.length === 0 ? (
        <p className="text-sm text-gray-500">{tProducts('nurseryDrawer.noNurseries')}</p>
      ) : (
        <div className="space-y-2">
          {nurseries.map((nursery) => {
            const quantity = quantityByNurseryId[nursery.id];
            return (
              <button
                key={`${nursery.id}-${nursery.nurseryPlantComboId ?? 0}`}
                type="button"
                onClick={() => setSelectedNurseryId(nursery.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedNurseryId === nursery.id
                    ? 'border-(--primary) bg-[color-mix(in_srgb,var(--primary)_12%,white)]'
                    : 'border-gray-200 bg-white hover:border-(--primary)'
                }`}
              >
                <p className="font-semibold text-gray-900">{nursery.name}</p>
                <p className="text-sm text-gray-600">{nursery.address}</p>
                <p className="text-sm text-gray-600">{nursery.phone}</p>
                {typeof quantity === 'number' ? (
                  <p className="text-sm text-gray-600 mt-1">
                    {tProducts('nurseryDrawer.quantity')}: {Math.max(0, Math.floor(quantity))}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      <AddToCartButton
        item={{ id: comboId, name: comboName }}
        maxQuantity={maxQuantity}
        assumeInStock
        disabled={!selectedNursery}
        cartItemTarget={
          selectedNursery
            ? {
                nurseryPlantComboId: selectedNursery.nurseryPlantComboId ?? selectedNursery.id,
              }
            : undefined
        }
      />
    </div>
  );
}
