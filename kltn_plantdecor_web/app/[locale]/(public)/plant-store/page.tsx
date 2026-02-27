'use client';

import { useState } from 'react';
import { SAMPLE_PLANTS } from '@/data/sampledata';
import ProductCard from '@/components/product/ProductCard';
import PlantFilter from '@/components/StoreCatalog/PlantFilter';
import { useTranslations } from 'next-intl';
import type { SamplePlant } from '@/data/sampledata';

export default function PlantStorePage() {
  const t = useTranslations('plantStore');
  const [filteredPlants, setFilteredPlants] = useState<SamplePlant[]>(SAMPLE_PLANTS);

  const handleFiltersChange = (plants: SamplePlant[]) => {
    setFilteredPlants(plants);
  };

  return (
    <div className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Filter Sidebar */}
          <div className="md:col-span-1">
            <PlantFilter onFiltersChange={handleFiltersChange} plants={SAMPLE_PLANTS} />
          </div>

          {/* Products Grid */}
          <div className="md:col-span-4">
            {filteredPlants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {filteredPlants.map((plant) => (
                  <ProductCard key={plant.id} plant={plant} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-gray-600 mb-4">No plants match your filters</p>
                <button
                  onClick={() => setFilteredPlants(SAMPLE_PLANTS)}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
