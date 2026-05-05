"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  createAdminPlantGuide,
  deleteAdminPlantGuide,
  fetchLightRequirementOptions,
  getAdminPlantGuideById,
  getAdminPlantGuides,
  updateAdminPlantGuide,
} from '@/lib/api/adminPlantGuidesService';
import type {
  AdminLightRequirementOption,
  AdminPlantGuideDetail,
  AdminPlantGuideFormData,
  AdminPlantGuideSearchRequest,
  AdminPlantGuideUpsertRequest,
} from '@/types/admin-plant-guide.types';

interface PaginationState {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface SavePlantGuideParams {
  formData: AdminPlantGuideFormData;
  editingId?: number;
}

interface UseAdminPlantGuidesReturn {
  plantGuides: AdminPlantGuideDetail[];
  loading: boolean;
  saving: boolean;
  detailLoading: boolean;
  error: string | null;
  detailError: string | null;
  enumLoading: boolean;
  enumError: string | null;
  pagination: PaginationState;
  lightRequirementOptions: AdminLightRequirementOption[];
  fetchPlantGuides: (params?: Partial<AdminPlantGuideSearchRequest>) => Promise<void>;
  fetchPlantGuideById: (id: number) => Promise<AdminPlantGuideDetail | null>;
  savePlantGuide: (params: SavePlantGuideParams) => Promise<boolean>;
  deletePlantGuide: (id: number) => Promise<boolean>;
  setPage: (pageNumber: number) => Promise<void>;
  setPageSize: (pageSize: number) => Promise<void>;
  loadLightRequirementOptions: () => Promise<void>;
  clearError: () => void;
  clearDetailError: () => void;
}

const defaultPagination: PaginationState = {
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
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

const getResponsePayload = <T,>(response: { data?: T; payload?: T }): T | undefined => {
  return response.payload ?? response.data;
};

const toNullableTrimmedString = (value: string): string => value.trim();

const normalizePageNumberFromApi = (apiPageNumber: number | undefined, requestedPageNumber: number): number => {
  if (typeof apiPageNumber !== 'number' || !Number.isFinite(apiPageNumber)) {
    return requestedPageNumber;
  }

  // Backend đôi khi trả pageNumber theo 0-based (0,1,2,...) trong khi UI dùng 1-based (1,2,3,...).
  // Heuristic an toàn: nếu apiPageNumber đúng bằng requestedPageNumber - 1 thì coi như 0-based và +1.
  if (apiPageNumber === requestedPageNumber - 1) {
    return apiPageNumber + 1;
  }

  return apiPageNumber;
};

/** Chỉ gộp field hợp lệ — tránh spread `params` làm lọt sortBy/sortDirection hoặc field lạ vào ref/request. */
const mergeAdminPlantGuideSearchRequest = (
  base: AdminPlantGuideSearchRequest,
  patch?: Partial<AdminPlantGuideSearchRequest>
): AdminPlantGuideSearchRequest => {
  const pageNumber = patch?.pagination?.pageNumber ?? base.pagination.pageNumber;
  const pageSize = patch?.pagination?.pageSize ?? base.pagination.pageSize;

  const next: AdminPlantGuideSearchRequest = {
    pagination: { pageNumber, pageSize },
  };

  const plantId = patch?.plantId !== undefined ? patch.plantId : base.plantId;
  if (plantId !== undefined && Number.isFinite(plantId)) {
    next.plantId = plantId;
  }

  const keyword = patch?.keyword !== undefined ? patch.keyword : base.keyword;
  if (keyword !== undefined && String(keyword).trim() !== '') {
    next.keyword = String(keyword).trim();
  }

  return next;
};

const toUpsertPayload = (formData: AdminPlantGuideFormData): AdminPlantGuideUpsertRequest => ({
  plantId: Number(formData.plantId),
  lightRequirement: toNullableTrimmedString(formData.lightRequirement),
  watering: toNullableTrimmedString(formData.watering),
  fertilizing: toNullableTrimmedString(formData.fertilizing),
  pruning: toNullableTrimmedString(formData.pruning),
  temperature: toNullableTrimmedString(formData.temperature),
  humidity: toNullableTrimmedString(formData.humidity),
  soil: toNullableTrimmedString(formData.soil),
  careNotes: toNullableTrimmedString(formData.careNotes),
});

export const useAdminPlantGuides = (): UseAdminPlantGuidesReturn => {
  const [plantGuides, setPlantGuides] = useState<AdminPlantGuideDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [enumLoading, setEnumLoading] = useState(false);
  const [enumError, setEnumError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);
  const [lightRequirementOptions, setLightRequirementOptions] = useState<AdminLightRequirementOption[]>([]);

  const lastRequestRef = useRef<AdminPlantGuideSearchRequest>({
    pagination: {
      pageNumber: defaultPagination.pageNumber,
      pageSize: defaultPagination.pageSize,
    },
  });

  const plantGuidesListRequestIdRef = useRef(0);

  const fetchPlantGuides = useCallback(async (params?: Partial<AdminPlantGuideSearchRequest>) => {
    const requestId = ++plantGuidesListRequestIdRef.current;
    setLoading(true);
    setError(null);

    const requestBody = mergeAdminPlantGuideSearchRequest(lastRequestRef.current, params);

    lastRequestRef.current = requestBody;

    try {
      const response = await getAdminPlantGuides(requestBody, true);
      if (requestId !== plantGuidesListRequestIdRef.current) {
        return;
      }

      const payload = getResponsePayload(response);

      if (!payload) {
        return;
      }

      setPlantGuides(payload.items ?? []);
      const requestedPageNumber = requestBody.pagination.pageNumber;
      setPagination({
        totalCount: payload.totalCount ?? 0,
        pageNumber: normalizePageNumberFromApi(payload.pageNumber, requestedPageNumber),
        pageSize: payload.pageSize ?? requestBody.pagination.pageSize,
        totalPages: payload.totalPages ?? 1,
        hasPrevious: payload.hasPrevious ?? false,
        hasNext: payload.hasNext ?? false,
      });
    } catch (err) {
      if (requestId === plantGuidesListRequestIdRef.current) {
        setError(normalizeError(err));
      }
    } finally {
      if (requestId === plantGuidesListRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const fetchPlantGuideById = useCallback(async (id: number): Promise<AdminPlantGuideDetail | null> => {
    setDetailLoading(true);
    setDetailError(null);

    try {
      const response = await getAdminPlantGuideById(id, true);
      return getResponsePayload(response) ?? null;
    } catch (err) {
      setDetailError(normalizeError(err));
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const savePlantGuide = useCallback(async ({ formData, editingId }: SavePlantGuideParams): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      const payload = toUpsertPayload(formData);

      if (editingId) {
        await updateAdminPlantGuide(editingId, payload, true);
      } else {
        await createAdminPlantGuide(payload, true);
      }

      await fetchPlantGuides();
      return true;
    } catch (err) {
      setError(normalizeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchPlantGuides]);

  const deletePlantGuide = useCallback(async (id: number): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      await deleteAdminPlantGuide(id, true);
      await fetchPlantGuides();
      return true;
    } catch (err) {
      setError(normalizeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchPlantGuides]);

  const setPage = useCallback(async (pageNumber: number) => {
    await fetchPlantGuides({
      pagination: {
        pageNumber,
        pageSize: lastRequestRef.current.pagination.pageSize,
      },
    });
  }, [fetchPlantGuides]);

  const setPageSize = useCallback(async (pageSize: number) => {
    await fetchPlantGuides({
      pagination: {
        pageNumber: 1,
        pageSize,
      },
    });
  }, [fetchPlantGuides]);

  const loadLightRequirementOptions = useCallback(async () => {
    setEnumLoading(true);
    setEnumError(null);

    try {
      const options = await fetchLightRequirementOptions(true);
      setLightRequirementOptions(options);
    } catch (err) {
      setEnumError(normalizeError(err));
    } finally {
      setEnumLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearDetailError = useCallback(() => {
    setDetailError(null);
  }, []);

  return useMemo(() => ({
    plantGuides,
    loading,
    saving,
    detailLoading,
    error,
    detailError,
    enumLoading,
    enumError,
    pagination,
    lightRequirementOptions,
    fetchPlantGuides,
    fetchPlantGuideById,
    savePlantGuide,
    deletePlantGuide,
    setPage,
    setPageSize,
    loadLightRequirementOptions,
    clearError,
    clearDetailError,
  }), [
    plantGuides,
    loading,
    saving,
    detailLoading,
    error,
    detailError,
    enumLoading,
    enumError,
    pagination,
    lightRequirementOptions,
    fetchPlantGuides,
    fetchPlantGuideById,
    savePlantGuide,
    deletePlantGuide,
    setPage,
    setPageSize,
    loadLightRequirementOptions,
    clearError,
    clearDetailError,
  ]);
};

export default useAdminPlantGuides;
