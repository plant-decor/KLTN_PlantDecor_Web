"use client";
import { useState, useCallback, useRef } from 'react';
import {
  createCategory,
  getCategoryTreeAdmin,
  getCategoryById,
  updateCategory,
  toggleCategoryActive,
  deleteCategory,
  type CategoryCreateUpdateRequest,
  type CategoryResponse,
  type GetCategoriesParams,
  type CategoryTreeNode,
} from '../categoriesService';

// ============ Types ============
interface UseAdminCategoriesReturn {
  categories: CategoryResponse[];
  categoryTree: CategoryTreeNode[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;

  // Data fetching
  fetchCategoryTree: () => Promise<void>;
  fetchCategoryById: (id: number) => Promise<CategoryResponse | null>;

  // CRUD operations
  addCategory: (data: CategoryCreateUpdateRequest) => Promise<CategoryResponse | null>;
  updateCategoryItem: (id: number, data: CategoryCreateUpdateRequest) => Promise<CategoryResponse | null>;
  deleteCategory: (id: number) => Promise<boolean>;
  toggleActive: (id: number) => Promise<CategoryResponse | null>;

  // Tree utilities
  flattenTree: (nodes: CategoryResponse[]) => CategoryResponse[];
  findNodeInTree: (nodes: CategoryResponse[], id: number) => CategoryResponse | null;
  toggleNodeInTree: (nodes: CategoryResponse[], id: number, incoming?: CategoryResponse) => CategoryResponse[];
  updateNodeInTree: (nodes: CategoryResponse[], id: number, updates: Partial<CategoryResponse>) => CategoryResponse[];

  // Error handling
  clearError: () => void;
}

// ============ Hook Implementation ============
export const useAdminCategories = (): UseAdminCategoriesReturn => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const lastFetchParamsRef = useRef<GetCategoriesParams>({ pageNumber: 1, pageSize: 10 });

  // ============ Helper Functions ============
  const getResponsePayload = <T,>(response: { data?: T; payload?: T }): T | undefined => {
    return response.payload ?? response.data;
  };

  const handleError = (err: any) => {
    const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred';
    setError(errorMessage);
    console.error('Admin categories error:', err);
  };

  // ============ Tree Utilities ============

  /**
   * Flatten category tree into a flat list
   */
  const flattenTree = useCallback((nodes: CategoryResponse[]): CategoryResponse[] => {
    const flat: CategoryResponse[] = [];

    const walk = (items: CategoryResponse[]) => {
      items.forEach((node) => {
        flat.push(node);

        if (Array.isArray(node.subCategories) && node.subCategories.length > 0) {
          walk(node.subCategories);
        }
      });
    };

    walk(nodes);
    return flat;
  }, []);

  /**
   * Find a node in the tree by ID
   */
  const findNodeInTree = useCallback((nodes: CategoryResponse[], id: number): CategoryResponse | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }

