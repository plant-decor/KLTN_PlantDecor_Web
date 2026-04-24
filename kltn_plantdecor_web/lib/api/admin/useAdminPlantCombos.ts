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
  fetchRoomDesignEnumOptions,
  type SystemEnumOption,
} from '@/lib/api/adminPlantGuidesService';
import {
  addPlantComboItem,
  assignPlantComboTags,
  createAdminPlantCombo,
  deleteAdminPlantComboImage,
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

interface ComboEnums {
  lightRequirements: SystemEnumOption[];
  roomTypes: SystemEnumOption[];
  roomStyles: SystemEnumOption[];
}

interface UseAdminPlantCombosReturn {
  combos: PlantCombo[];
  comboPlants: Plant[];
  enums: ComboEnums;
  enumLoading: boolean;
  enumError: string | null;
  saving: boolean;
  detailLoading: boolean;
  plantsLoading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: ListFilters;
  fetchCombos: (params?: { pageNumber?: number; pageSize?: number }) => Promise<void>;
  fetchComboById: (id: number) => Promise<PlantCombo | null>;
  fetchComboPlants: (keyword?: string) => Promise<void>;
  loadEnums: () => Promise<void>;
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

const EMPTY_ENUMS: ComboEnums = {
  lightRequirements: [],
  roomTypes: [],
  roomStyles: [],
};

const getResponsePayload = <T,>(response: { data?: T; payload?: T }): T | undefined => {
  return response.payload ?? response.data;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function extractImageIdsFromUnknownImages(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids: number[] = [];
  value.forEach((item) => {
    if (!isRecord(item)) {
      return;
    }
    const id = item.id;
    if (typeof id === 'number') {
      ids.push(id);
    }
  });
  return ids;
}

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

const normalizeNumberArray = (values?: number[]): number[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(
    new Set(values.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))
  );
};

const normalizeCreatePayload = (formData: PlantComboFormData): PlantComboCreateRequest => {
  return {
    comboCode: formData.comboCode.trim(),
    comboName: formData.comboName.trim(),
    comboType: formData.comboType,
    description: formData.description.trim(),
    suitableSpace: Number(formData.suitableSpace) || 0,
    suitableRooms: normalizeNumberArray(formData.suitableRooms),
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
    suitableSpace: Number(formData.suitableSpace) || 0,
    suitableRooms: normalizeNumberArray(formData.suitableRooms),
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
  const [enums, setEnums] = useState<ComboEnums>(EMPTY_ENUMS);
  const [enumLoading, setEnumLoading] = useState(false);
  const [enumError, setEnumError] = useState<string | null>(null);
  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [plantsLoading, setPlantsLoading] = useState(false);
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
    setPlantsLoading(true);

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
          sortBy: '',
          sortDirection: '',
        },
        false
      );
      const payload = getResponsePayload(response);
      if (requestId === plantSearchRequestRef.current) {
        setComboPlants(payload?.items ?? []);
      }
    } catch (err) {
      if (requestId === plantSearchRequestRef.current) {
        setError(normalizeError(err));
      }
    } finally {
      if (requestId === plantSearchRequestRef.current) {
        setPlantsLoading(false);
      }
    }
  }, []);

  const loadEnums = useCallback(async () => {
    setEnumLoading(true);
    setEnumError(null);

    try {
      const roomDesignOptions = await fetchRoomDesignEnumOptions(true);
      setEnums(roomDesignOptions);
    } catch (err) {
      setEnumError(normalizeError(err));
    } finally {
      setEnumLoading(false);
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

      if (editingCombo) {
        const latestCombo = await getPlantComboById(comboId, true).catch(() => null);
        const latestPayload = latestCombo ? getResponsePayload(latestCombo) : null;
        const currentImageIds = extractImageIdsFromUnknownImages((latestPayload as { images?: unknown } | null)?.images);
        const keptImageIds = images
          .map((image) => image.existingImageId)
          .filter((id): id is number => typeof id === 'number');
        const keptSet = new Set(keptImageIds);
        const toDelete = currentImageIds.filter((id: number) => !keptSet.has(id));

        if (toDelete.length > 0) {
          await Promise.all(toDelete.map((imageId: number) => deleteAdminPlantComboImage(comboId as number, imageId, true)));
        }
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
    enums,
    enumLoading,
    enumError,
    saving,
    detailLoading,
    plantsLoading,
    error,
    pagination,
    filters,
    fetchCombos,
    fetchComboById,
    fetchComboPlants,
    loadEnums,
    savePlantCombo,
    toggleComboActive,
    setKeyword,
    setPage,
    setPageSize,
    clearError,
  };
};
