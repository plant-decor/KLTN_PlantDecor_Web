"use client";

import { useCallback, useRef, useState } from 'react';
import type {
  ImageUploadData,
  Plant,
  PlantCombo,
  PlantComboFormData,
  PlantComboItem,
  PlantComboItemUpsertRequest,
  PlantComboCreateRequest,
  PlantComboUpdateRequest,
} from '@/types/store-management.types';
import {
  addPlantComboItem,
  assignPlantComboTags,
  createAdminPlantCombo,
  getAdminPlantCombos,
  getPlantComboById,
  removePlantComboItem,
  removePlantComboTag,
  searchAdminPlantsForCombo,
  toggleAdminPlantComboActive,
  updateAdminPlantCombo,
  updatePlantComboItem,
  uploadAdminPlantComboImages,
  uploadAdminPlantComboThumbnail,
} from '@/lib/api/adminPlantCombosService';

interface PaginationState {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface ListFilters {
  keyword: string;
}

interface SavePlantComboParams {
  formData: PlantComboFormData;
  images: ImageUploadData[];
  editingCombo?: PlantCombo;
}

interface UseAdminPlantCombosReturn {
  combos: PlantCombo[];
  comboPlants: Plant[];
  saving: boolean;
  detailLoading: boolean;
  plantsLoading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: ListFilters;
  fetchCombos: (params?: { pageNumber?: number; pageSize?: number }) => Promise<void>;
  fetchComboById: (id: number) => Promise<PlantCombo | null>;
  fetchComboPlants: (keyword?: string) => Promise<void>;
  savePlantCombo: (params: SavePlantComboParams) => Promise<boolean>;
  toggleComboActive: (id: number) => Promise<boolean>;
  setKeyword: (keyword: string) => void;
  setPage: (pageNumber: number) => Promise<void>;
  setPageSize: (pageSize: number) => Promise<void>;
  clearError: () => void;
}

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

const normalizeItemPayload = (item: PlantComboItem): PlantComboItemUpsertRequest => {
  return {
    plantId: item.plantId,
    quantity: Number(item.quantity) || 1,
    notes: (item.notes ?? '').trim() || undefined,
  };
};

const normalizeCreatePayload = (formData: PlantComboFormData): PlantComboCreateRequest => {
  return {
    comboCode: formData.comboCode.trim(),
    comboName: formData.comboName.trim(),
    comboType: formData.comboType,
    description: formData.description.trim(),
    suitableSpace: formData.suitableSpace.trim(),
    suitableRooms: formData.suitableRooms.map((item) => item.trim()).filter(Boolean),
    fengShuiElement: Number(formData.fengShuiElement) || 0,
    fengShuiPurpose: formData.fengShuiPurpose.trim(),
    themeName: formData.themeName.trim(),
    themeDescription: formData.themeDescription.trim(),
    comboPrice: Number(formData.comboPrice) || 0,
    season: formData.season,
    isActive: formData.isActive,
    comboItems: formData.comboItems.map((item) => normalizeItemPayload(item)),
  };
};

const normalizeUpdatePayload = (formData: PlantComboFormData): PlantComboUpdateRequest => {
  return {
    comboName: formData.comboName.trim(),
    comboType: formData.comboType,
    description: formData.description.trim(),
    suitableSpace: formData.suitableSpace.trim(),
    suitableRooms: formData.suitableRooms.map((item) => item.trim()).filter(Boolean),
    fengShuiElement: Number(formData.fengShuiElement) || 0,
    fengShuiPurpose: formData.fengShuiPurpose.trim(),
    themeName: formData.themeName.trim(),
    themeDescription: formData.themeDescription.trim(),
    comboPrice: Number(formData.comboPrice) || 0,
    season: formData.season,
    isActive: formData.isActive,
  };
};

const toComboId = (payload: unknown): number | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as { id?: unknown };
  return typeof candidate.id === 'number' ? candidate.id : null;
};

