import { useState, useCallback } from 'react';

export interface FilterOptions {
  category: string[];
  careLevel: string[];
  size: string[];
  priceRange: [number, number];
  searchQuery: string;
}

export interface Filterable {
  id?: number | string;
  name: string;
  description?: string;
  scientificName?: string;
  category?: string | string[];
  careLevel?: string;
  size?: string;
  price: number;
  [key: string]: any;
}

export function useProductFilter<T extends Filterable>(items: T[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    category: [],
    careLevel: [],
    size: [],
    priceRange: [0, 1000000],
    searchQuery: '',
  });

  const maxPrice = Math.max(...items.map(p => p.price), 1000000);

  const applyFilters = useCallback(
    (newFilters: FilterOptions): T[] => {
      return items.filter(item => {
        // Search filter
        if (newFilters.searchQuery.trim()) {
          const query = newFilters.searchQuery.toLowerCase();
          const hasMatch =
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.scientificName?.toLowerCase().includes(query);
          if (!hasMatch) return false;
        }

        // Category filter
        if (newFilters.category.length > 0) {
          const itemCategory = Array.isArray(item.category)
            ? item.category
            : item.category
              ? [item.category]
              : [];
          const hasMatch = itemCategory.some(cat => newFilters.category.includes(cat));
          if (!hasMatch) return false;
        }

        // Care Level filter
        if (newFilters.careLevel.length > 0 && item.careLevel) {
          if (!newFilters.careLevel.includes(item.careLevel)) return false;
        }

        // Size filter
        if (newFilters.size.length > 0 && item.size) {
          if (!newFilters.size.includes(item.size)) return false;
        }

        // Price Range filter
        if (item.price < newFilters.priceRange[0] || item.price > newFilters.priceRange[1]) {
          return false;
        }

        return true;
      });
    },
    [items]
  );

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category: [],
      careLevel: [],
      size: [],
      priceRange: [0, maxPrice],
      searchQuery: '',
    });
  }, [maxPrice]);

  const filteredItems = applyFilters(filters);

  return {
    filters,
    filteredItems,
    updateFilters,
    resetFilters,
    maxPrice,
  };
}
