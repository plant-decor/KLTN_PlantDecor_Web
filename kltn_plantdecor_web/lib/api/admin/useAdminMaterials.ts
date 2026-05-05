"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  Material,
  MaterialDetail,
  MaterialFormData,
  MaterialUpsertRequest,
  ImageUploadData,
} from '@/types/store-management.types';
import {
  assignMaterialCategories,
  assignMaterialTags,
  createAdminMaterial,
  deleteAdminMaterialImage,
  getAdminMaterialById,
  removeMaterialCategory,
  removeMaterialTag,
  searchAdminMaterials,
  toggleAdminMaterialActive,
  updateAdminMaterial,
  uploadAdminMaterialImages,
  uploadAdminMaterialThumbnail,
  type AdminMaterialSearchRequest,
} from '@/lib/api/adminMaterialsService';

interface PaginationState {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface SaveMaterialParams {
  formData: MaterialFormData;
  images: ImageUploadData[];
  editingMaterialId?: number;
  currentCategoryIds?: number[];
  currentTagIds?: number[];
}

interface UseAdminMaterialsReturn {
  materials: Material[];
  loading: boolean;
  saving: boolean;
  detailLoading: boolean;
  error: string | null;
  pagination: PaginationState;
  fetchMaterials: (params?: Partial<AdminMaterialSearchRequest>) => Promise<void>;
  fetchMaterialById: (id: number) => Promise<MaterialDetail | null>;
  saveMaterial: (params: SaveMaterialParams) => Promise<boolean>;
  toggleMaterialActive: (id: number) => Promise<boolean>;
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

type UnknownRecord = Record<string, unknown>;

const stripEmptyStringFields = <T extends UnknownRecord>(value: T): T => {
  const next: UnknownRecord = {};

  Object.entries(value).forEach(([key, raw]) => {
    if (typeof raw === 'string' && raw.trim() === '') {
      return;
    }
    next[key] = raw;
  });

  return next as T;
};

const readNumber = (payload: unknown, camelKey: string, pascalKey: string): number | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }
  const candidate = payload as UnknownRecord;
  const camel = candidate[camelKey];
  if (typeof camel === 'number' && Number.isFinite(camel)) {
    return camel;
  }
  const pascal = candidate[pascalKey];
  if (typeof pascal === 'number' && Number.isFinite(pascal)) {
    return pascal;
  }
  return undefined;
};

const readBoolean = (payload: unknown, camelKey: string, pascalKey: string): boolean | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }
  const candidate = payload as UnknownRecord;
  const camel = candidate[camelKey];
  if (typeof camel === 'boolean') {
    return camel;
  }
  const pascal = candidate[pascalKey];
  if (typeof pascal === 'boolean') {
    return pascal;
  }
  return undefined;
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

const toUpsertPayload = (data: MaterialFormData, isCreateMode = false): MaterialUpsertRequest => {
  const normalizeText = (value: string | undefined | null) => (value ?? '').trim();
  const normalizedExpiry = data.expiryMonths ?? null;
  const specificationValue = normalizeText(data.specifications ?? undefined);

  const basePayload: MaterialUpsertRequest = {
    materialCode: data.materialCode ? normalizeText(data.materialCode) : undefined,
    name: normalizeText(data.name),
    description: normalizeText(data.description),
    basePrice: Number(data.basePrice) || 0,
    unit: normalizeText(data.unit),
    brand: normalizeText(data.brand),
    specifications: specificationValue || null,
    expiryMonths: normalizedExpiry,
    isActive: Boolean(data.isActive),
  };

  if (!isCreateMode) {
    return basePayload;
  }

  return {
    ...basePayload,
    categoryIds: data.categoryIds,
    tagIds: data.tagIds,
  };
};

const normalizeIdArray = (ids: number[]): number[] => {
  return [...new Set(ids)].sort((left, right) => left - right);
};

