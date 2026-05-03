"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  getAdminUserById,
  searchAdminUsers,
  toggleAdminUserActive,
} from "@/lib/api/adminUsersService";
import type { AdminUser, AdminUserSearchRequest } from "@/types/admin-user.types";

/** Cho phép pagination partial khi merge với request trước */
export type AdminUsersFetchParams = Omit<Partial<AdminUserSearchRequest>, "pagination"> & {
  pagination?: Partial<AdminUserSearchRequest["pagination"]>;
};

interface PaginationState {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface UseAdminUsersReturn {
  users: AdminUser[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: PaginationState;
  userDetail: AdminUser | null;
  detailLoading: boolean;
  fetchUsers: (params?: AdminUsersFetchParams) => Promise<void>;
  setPage: (pageNumber: number) => Promise<void>;
  setPageSize: (pageSize: number) => Promise<void>;
  loadUserDetail: (id: number) => Promise<AdminUser | null>;
  clearUserDetail: () => void;
  toggleUserActive: (id: number) => Promise<boolean>;
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

const cleanSearchRequest = (body: AdminUserSearchRequest): AdminUserSearchRequest => {
  const next: AdminUserSearchRequest = {
    pagination: { ...body.pagination },
  };

  const kw = body.keyword?.trim();
  if (kw) {
    next.keyword = kw;
  }
  if (body.role) {
    next.role = body.role;
  }
  if (body.status) {
    next.status = body.status;
  }
  if (body.isVerified !== undefined) {
    next.isVerified = body.isVerified;
  }
  if (body.nurseryId !== undefined) {
    next.nurseryId = body.nurseryId;
  }
  if (body.createdFrom) {
    next.createdFrom = body.createdFrom;
  }
  if (body.createdTo) {
    next.createdTo = body.createdTo;
  }

  return next;
};

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);
  const [userDetail, setUserDetail] = useState<AdminUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const lastRequestRef = useRef<AdminUserSearchRequest>({
    pagination: {
      pageNumber: defaultPagination.pageNumber,
      pageSize: defaultPagination.pageSize,
    },
  });

  const fetchUsers = useCallback(async (params?: AdminUsersFetchParams) => {
    setLoading(true);
    setError(null);

    const prev = lastRequestRef.current;
    const merged: AdminUserSearchRequest = {
      ...prev,
      ...params,
      pagination: {
        pageNumber: params?.pagination?.pageNumber ?? prev.pagination.pageNumber,
        pageSize: params?.pagination?.pageSize ?? prev.pagination.pageSize,
      },
    };

    const requestBody = cleanSearchRequest(merged);
    lastRequestRef.current = requestBody;

    try {
      const response = await searchAdminUsers(requestBody, true);
      const payload = getResponsePayload(response);

      if (!payload) {
        return;
      }

      setUsers(payload.items ?? []);
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

  const toggleUserActive = useCallback(
    async (id: number): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        await toggleAdminUserActive(id, true);
        await fetchUsers();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchUsers]
  );

  const loadUserDetail = useCallback(async (id: number): Promise<AdminUser | null> => {
    setDetailLoading(true);
    setError(null);

    try {
      const response = await getAdminUserById(id, true);
      const payload = getResponsePayload(response) ?? null;
      setUserDetail(payload);
      return payload;
    } catch (err) {
      setError(normalizeError(err));
      setUserDetail(null);
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const clearUserDetail = useCallback(() => {
    setUserDetail(null);
  }, []);

  const setPage = useCallback(
    async (pageNumber: number) => {
      await fetchUsers({
        pagination: {
          pageNumber,
          pageSize: lastRequestRef.current.pagination.pageSize,
        },
      });
    },
    [fetchUsers]
  );

  const setPageSize = useCallback(
    async (pageSize: number) => {
      await fetchUsers({
        pagination: {
          pageNumber: 1,
          pageSize,
        },
      });
    },
    [fetchUsers]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      users,
      loading,
      saving,
      error,
      pagination,
      userDetail,
      detailLoading,
      fetchUsers,
      setPage,
      setPageSize,
      loadUserDetail,
      clearUserDetail,
      toggleUserActive,
      clearError,
    }),
    [
      users,
      loading,
      saving,
      error,
      pagination,
      userDetail,
      detailLoading,
      fetchUsers,
      setPage,
      setPageSize,
      loadUserDetail,
      clearUserDetail,
      toggleUserActive,
      clearError,
    ]
  );
};

export default useAdminUsers;
