"use client";
import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';

// ============ Types ============
export interface CategoryCreateUpdateRequest {
  name: string;
  parentCategoryId?: number | null;
  isActive: boolean;
  categoryType: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  parentCategoryId?: number | null;
  parentCategoryName?: string | null;
  isActive: boolean;
  categoryType: number;
  categoryTypeName?: string;
  createdAt?: string;
  updatedAt?: string;
  subCategories?: CategoryResponse[];
}

export interface CategoryTreeNode extends CategoryResponse {
  children?: CategoryTreeNode[];
}

export interface CategoriesListResponse {
  items: CategoryResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface GetCategoriesParams {
  pageNumber?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
}

// ============ API Calls ============

/**
 * GET /api/admin/Categories
 * Get list of categories with pagination
 */
export const getCategories = async (
  params?: GetCategoriesParams,
  loading = true
): Promise<ResponseModel<CategoriesListResponse>> => {
  return apiClient.get('/admin/Categories', params, loading);
};

/**
 * POST /api/admin/Categories
 * Create a new category
 */
export const createCategory = async (
  data: CategoryCreateUpdateRequest,
  loading = true
): Promise<ResponseModel<CategoryResponse>> => {
  return apiClient.post('/admin/Categories', data, loading);
};

/**
 * GET /api/admin/Categories/admin/tree
 * Get category tree (admin view)
 */
export const getCategoryTreeAdmin = async (
  loading = true
): Promise<ResponseModel<CategoryTreeNode[]>> => {
  return apiClient.get('/admin/Categories/admin/tree', loading);
};

/**
 * GET /api/admin/Categories/tree
 * Get category tree (regular view)
 */
export const getCategoryTree = async (
  loading = true
): Promise<ResponseModel<CategoryTreeNode[]>> => {
  return apiClient.get('/admin/Categories/tree', loading);
};

/**
 * GET /api/admin/Categories/{id}
 * Get category by ID
 */
export const getCategoryById = async (
  id: number,
  loading = true
): Promise<ResponseModel<CategoryResponse>> => {
  return apiClient.get(`/admin/Categories/${id}`, undefined, loading);
};

/**
 * PATCH /api/admin/Categories/{id}
 * Update category
 */
export const updateCategory = async (
  id: number,
  data: CategoryCreateUpdateRequest,
  loading = true
): Promise<ResponseModel<CategoryResponse>> => {
  return apiClient.patch(`/admin/Categories/${id}`, data, loading);
};

/**
 * PATCH /api/admin/Categories/{id}/toggle-active
 * Toggle category active status
 */
export const toggleCategoryActive = async (
  id: number,
  loading = true
): Promise<ResponseModel<CategoryResponse>> => {
  return apiClient.patch(`/admin/Categories/${id}/toggle-active`, undefined, loading);
};

/**
 * DELETE /api/admin/Categories/{id}
 * Delete a category
 */
export const deleteCategory = async (
  id: number,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.del(`/admin/Categories/${id}`, loading);
};