const hasSameIds = (actualIds: number[], expectedIds: number[]): boolean => {
  if (actualIds.length !== expectedIds.length) {
    return false;
  }

  return actualIds.every((id, index) => id === expectedIds[index]);
};

const createResponseHasExpectedRelations = (responsePayload: unknown, formData: MaterialFormData): boolean => {
  if (!responsePayload || typeof responsePayload !== 'object') {
    return false;
  }

  const candidate = responsePayload as {
    categories?: Array<{ id?: number }>;
    tags?: Array<{ id?: number }>;
  };

  if (!Array.isArray(candidate.categories) || !Array.isArray(candidate.tags)) {
    return false;
  }

  const responseCategoryIds = normalizeIdArray(
    candidate.categories
      .map((category) => category.id)
      .filter((id): id is number => typeof id === 'number')
  );
  const responseTagIds = normalizeIdArray(
    candidate.tags.map((tag) => tag.id).filter((id): id is number => typeof id === 'number')
  );

  const expectedCategoryIds = normalizeIdArray(formData.categoryIds);
  const expectedTagIds = normalizeIdArray(formData.tagIds);

  return hasSameIds(responseCategoryIds, expectedCategoryIds) && hasSameIds(responseTagIds, expectedTagIds);
};

const toMaterialId = (payload: unknown): number | null => {
  if (typeof payload === 'number') {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as { id?: unknown; materialId?: unknown };
  const rawId = candidate.id ?? candidate.materialId;

  return typeof rawId === 'number' ? rawId : null;
};

export const useAdminMaterials = (): UseAdminMaterialsReturn => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);

  const lastRequestRef = useRef<AdminMaterialSearchRequest>({
    pagination: {
      pageNumber: defaultPagination.pageNumber,
      pageSize: defaultPagination.pageSize,
    },
  });

  const fetchMaterials = useCallback(async (params?: Partial<AdminMaterialSearchRequest>) => {
    setLoading(true);
    setError(null);

    const requestBody: AdminMaterialSearchRequest = stripEmptyStringFields({
      ...lastRequestRef.current,
      ...params,
      pagination: {
        pageNumber: params?.pagination?.pageNumber ?? lastRequestRef.current.pagination.pageNumber,
        pageSize: params?.pagination?.pageSize ?? lastRequestRef.current.pagination.pageSize,
      },
    });

    lastRequestRef.current = requestBody;

    try {
      const response = await searchAdminMaterials(requestBody, true);
      const payload = getResponsePayload(response);

      if (!payload) {
        return;
      }

      setMaterials(payload.items ?? []);
      setPagination({
        totalCount: readNumber(payload, 'totalCount', 'TotalCount') ?? 0,
        pageNumber: readNumber(payload, 'pageNumber', 'PageNumber') ?? requestBody.pagination.pageNumber,
        pageSize: readNumber(payload, 'pageSize', 'PageSize') ?? requestBody.pagination.pageSize,
        totalPages: readNumber(payload, 'totalPages', 'TotalPages') ?? 1,
        hasPrevious: readBoolean(payload, 'hasPrevious', 'HasPrevious') ?? false,
        hasNext: readBoolean(payload, 'hasNext', 'HasNext') ?? false,
      });
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMaterialById = useCallback(async (id: number): Promise<MaterialDetail | null> => {
    setDetailLoading(true);
    setError(null);

    try {
      const response = await getAdminMaterialById(id, true);
      return getResponsePayload(response) ?? null;
    } catch (err) {
      setError(normalizeError(err));
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const syncCategories = useCallback(async (materialId: number, currentIds: number[], nextIds: number[]) => {
    const toAdd = nextIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !nextIds.includes(id));

    if (toAdd.length > 0) {
      await assignMaterialCategories({ materialId, categoryIds: toAdd }, true);
    }

    await Promise.all(toRemove.map((categoryId) => removeMaterialCategory(materialId, categoryId, true)));
  }, []);

  const syncTags = useCallback(async (materialId: number, currentIds: number[], nextIds: number[]) => {
    const toAdd = nextIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !nextIds.includes(id));

    if (toAdd.length > 0) {
      await assignMaterialTags({ materialId, tagIds: toAdd }, true);
    }

    await Promise.all(toRemove.map((tagId) => removeMaterialTag(materialId, tagId, true)));
  }, []);

  const saveMaterial = useCallback(
    async ({
      formData,
      images,
      editingMaterialId,
      currentCategoryIds = [],
      currentTagIds = [],
    }: SaveMaterialParams): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        const isCreateMode = !editingMaterialId;
        const payload = toUpsertPayload(formData, isCreateMode);

        const response = editingMaterialId
          ? await updateAdminMaterial(editingMaterialId, payload, true)
          : await createAdminMaterial(payload, true);

        const upsertPayload = getResponsePayload(response);
        const materialId = editingMaterialId ?? toMaterialId(upsertPayload);

        if (!materialId) {
          throw new Error('Cannot resolve material ID after save');
        }

        if (editingMaterialId) {
          const latestMaterial = await getAdminMaterialById(materialId, true).catch(() => null);
          const latestPayload = latestMaterial ? getResponsePayload(latestMaterial) : null;
          const currentImageIds =
            latestPayload?.images?.map((image) => image.id).filter((id): id is number => typeof id === 'number') ?? [];
          const keptImageIds = images
            .map((image) => image.existingImageId)
            .filter((id): id is number => typeof id === 'number');
          const keptSet = new Set(keptImageIds);
          const toDelete = currentImageIds.filter((id) => !keptSet.has(id));

          if (toDelete.length > 0) {
            await Promise.all(toDelete.map((imageId) => deleteAdminMaterialImage(materialId, imageId, true)));
          }
        }

        const selectedThumbnail = images.find((image) => image.isThumbnail && image.file);
        const regularFiles = images
          .filter((image) => Boolean(image.file) && image !== selectedThumbnail)
          .map((image) => image.file)
          .filter((file): file is File => Boolean(file));

        if (regularFiles.length > 0) {
          await uploadAdminMaterialImages(materialId, regularFiles, true);
        }

        if (selectedThumbnail?.file) {
          await uploadAdminMaterialThumbnail(materialId, selectedThumbnail.file, true);
        }

        const shouldRunRelationshipFallback = editingMaterialId
          ? true
          : !createResponseHasExpectedRelations(upsertPayload, formData);

        if (shouldRunRelationshipFallback) {
          await syncCategories(materialId, currentCategoryIds, formData.categoryIds);
          await syncTags(materialId, currentTagIds, formData.tagIds);
        }

        await fetchMaterials();

        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchMaterials, syncCategories, syncTags]
  );

  const toggleMaterialActive = useCallback(async (id: number): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      await toggleAdminMaterialActive(id, true);
      await fetchMaterials();
      return true;
    } catch (err) {
      setError(normalizeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchMaterials]);

  const setPage = useCallback(async (pageNumber: number) => {
    await fetchMaterials({
      pagination: {
        pageNumber,
        pageSize: lastRequestRef.current.pagination.pageSize,
      },
    });
  }, [fetchMaterials]);

  const setPageSize = useCallback(async (pageSize: number) => {
    await fetchMaterials({
      pagination: {
        pageNumber: 1,
        pageSize,
      },
    });
  }, [fetchMaterials]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      materials,
      loading,
      saving,
      detailLoading,
      error,
      pagination,
      fetchMaterials,
      fetchMaterialById,
      saveMaterial,
      toggleMaterialActive,
      setPage,
      setPageSize,
      clearError,
    }),
    [
      materials,
      loading,
      saving,
      detailLoading,
      error,
      pagination,
      fetchMaterials,
      fetchMaterialById,
      saveMaterial,
      toggleMaterialActive,
      setPage,
      setPageSize,
      clearError,
    ]
  );
};

export default useAdminMaterials;
