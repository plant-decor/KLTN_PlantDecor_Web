"use client";
import { useState, useCallback, useRef } from 'react';
import {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
  type TagCreateUpdateRequest,
  type GetTagsParams,
  type TagsListResponse,
} from '../tagService';
import { Tag } from '@/data/storeCatalogData';

// ============ Types ============
interface UseAdminTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;

  // Data fetching
  fetchTags: (params?: GetTagsParams) => Promise<void>;
  fetchTagById: (id: number) => Promise<Tag | null>;

  // CRUD operations
  addTag: (data: TagCreateUpdateRequest) => Promise<Tag | null>;
  updateTagItem: (id: number, data: TagCreateUpdateRequest) => Promise<Tag | null>;
  deleteTag: (id: number) => Promise<boolean>;

  // Pagination
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Error handling
  clearError: () => void;
}

// ============ Hook Implementation ============
export const useAdminTags = (): UseAdminTagsReturn => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const lastFetchParamsRef = useRef<GetTagsParams>({ pageNumber: 1, pageSize: 10 });

  // ============ Helper Functions ============
  const getResponsePayload = <T,>(response: { data?: T; payload?: T }): T | undefined => {
    return response.payload ?? response.data;
  };

  const handleError = (err: any) => {
    const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred';
    setError(errorMessage);
    console.error('Admin tags error:', err);
  };

  // ============ Data Fetching ============

  /**
   * Fetch tags with pagination
   */
  const fetchTagsList = useCallback(async (params?: GetTagsParams) => {
    setLoading(true);
    setError(null);

    try {
      const effectiveParams: GetTagsParams = {
        pageNumber: params?.pageNumber ?? lastFetchParamsRef.current.pageNumber ?? 1,
        pageSize: params?.pageSize ?? lastFetchParamsRef.current.pageSize ?? 10,
        skip: params?.skip,
        take: params?.take,
      };
      lastFetchParamsRef.current = effectiveParams;

      const response = await getTags(effectiveParams, true);
      const payload = getResponsePayload<TagsListResponse>(response);

      if (!payload) {
        return;
      }

      setTags(payload.items || []);
      setTotalCount(payload.totalCount || 0);
      setPageNumber(payload.pageNumber || 1);
      setPageSize(payload.pageSize || 10);
      setTotalPages(payload.totalPages || 1);
      setHasPrevious(payload.hasPrevious || false);
      setHasNext(payload.hasNext || false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch tag by ID
   */
  const fetchTagById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getTagById(id, false);
      return getResponsePayload<Tag>(response) || null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ CRUD Operations ============

  /**
   * Create a new tag
   */
  const addTag = useCallback(async (data: TagCreateUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createTag(data, true);
      const payload = getResponsePayload<Tag>(response);

      if (payload) {
        await fetchTagsList(lastFetchParamsRef.current);
        return payload;
      }

      return null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTagsList]);

  /**
   * Update an existing tag
   */
  const updateTagItem = useCallback(
    async (id: number, data: TagCreateUpdateRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await updateTag(id, data, false);
        const payload = getResponsePayload<Tag>(response);

        if (payload) {
          await fetchTagsList(lastFetchParamsRef.current);
          return payload;
        }

        return null;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchTagsList]
  );

  /**
   * Delete a tag
   */
  const deleteTagItem = useCallback(
    async (id: number): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await deleteTag(id, false);
        await fetchTagsList(lastFetchParamsRef.current);
        return true;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchTagsList]
  );

  // ============ Pagination Utilities ============

  /**
   * Set current page
   */
  const setPage = useCallback((page: number) => {
    setPageNumber(page);
    fetchTagsList({ ...lastFetchParamsRef.current, pageNumber: page });
  }, [fetchTagsList]);

  /**
   * Set page size
   */
  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setPageNumber(1);
    fetchTagsList({ ...lastFetchParamsRef.current, pageNumber: 1, pageSize: size });
  }, [fetchTagsList]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============ Return Hook Interface ============
  return {
    tags,
    loading,
    error,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasPrevious,
    hasNext,

    // Data fetching
    fetchTags: fetchTagsList,
    fetchTagById,

    // CRUD operations
    addTag,
    updateTagItem,
    deleteTag: deleteTagItem,

    // Pagination
    setPage,
    setPageSize: setPageSizeHandler,

    // Error handling
    clearError,
  };
};

// Export aliases
export const useTags = useAdminTags;
export default useAdminTags;