      if (Array.isArray(node.subCategories) && node.subCategories.length > 0) {
        const found = findNodeInTree(node.subCategories, id);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }, []);

  /**
   * Toggle isActive status of a node in the tree
   */
  const toggleNodeInTree = useCallback(
    (nodes: CategoryResponse[], id: number, incoming?: CategoryResponse): CategoryResponse[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          const mergedNode = incoming
            ? { ...node, ...incoming, subCategories: incoming.subCategories ?? node.subCategories }
            : node;

          return {
            ...mergedNode,
            isActive: !node.isActive,
          };
        }

        if (Array.isArray(node.subCategories) && node.subCategories.length > 0) {
          return {
            ...node,
            subCategories: toggleNodeInTree(node.subCategories, id, incoming),
          };
        }

        return node;
      });
    },
    []
  );

  /**
   * Update a node in the tree recursively
   */
  const updateNodeInTree = useCallback(
    (nodes: CategoryResponse[], id: number, updates: Partial<CategoryResponse>): CategoryResponse[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            ...updates,
            subCategories: updates.subCategories ?? node.subCategories,
          };
        }

        if (Array.isArray(node.subCategories) && node.subCategories.length > 0) {
          return {
            ...node,
            subCategories: updateNodeInTree(node.subCategories, id, updates),
          };
        }

        return node;
      });
    },
    []
  );

  // ============ Data Fetching ============

  /**
   * Fetch category tree and optionally paginate flattened results
   */
  const fetchCategories = useCallback(async (params?: GetCategoriesParams) => {
    setLoading(true);
    setError(null);

    try {
      const effectiveParams: GetCategoriesParams = {
        pageNumber: params?.pageNumber ?? lastFetchParamsRef.current.pageNumber ?? 1,
        pageSize: params?.pageSize ?? lastFetchParamsRef.current.pageSize ?? 10,
        skip: params?.skip,
        take: params?.take,
      };
      lastFetchParamsRef.current = effectiveParams;

      const response = await getCategoryTreeAdmin(true);
      const payload = getResponsePayload<CategoryTreeNode[]>(response);

      if (!payload) {
        return;
      }

      setCategoryTree(payload);

      const flattened = flattenTree(payload);
      const requestedPageNumber = effectiveParams.pageNumber ?? 1;
      const requestedPageSize = effectiveParams.pageSize ?? 10;
      const calculatedTotalCount = flattened.length;
      const calculatedTotalPages = Math.max(1, Math.ceil(calculatedTotalCount / requestedPageSize));
      const normalizedPageNumber = Math.min(Math.max(1, requestedPageNumber), calculatedTotalPages);
      const start = (normalizedPageNumber - 1) * requestedPageSize;
      const end = start + requestedPageSize;

      setCategories(flattened.slice(start, end));
      setTotalCount(calculatedTotalCount);
      setPageNumber(normalizedPageNumber);
      setPageSize(requestedPageSize);
      setTotalPages(calculatedTotalPages);
      setHasPrevious(normalizedPageNumber > 1);
      setHasNext(normalizedPageNumber < calculatedTotalPages);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [flattenTree]);

  /**
   * Fetch category tree (admin view)
   */
  const fetchCategoryTree = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCategoryTreeAdmin(true);
      const payload = getResponsePayload<CategoryTreeNode[]>(response);

      if (payload) {
        setCategoryTree(payload);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch category by ID
   */
  const fetchCategoryById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCategoryById(id, false);
      return getResponsePayload<CategoryResponse>(response) || null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ CRUD Operations ============

  /**
   * Create a new category
   */
  const addCategory = useCallback(async (data: CategoryCreateUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createCategory(data, true);
      const payload = getResponsePayload<CategoryResponse>(response);

      if (payload) {
        await fetchCategories(lastFetchParamsRef.current);
        return payload;
      }

      return null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  /**
   * Update an existing category
   */
  const updateCategoryItem = useCallback(
    async (id: number, data: CategoryCreateUpdateRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await updateCategory(id, data, false);
        const payload = getResponsePayload<CategoryResponse>(response);

        if (payload) {
          await fetchCategories(lastFetchParamsRef.current);
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
    [fetchCategories]
  );

  /**
   * Delete a category
   */
  const deleteCategoryItem = useCallback(
    async (id: number): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await deleteCategory(id, false);
        await fetchCategories(lastFetchParamsRef.current);
        return true;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories]
  );

  /**
   * Toggle category active status
   */
  const toggleActive = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await toggleCategoryActive(id, false);
      const payload = getResponsePayload<CategoryResponse>(response);

      setCategories((prev) =>
        prev.map((category) => {
          if (category.id !== id) {
            return category;
          }

          const merged = payload
            ? { ...category, ...payload, subCategories: payload.subCategories ?? category.subCategories }
            : category;

          return {
            ...merged,
            isActive: !category.isActive,
          };
        })
      );

      setCategoryTree((prev) => toggleNodeInTree(prev, id, payload) as CategoryTreeNode[]);

      return payload || null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toggleNodeInTree]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============ Return Hook Interface ============
  return {
    categories,
    categoryTree,
    loading,
    error,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasPrevious,
    hasNext,

    // Data fetching
    fetchCategoryTree,
    fetchCategoryById,

    // CRUD operations
    addCategory,
    updateCategoryItem,
    deleteCategory: deleteCategoryItem,
    toggleActive,

    // Tree utilities
    flattenTree,
    findNodeInTree,
    toggleNodeInTree,
    updateNodeInTree,

    // Error handling
    clearError,
  };
};

// Export aliases
export const useCategories = useAdminCategories;
export default useAdminCategories;
