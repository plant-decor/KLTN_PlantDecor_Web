"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  createAdminNursery,
  searchAdminNurseries,
  toggleAdminNurseryActive,
  updateAdminNursery,
} from "@/lib/api/adminNurseriesService";
import type {
  AdminNursery,
  AdminNurseryFormData,
  AdminNurserySearchRequest,
  AdminNurseryUpsertRequest,
} from "@/types/admin-nursery.types";

interface PaginationState {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface SaveNurseryParams {
  formData: AdminNurseryFormData;
  editingNurseryId?: number;
}

interface UseAdminNurseriesReturn {
  nurseries: AdminNursery[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: PaginationState;
  fetchNurseries: (params?: Partial<AdminNurserySearchRequest>) => Promise<void>;
  saveNursery: (params: SaveNurseryParams) => Promise<boolean>;
  toggleNurseryActive: (id: number) => Promise<boolean>;
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
  if (!err || typeof err !== "object") {
    return "An error occurred";
  }

  const candidate = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || "An error occurred";
};

const toNullableNumber = (value: string): number | null => {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const toUpsertPayload = (formData: AdminNurseryFormData): AdminNurseryUpsertRequest => {
  return {
    name: formData.name.trim(),
    address: formData.address.trim(),
    area: toNullableNumber(formData.area),
    latitude: toNullableNumber(formData.latitude),
    longitude: toNullableNumber(formData.longitude),
    phone: formData.phone.trim(),
    isActive: Boolean(formData.isActive),
  };
};

export const useAdminNurseries = (): UseAdminNurseriesReturn => {
  const [nurseries, setNurseries] = useState<AdminNursery[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);

  const lastRequestRef = useRef<AdminNurserySearchRequest>({
    pagination: {
      pageNumber: defaultPagination.pageNumber,
      pageSize: defaultPagination.pageSize,
    },
  });

  const fetchNurseries = useCallback(async (params?: Partial<AdminNurserySearchRequest>) => {
    setLoading(true);
    setError(null);

    const requestBody: AdminNurserySearchRequest = {
      ...lastRequestRef.current,
      ...params,
      pagination: {
        pageNumber: params?.pagination?.pageNumber ?? lastRequestRef.current.pagination.pageNumber,
        pageSize: params?.pagination?.pageSize ?? lastRequestRef.current.pagination.pageSize,
      },
    };

    lastRequestRef.current = requestBody;

    try {
      const response = await searchAdminNurseries(requestBody, true);
      const payload = getResponsePayload(response);

      if (!payload) {
        return;
      }

      setNurseries(payload.items ?? []);
      setPagination({
        totalCount: payload.totalCount ?? 0,
        pageNumber: payload.pageNumber ?? requestBody.pagination.pageNumber,
        pageSize: payload.pageSize ?? requestBody.pagination.pageSize,
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

  const saveNursery = useCallback(
    async ({ formData, editingNurseryId }: SaveNurseryParams): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        const payload = toUpsertPayload(formData);

        if (editingNurseryId) {
          await updateAdminNursery(editingNurseryId, payload, true);
        } else {
          await createAdminNursery(payload, true);
        }

        await fetchNurseries();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchNurseries]
  );

  const toggleNurseryActive = useCallback(
    async (id: number): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        await toggleAdminNurseryActive(id, true);
        await fetchNurseries();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchNurseries]
  );

  const setPage = useCallback(
    async (pageNumber: number) => {
      await fetchNurseries({
        pagination: {
          pageNumber,
          pageSize: lastRequestRef.current.pagination.pageSize,
        },
      });
    },
    [fetchNurseries]
  );

  const setPageSize = useCallback(
    async (pageSize: number) => {
      await fetchNurseries({
        pagination: {
          pageNumber: 1,
          pageSize,
        },
      });
    },
    [fetchNurseries]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      nurseries,
      loading,
      saving,
      error,
      pagination,
      fetchNurseries,
      saveNursery,
      toggleNurseryActive,
      setPage,
      setPageSize,
      clearError,
    }),
    [
      nurseries,
      loading,
      saving,
      error,
      pagination,
      fetchNurseries,
      saveNursery,
      toggleNurseryActive,
      setPage,
      setPageSize,
      clearError,
    ]
  );
};

export default useAdminNurseries;
