'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { SamplePlant } from '@/data/sampledata';
import { Close as CloseIcon, Tune as FilterIcon } from '@mui/icons-material';

interface PlantFilterProps {
  onFiltersChange: (filteredPlants: SamplePlant[]) => void;
  plants: SamplePlant[];
  enableSearch?: boolean;
  onSearchChange?: (query: string) => void;
}

interface FilterState {
  category: string[];
  careLevel: string[];
  size: string[];
  priceRange: [number, number];
}

const CATEGORIES = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'succulent', label: 'Succulent' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'air-purifying', label: 'Air-Purifying' },
  { value: 'low-maintenance', label: 'Low-Maintenance' },
];

const CARE_LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export default function PlantFilter({ onFiltersChange, plants, enableSearch = false, onSearchChange }: PlantFilterProps) {
  const t = useTranslations('filter');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    careLevel: [],
    size: [],
    priceRange: [0, 1000000],
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get max price from plants
  const maxPrice = Math.max(...plants.map(p => p.price), 1000000);

  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);

    let filtered = plants.filter(plant => {
      // Category filter
      if (newFilters.category.length > 0 && !newFilters.category.includes(plant.category)) {
        return false;
      }

      // Care Level filter
      if (newFilters.careLevel.length > 0 && !newFilters.careLevel.includes(plant.careLevel)) {
        return false;
      }

      // Size filter
      if (newFilters.size.length > 0 && !newFilters.size.includes(plant.size)) {
        return false;
      }

      // Price Range filter
      if (plant.price < newFilters.priceRange[0] || plant.price > newFilters.priceRange[1]) {
        return false;
      }

      return true;
    });

    // Apply search filter
    if (enableSearch && searchQuery.trim()) {
      filtered = filtered.filter(plant =>
        plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    onFiltersChange(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange?.(query);
    applyFilters(filters);
  };

  const handleCheckboxChange = (type: 'category' | 'careLevel' | 'size', value: string) => {
    const newFilters = { ...filters };
    const array = newFilters[type];

    if (array.includes(value)) {
      newFilters[type] = array.filter(item => item !== value);
    } else {
      newFilters[type] = [...array, value];
    }

    applyFilters(newFilters);
  };

  const handlePriceChange = (min: number, max: number) => {
    const newFilters = { ...filters, priceRange: [min, max] as [number, number] };
    applyFilters(newFilters);
  };

  const resetFilters = () => {
    const resetFilters: FilterState = {
      category: [],
      careLevel: [],
      size: [],
      priceRange: [0, maxPrice],
    };
    setFilters(resetFilters);
    applyFilters(resetFilters);
  };

  const FilterContent = () => (
    <>
      {/* Search Input - Only show if enableSearch is true */}
      {enableSearch && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <label htmlFor="search" className="font-semibold text-gray-900 mb-3 block">{t('search')}</label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name or description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">{t('category')}</h3>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <label key={cat.value} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category.includes(cat.value)}
                onChange={() => handleCheckboxChange('category', cat.value)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-3 text-sm text-gray-700">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Care Level Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">{t('careLevel')}</h3>
        <div className="space-y-2">
          {CARE_LEVELS.map(level => (
            <label key={level.value} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.careLevel.includes(level.value)}
                onChange={() => handleCheckboxChange('careLevel', level.value)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-3 text-sm text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">{t('size')}</h3>
        <div className="space-y-2">
          {SIZES.map(size => (
            <label key={size.value} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.size.includes(size.value)}
                onChange={() => handleCheckboxChange('size', size.value)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-3 text-sm text-gray-700">{size.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">{t('price')}</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max={maxPrice}
              value={filters.priceRange[0]}
              onChange={e => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
              className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Min"
            />
            <input
              type="number"
              min="0"
              max={maxPrice}
              value={filters.priceRange[1]}
              onChange={e => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
              className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Max"
            />
          </div>
          <div className="text-xs text-gray-600">
            {filters.priceRange[0].toLocaleString('vi-VN')}₫ - {filters.priceRange[1].toLocaleString('vi-VN')}₫
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="w-full bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
      >
        {t('reset')}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop - Sticky Sidebar */}
      <div className="hidden md:block bg-white rounded-lg shadow-md p-6 sticky top-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('title')}</h2>
        <FilterContent />
      </div>

      {/* Mobile - Filter Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FilterIcon sx={{ fontSize: 24 }} />
        </button>
      </div>

      {/* Mobile - Filter Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto md:hidden animate-fade-in-up">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <FilterContent />
            </div>
          </div>
        </>
      )}
    </>
  );
}