export const useAdminPlantCombos = (): UseAdminPlantCombosReturn => {
  const [combos, setCombos] = useState<PlantCombo[]>([]);
  const [comboPlants, setComboPlants] = useState<Plant[]>([]);
  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [plantsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);
  const [filters, setFilters] = useState<ListFilters>({ keyword: '' });

  const lastRequestRef = useRef({
    pageNumber: defaultPagination.pageNumber,
    pageSize: defaultPagination.pageSize,
  });
  const plantSearchRequestRef = useRef(0);

  const fetchCombos = useCallback(async (params?: { pageNumber?: number; pageSize?: number }) => {
    setLoading(true);
    setError(null);

    const pageNumber = params?.pageNumber ?? lastRequestRef.current.pageNumber;
    const pageSize = params?.pageSize ?? lastRequestRef.current.pageSize;
    lastRequestRef.current = { pageNumber, pageSize };

    try {
      const response = await getAdminPlantCombos(
        {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
        true
      );

      const payload = getResponsePayload(response);
      if (!payload) {
        return;
      }

      setCombos(payload.items ?? []);
      setPagination({
        totalCount: payload.totalCount ?? 0,
        pageNumber: payload.pageNumber ?? pageNumber,
        pageSize: payload.pageSize ?? pageSize,
        totalPages: payload.totalPages ?? 1,
        hasPrevious: payload.hasPrevious ?? false,
        hasNext: payload.hasNext ?? false,
      });
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchComboById = useCallback(async (id: number): Promise<PlantCombo | null> => {
    setDetailLoading(true);
    setError(null);

    try {
      const response = await getPlantComboById(id, true);
      return getResponsePayload(response) ?? null;
    } catch (err) {
      setError(normalizeError(err));
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchComboPlants = useCallback(async (keyword = '') => {
    const requestId = ++plantSearchRequestRef.current;
    setError(null);

    try {
      const normalizedKeyword = keyword.trim();
      const response = await searchAdminPlantsForCombo(
        {
          pagination: {
            pageNumber: 1,
            pageSize: 1000,
          },
          keyword: normalizedKeyword,
          isActive: true,
          isUniqueInstance: false,
          sortBy: 'name',
          sortDirection: 'asc',
        },
        true
      );
      const payload = getResponsePayload(response);
      if (requestId === plantSearchRequestRef.current) {
        setComboPlants(payload?.items ?? []);
      }
    } catch (err) {
      if (requestId === plantSearchRequestRef.current) {
        setError(normalizeError(err));
      }
    }
  }, []);

  const syncComboItems = useCallback(async (comboId: number, currentItems: PlantComboItem[], nextItems: PlantComboItem[]) => {
    const currentById = new Map<number, PlantComboItem>();
    currentItems.forEach((item) => {
      if (typeof item.id === 'number') {
        currentById.set(item.id, item);
      }
    });

    const nextIds = new Set<number>();

    for (const item of nextItems) {
      if (typeof item.id === 'number') {
        nextIds.add(item.id);
      }
    }

    const removeTargets = currentItems.filter((item) => typeof item.id === 'number' && !nextIds.has(item.id));
    if (removeTargets.length > 0) {
      await Promise.all(removeTargets.map((item) => removePlantComboItem(comboId, item.id as number, true)));
    }

    for (const next of nextItems) {
      const payload = normalizeItemPayload(next);

      if (typeof next.id === 'number' && currentById.has(next.id)) {
        await updatePlantComboItem(next.id, payload, true);
        continue;
      }

      await addPlantComboItem(comboId, payload, true);
    }
  }, []);

  const syncTags = useCallback(async (comboId: number, currentTagIds: number[], nextTagIds: number[]) => {
    const toAdd = nextTagIds.filter((id) => !currentTagIds.includes(id));
    const toRemove = currentTagIds.filter((id) => !nextTagIds.includes(id));

    if (toAdd.length > 0) {
      await assignPlantComboTags({ plantComboId: comboId, tagIds: toAdd }, true);
    }

    if (toRemove.length > 0) {
      await Promise.all(toRemove.map((tagId) => removePlantComboTag(comboId, tagId, true)));
    }
  }, []);

  const uploadImages = useCallback(async (comboId: number, images: ImageUploadData[]) => {
    const selectedThumbnail = images.find((image) => image.isThumbnail && image.file);
    const regularFiles = images
      .filter((image) => Boolean(image.file) && image !== selectedThumbnail)
      .map((image) => image.file)
      .filter((file): file is File => Boolean(file));

    if (regularFiles.length > 0) {
      await uploadAdminPlantComboImages(comboId, regularFiles, true);
    }

    if (selectedThumbnail?.file) {
      await uploadAdminPlantComboThumbnail(comboId, selectedThumbnail.file, true);
    }
  }, []);

  const savePlantCombo = useCallback(async ({ formData, images, editingCombo }: SavePlantComboParams): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      let comboId: number | null = editingCombo?.id ?? null;

      if (comboId) {
        await updateAdminPlantCombo(comboId, normalizeUpdatePayload(formData), true);
      } else {
        const response = await createAdminPlantCombo(normalizeCreatePayload(formData), true);
        comboId = toComboId(getResponsePayload(response));
      }

      if (!comboId) {
        throw new Error('Cannot resolve combo ID after save');
      }

      await uploadImages(comboId, images);

      const currentItems = editingCombo?.comboItems ?? [];
      const nextItems = formData.comboItems;
      if (editingCombo) {
        await syncComboItems(comboId, currentItems, nextItems);
      }

      const currentTagIds = editingCombo?.tagsNavigation?.map((item) => item.id) ?? [];
      await syncTags(comboId, currentTagIds, formData.tagIds);

      await fetchCombos();
      return true;
    } catch (err) {
      setError(normalizeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchCombos, syncComboItems, syncTags, uploadImages]);

  const toggleComboActive = useCallback(async (id: number): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      await toggleAdminPlantComboActive(id, true);
      await fetchCombos();
      return true;
    } catch (err) {
      setError(normalizeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchCombos]);

  const setKeyword = useCallback((keyword: string) => {
    setFilters({ keyword });
  }, []);

  const setPage = useCallback(async (pageNumber: number) => {
    await fetchCombos({
      pageNumber,
      pageSize: lastRequestRef.current.pageSize,
    });
  }, [fetchCombos]);

  const setPageSize = useCallback(async (pageSize: number) => {
    await fetchCombos({
      pageNumber: 1,
      pageSize,
    });
  }, [fetchCombos]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    combos,
    comboPlants,
    saving,
    detailLoading,
    plantsLoading,
    error,
    pagination,
    filters,
    fetchCombos,
    fetchComboById,
    fetchComboPlants,
    savePlantCombo,
    toggleComboActive,
    setKeyword,
    setPage,
    setPageSize,
    clearError,
  };
};
