'use client';

import { useState } from 'react';
import { SAMPLE_PLANTS } from '@/data/sampledata';
import ProductCard from '@/components/product/ProductCard';
import PlantFilter from '@/components/store-catalog/PlantFilter';
import { useTranslations } from 'next-intl';
import type { SamplePlant } from '@/data/sampledata';
import { Button } from '@mui/material';
import { FilterAltOutlined, Close } from '@mui/icons-material';

export default function PlantStorePage() {
  const t = useTranslations('plantStore');
  const [filteredPlants, setFilteredPlants] = useState<SamplePlant[]>(SAMPLE_PLANTS);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
          {/* Filter Sidebar - Desktop Only */}
          <div className="hidden md:block md:col-span-1">
            <PlantFilter
              onFiltersChange={handleFiltersChange}
              plants={SAMPLE_PLANTS}
              useInternalMobileDrawer={false}
            />
          </div>

          {/* Backdrop Overlay */}
          {isMobileFilterOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          {/* Mobile Filter Sheet */}
          {isMobileFilterOpen && (
            <div className="fixed bottom-0 left-0 right-0 z-50 h-2/3 bg-white rounded-t-3xl shadow-2xl md:hidden animate-fade-in-up">
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-3xl">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <Button
                  variant="text"
                  className="min-w-0! p-2! text-gray-700!"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  <Close />
                </Button>
              </div>

              <div className="h-[calc(100%-64px)] overflow-y-auto p-4">
                <PlantFilter
                  onFiltersChange={handleFiltersChange}
                  plants={SAMPLE_PLANTS}
                  useInternalMobileDrawer={false}
                  renderInlineOnMobile
                />
              </div>
            </div>
          )}

          {/* Floating Toggle Button - like chat */}
          {isMobileFilterOpen ? (
            <> </>
            )
         : (
            <Button 
              variant="outlined"
              className="fixed! bottom-24! right-6! z-50! md:hidden! shadow-lg! rounded-full! min-w-0! w-[70px]! h-[70px]! p-0! transition-colors! bg-primary! text-white! border-primary! hover:bg-primary/90!"
              onClick={() => setIsMobileFilterOpen(prev => !prev)} >              
                <FilterAltOutlined className="w-[40px]! h-[40px]!" />
              </Button>
              )}
          {/* Products Grid */}
          <div className="md:col-span-4">
            {filteredPlants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
