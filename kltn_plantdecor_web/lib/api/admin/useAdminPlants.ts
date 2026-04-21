"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  assignPlantCategories,
  assignPlantTags,
  createAdminPlant,
  getAdminPlantById,
  getPlantEnums,
  removePlantCategory,
  removePlantTag,
  searchAdminPlants,
  setAdminPlantPrimaryImage,
  toggleAdminPlantActive,
  updateAdminPlant,
  uploadAdminPlantImages,
  uploadAdminPlantThumbnail,
  type AdminPlantSearchRequest,
} from '@/lib/api/adminPlantsService';
import {
  createAdminPlantGuide,
  fetchRoomDesignEnumOptions,
  getAdminPlantGuideByPlantId,
  updateAdminPlantGuide,
} from '@/lib/api/adminPlantGuidesService';
import type {
  Plant,
  PlantDetail,
  PlantEnumGroup,
  PlantEnumPayload,
  PlantFormData,
  PlantUpsertRequest,
  ImageUploadData,
} from '@/types/store-management.types';
import type { PlantGuideFormData } from '@/types/admin-plant-guide.types';

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
  growthRates: [],
  careLevelTypes: [],
  lightRequirements: [],
  roomTypes: [],
  roomStyles: [],
};

const defaultFilters: PlantFilters = {
  keyword: '',
  sortBy: '',
  sortDirection: '',
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
    return 'Đã xảy ra lỗi không xác định';
  }

  const candidate = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || 'Đã xảy ra lỗi không xác định';
};

const toUpsertPayload = (data: PlantFormData): PlantUpsertRequest => {
  const normalizeText = (value?: string | null) => (value ?? '').trim();
  const normalizeNumberArray = (values?: number[]) => {
    if (!Array.isArray(values)) {
      return [];
    }

    return Array.from(
      new Set(values.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))
    );
  };

  return {
    name: normalizeText(data.name),
    specificName: normalizeText(data.specificName),
    origin: normalizeText(data.origin),
    description: normalizeText(data.description),
    basePrice: data.basePrice,
    placementType: data.placementType,
    size: data.size,
    growthRate: Number.isFinite(data.growthRate) ? data.growthRate : 0,
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
    roomType: normalizeNumberArray(data.roomType),
    roomStyle: normalizeNumberArray(data.roomStyle),
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
    growthRates: byName.get('GrowthRate')?.values ?? [],
    careLevelTypes: byName.get('CareLevelType')?.values ?? [],
    lightRequirements: [],
    roomTypes: [],
    roomStyles: [],
  };
};

const hasPlantGuideValues = (guide?: PlantGuideFormData): boolean => {
  if (!guide) {
    return false;
  }

  return Object.values(guide).some((value) => value.trim().length > 0);
};

