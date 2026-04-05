"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  Plant,
  PlantDetail,
  PlantEnumGroup,
  PlantEnumPayload,
  PlantFormData,
  PlantUpsertRequest,
  ImageUploadData,
} from '@/types/store-management.types';
import {
  assignPlantCategories,
  assignPlantTags,
  createAdminPlant,
  getAdminPlantById,
  getPlantEnums,
  removePlantCategory,
  removePlantTag,
  searchAdminPlants,
  toggleAdminPlantActive,
  updateAdminPlant,
  uploadAdminPlantImages,
  uploadAdminPlantThumbnail,
  type AdminPlantSearchRequest,
} from '@/lib/api/adminPlantsService';

interface PaginationState {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface PlantFilters {
  keyword: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

interface SavePlantParams {
  formData: PlantFormData;
  images: ImageUploadData[];
  editingPlantId?: number;
  currentCategoryIds?: number[];
  currentTagIds?: number[];
}

interface UseAdminPlantsReturn {
  plants: Plant[];
  loading: boolean;
  saving: boolean;
  detailLoading: boolean;
  error: string | null;
  enumLoading: boolean;
  enumError: string | null;
  pagination: PaginationState;
  filters: PlantFilters;
  enums: PlantEnumPayload;
  fetchPlants: (params?: Partial<AdminPlantSearchRequest>) => Promise<void>;
  fetchPlantById: (id: number) => Promise<PlantDetail | null>;
  savePlant: (params: SavePlantParams) => Promise<boolean>;
  togglePlantActive: (id: number) => Promise<boolean>;
  setKeyword: (keyword: string) => Promise<void>;
  setPage: (pageNumber: number) => Promise<void>;
  setPageSize: (pageSize: number) => Promise<void>;
  loadEnums: () => Promise<void>;
  getEnumLabel: (enumName: keyof PlantEnumPayload, value: number) => string;
  clearError: () => void;
}

const EMPTY_ENUMS: PlantEnumPayload = {
  placementTypes: [],
  sizes: [],
  careLevelTypes: [],
};

const defaultFilters: PlantFilters = {
  keyword: '',
  sortBy: 'name',
  sortDirection: 'asc',
};

const defaultPagination: PaginationState = {
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
};

const getResponsePayload = <T,>(response: { data?: T; payload?: T }): T | undefined => {
  return response.payload ?? response.data;
};

const normalizeError = (err: unknown): string => {
  if (!err || typeof err !== 'object') {
    return 'An error occurred';
  }

  const candidate = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || 'An error occurred';
};

const toUpsertPayload = (data: PlantFormData): PlantUpsertRequest => {
  const normalizeText = (value: string) => value.trim();

  return {
    name: normalizeText(data.name),
    specificName: normalizeText(data.specificName),
    origin: normalizeText(data.origin),
    description: normalizeText(data.description),
    basePrice: data.basePrice,
    placementType: data.placementType,
    size: data.size,
    growthRate: normalizeText(data.growthRate),
    toxicity: data.toxicity,
    airPurifying: data.airPurifying,
    hasFlower: data.hasFlower,
    petSafe: data.petSafe,
    childSafe: data.childSafe,
    fengShuiElement: Number.isFinite(data.fengShuiElement) ? data.fengShuiElement : 0,
    fengShuiMeaning: normalizeText(data.fengShuiMeaning),
    potIncluded: data.potIncluded,
    potSize: normalizeText(data.potSize),
    careLevelType: data.careLevelType,
    careLevel: normalizeText(data.careLevel),
    isActive: data.isActive,
    isUniqueInstance: data.isUniqueInstance,
  };
};

const toPlantId = (payload: unknown): number | null => {
  if (typeof payload === 'number') {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as { id?: unknown; plantId?: unknown };
  const rawId = candidate.id ?? candidate.plantId;

  if (typeof rawId === 'number') {
    return rawId;
  }

  return null;
};

const normalizeEnums = (groups: PlantEnumGroup[]): PlantEnumPayload => {
  const byName = new Map<string, PlantEnumGroup>();
  groups.forEach((group) => byName.set(group.enumName, group));

  return {
    placementTypes: byName.get('PlacementType')?.values ?? [],
    sizes: byName.get('PlantSize')?.values ?? [],
    careLevelTypes: byName.get('CareLevelType')?.values ?? [],
  };
};

export const useAdminPlants = (): UseAdminPlantsReturn => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enumLoading, setEnumLoading] = useState(false);
  const [enumError, setEnumError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);
  const [filters, setFilters] = useState<PlantFilters>(defaultFilters);
  const [enums, setEnums] = useState<PlantEnumPayload>(EMPTY_ENUMS);

  const lastRequestRef = useRef<AdminPlantSearchRequest>({
    pagination: {
      pageNumber: defaultPagination.pageNumber,
      pageSize: defaultPagination.pageSize,
    },
    keyword: defaultFilters.keyword,
    sortBy: defaultFilters.sortBy,
    sortDirection: defaultFilters.sortDirection,
  });