const toPlantGuidePayload = (guide: PlantGuideFormData, plantId: number) => ({
  plantId,
  lightRequirement: guide.lightRequirement.trim(),
  watering: guide.watering.trim(),
  fertilizing: guide.fertilizing.trim(),
  pruning: guide.pruning.trim(),
  temperature: guide.temperature.trim(),
  humidity: guide.humidity.trim(),
  soil: guide.soil.trim(),
  careNotes: guide.careNotes.trim(),
});

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
        // console.log('[savePlant] START', {
        //   mode: editingPlantId ? 'UPDATE' : 'CREATE',
        //   editingPlantId,
        //   formDataKeys: Object.keys(formData),
        // });

        // console.log('[savePlant] Converting form data to upsert payload...');
        const payload = toUpsertPayload(formData);
        // console.log('[savePlant] Upsert payload created', payload);

        let response;

        if (editingPlantId && editingPlantId > 0) {
          // console.log('[savePlant] UPDATE MODE: editingPlantId =', editingPlantId);
          // console.log('[savePlant] Calling updateAdminPlant with:', {
            // plantId: editingPlantId,
            // payload,
          // });

          try {
            response = await updateAdminPlant(editingPlantId, payload, true);
            // console.log('[savePlant] updateAdminPlant response received:', response);
          } catch (apiError) {
            // console.error('[savePlant] ERROR in updateAdminPlant call:', apiError);
            throw apiError;
          }
        } else {
          // console.log('[savePlant] CREATE MODE: no editingPlantId or value <= 0');
          // console.log('[savePlant] Calling createAdminPlant with payload:', payload);

          try {
            response = await createAdminPlant(payload, true);
            // console.log('[savePlant] createAdminPlant response received:', response);
          } catch (apiError) {
            // console.error('[savePlant] ERROR in createAdminPlant call:', apiError);
            throw apiError;
          }
        }

        // console.log('[savePlant] Extracting plant ID from response...');
        const upsertPayload = getResponsePayload(response);
        // console.log('[savePlant] upsertPayload extracted:', upsertPayload);
        const plantId = editingPlantId ?? toPlantId(upsertPayload);
        // console.log('[savePlant] Final plantId determined:', plantId);

        if (!plantId) {
          // console.error('[savePlant] FATAL: Cannot resolve plant ID after save');
          throw new Error('Cannot resolve plant ID after save');
        }

        // console.log('[savePlant] Plant ID confirmed:', plantId);
        // console.log('[savePlant] Processing images...');

        const selectedThumbnail = images.find((image) => image.isThumbnail && image.file);
        const regularFiles = images
          .filter((image) => Boolean(image.file) && image !== selectedThumbnail)
          .map((image) => image.file)
          .filter((file): file is File => Boolean(file));

        // console.log('[savePlant] Image processing:', {
        //   hasThumbnail: !!selectedThumbnail,
        //   regularFileCount: regularFiles.length,
        // });

        if (regularFiles.length > 0) {
          // console.log('[savePlant] Uploading regular images...');
          await uploadAdminPlantImages(plantId, regularFiles, true);
          // console.log('[savePlant] Regular images uploaded');
        }

        if (selectedThumbnail?.file) {
          // console.log('[savePlant] Uploading thumbnail from file...');
          await uploadAdminPlantThumbnail(plantId, selectedThumbnail.file, true);
          // console.log('[savePlant] Thumbnail uploaded');
        } else if (selectedThumbnail?.existingImageId) {
          // console.log('[savePlant] Setting existing image as primary:', selectedThumbnail.existingImageId);
          await setAdminPlantPrimaryImage(plantId, selectedThumbnail.existingImageId, true);
          // console.log('[savePlant] Primary image set');
        }

        // console.log('[savePlant] Checking plant guide...');
        if (hasPlantGuideValues(formData.plantGuide)) {
          // console.log('[savePlant] Plant guide has values, processing...');
          const guidePayload = toPlantGuidePayload(
            formData.plantGuide ?? {
              lightRequirement: '',
              watering: '',
              fertilizing: '',
              pruning: '',
              temperature: '',
              humidity: '',
              soil: '',
              careNotes: '',
            },
            plantId
          );
          // console.log('[savePlant] Guide payload created:', guidePayload);

          const existingGuideResponse = await getAdminPlantGuideByPlantId(plantId, true).catch(() => {
            // console.warn('[savePlant] Could not fetch existing guide:', err);
            return null;
          });
          const existingGuide = existingGuideResponse ? getResponsePayload(existingGuideResponse) : null;
          // console.log('[savePlant] Existing guide check:', { hasExisting: !!existingGuide, guideId: existingGuide?.id });

          if (existingGuide?.id) {
            // console.log('[savePlant] Updating existing guide:', existingGuide.id);
            await updateAdminPlantGuide(existingGuide.id, guidePayload, true);
            // console.log('[savePlant] Guide updated');
          } else {
            // console.log('[savePlant] Creating new guide...');
            await createAdminPlantGuide(guidePayload, true);
            // console.log('[savePlant] Guide created');
          }
        } else {
          // console.log('[savePlant] No plant guide values to save');
        }

        // console.log('[savePlant] Syncing categories and tags...');
        await syncCategories(plantId, currentCategoryIds, formData.categoryIds);
        // console.log('[savePlant] Categories synced');

        await syncTags(plantId, currentTagIds, formData.tagIds);
        // console.log('[savePlant] Tags synced');

        // console.log('[savePlant] Refreshing plants list...');
        await fetchPlants();
        // console.log('[savePlant] SUCCESS - Plants list refreshed');
        return true;
      } catch (err) {
        console.error('[savePlant] EXCEPTION CAUGHT:', err);
        console.error('[savePlant] Error details:', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
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
      const [plantEnumResponse, roomDesignOptions] = await Promise.all([
        getPlantEnums(true),
        fetchRoomDesignEnumOptions(true),
      ]);

      const payload = getResponsePayload(plantEnumResponse) ?? [];
      setEnums({
        ...normalizeEnums(payload),
        lightRequirements: roomDesignOptions.lightRequirements,
        roomTypes: roomDesignOptions.roomTypes,
        roomStyles: roomDesignOptions.roomStyles,
      });
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