  const fetchPlants = useCallback(async (params?: Partial<AdminPlantSearchRequest>) => {
    setLoading(true);
    setError(null);

    const requestBody: AdminPlantSearchRequest = {
      ...lastRequestRef.current,
      ...params,
      pagination: {
        pageNumber: params?.pagination?.pageNumber ?? lastRequestRef.current.pagination.pageNumber,
        pageSize: params?.pagination?.pageSize ?? lastRequestRef.current.pagination.pageSize,
      },
    };

    lastRequestRef.current = requestBody;

    try {
      const response = await searchAdminPlants(requestBody, true);
      const payload = getResponsePayload(response);

      if (!payload) {
        return;
      }

      setPlants(payload.items ?? []);
      setPagination({
        totalCount: payload.totalCount ?? 0,
        pageNumber: payload.pageNumber ?? requestBody.pagination.pageNumber,
        pageSize: payload.pageSize ?? requestBody.pagination.pageSize,
        totalPages: payload.totalPages ?? 1,
        hasPrevious: payload.hasPrevious ?? false,
        hasNext: payload.hasNext ?? false,
      });

      setFilters((prev) => ({
        ...prev,
        keyword: requestBody.keyword ?? '',
        isActive: requestBody.isActive,
        sortBy: requestBody.sortBy,
        sortDirection: requestBody.sortDirection,
      }));
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlantById = useCallback(async (id: number): Promise<PlantDetail | null> => {
    setDetailLoading(true);
    setError(null);

    try {
      const response = await getAdminPlantById(id, true);
      return getResponsePayload(response) ?? null;
    } catch (err) {
      setError(normalizeError(err));
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const syncCategories = useCallback(async (plantId: number, currentIds: number[], nextIds: number[]) => {
    const toAdd = nextIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !nextIds.includes(id));

    if (toAdd.length > 0) {
      await assignPlantCategories({ plantId, categoryIds: toAdd }, true);
    }

    await Promise.all(toRemove.map((categoryId) => removePlantCategory(plantId, categoryId, true)));
  }, []);

  const syncTags = useCallback(async (plantId: number, currentIds: number[], nextIds: number[]) => {
    const toAdd = nextIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !nextIds.includes(id));

    if (toAdd.length > 0) {
      await assignPlantTags({ plantId, tagIds: toAdd }, true);
    }

    await Promise.all(toRemove.map((tagId) => removePlantTag(plantId, tagId, true)));
  }, []);

  const savePlant = useCallback(
    async ({
      formData,
      images,
      editingPlantId,
      currentCategoryIds = [],
      currentTagIds = [],
    }: SavePlantParams): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        const payload = toUpsertPayload(formData);

        const response = editingPlantId
          ? await updateAdminPlant(editingPlantId, payload, true)
          : await createAdminPlant(payload, true);

        const upsertPayload = getResponsePayload(response);
        const plantId = editingPlantId ?? toPlantId(upsertPayload);

        if (!plantId) {
          throw new Error('Cannot resolve plant ID after save');
        }

        const selectedThumbnail = images.find((image) => image.isThumbnail && image.file);
        const regularFiles = images
          .filter((image) => Boolean(image.file) && image !== selectedThumbnail)
          .map((image) => image.file)
          .filter((file): file is File => Boolean(file));

        if (regularFiles.length > 0) {
          await uploadAdminPlantImages(plantId, regularFiles, true);
        }

        if (selectedThumbnail?.file) {
          await uploadAdminPlantThumbnail(plantId, selectedThumbnail.file, true);
        }

        await syncCategories(plantId, currentCategoryIds, formData.categoryIds);
        await syncTags(plantId, currentTagIds, formData.tagIds);

        await fetchPlants();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchPlants, syncCategories, syncTags]
  );

  const togglePlantActive = useCallback(async (id: number): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      await toggleAdminPlantActive(id, true);
      await fetchPlants();
      return true;
    } catch (err) {
      setError(normalizeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchPlants]);

  const setKeyword = useCallback(async (keyword: string) => {
    await fetchPlants({
      keyword,
      pagination: {
        pageNumber: 1,
        pageSize: lastRequestRef.current.pagination.pageSize,
      },
    });
  }, [fetchPlants]);

  const setPage = useCallback(async (pageNumber: number) => {
    await fetchPlants({
      pagination: {
        pageNumber,
        pageSize: lastRequestRef.current.pagination.pageSize,
      },
    });
  }, [fetchPlants]);

  const setPageSize = useCallback(async (pageSize: number) => {
    await fetchPlants({
      pagination: {
        pageNumber: 1,
        pageSize,
      },
    });
  }, [fetchPlants]);

  const loadEnums = useCallback(async () => {
    setEnumLoading(true);
    setEnumError(null);

    try {
      const response = await getPlantEnums(true);
      const payload = getResponsePayload(response) ?? [];
      setEnums(normalizeEnums(payload));
    } catch (err) {
      setEnumError(normalizeError(err));
    } finally {
      setEnumLoading(false);
    }
  }, []);

  const getEnumLabel = useCallback((enumName: keyof PlantEnumPayload, value: number): string => {
    const enumItem = enums[enumName]?.find((item) => item.value === value);
    return enumItem?.name ?? String(value);
  }, [enums]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      plants,
      loading,
      saving,
      detailLoading,
      error,
      enumLoading,
      enumError,
      pagination,
      filters,
      enums,
      fetchPlants,
      fetchPlantById,
      savePlant,
      togglePlantActive,
      setKeyword,
      setPage,
      setPageSize,
      loadEnums,
      getEnumLabel,
      clearError,
    }),
    [
      plants,
      loading,
      saving,
      detailLoading,
      error,
      enumLoading,
      enumError,
      pagination,
      filters,
      enums,
      fetchPlants,
      fetchPlantById,
      savePlant,
      togglePlantActive,
      setKeyword,
      setPage,
      setPageSize,
      loadEnums,
      getEnumLabel,
      clearError,
    ]
  );
};

export default useAdminPlants;
