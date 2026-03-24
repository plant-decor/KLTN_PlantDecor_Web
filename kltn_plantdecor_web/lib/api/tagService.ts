"use client";
import { Tag } from '@/data/storeCatalogData';
import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';

// ============ Types ============
export interface TagCreateUpdateRequest {
  name: string;
  color: string;
}


export interface TagsListResponse {
  items: Tag[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface GetTagsParams {
  pageNumber?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
}

// ============ API Calls ============

/**
 * GET /api/admin/Tags
 * Get list of tags with pagination
 */
export const getTags = async (
  params?: GetTagsParams,
  loading = true
): Promise<ResponseModel<TagsListResponse>> => {
  return apiClient.get('/admin/Tags', params, loading);
};

/**
 * POST /api/admin/Tags
 * Create a new tag
 */
export const createTag = async (
  data: TagCreateUpdateRequest,
  loading = true
): Promise<ResponseModel<Tag>> => {
  return apiClient.post('/admin/Tags', data, loading);
};

/**
 * GET /api/admin/Tags/{id}
 * Get tag by ID
 */
export const getTagById = async (
  id: number,
  loading = true
): Promise<ResponseModel<Tag>> => {
  return apiClient.get(`/admin/Tags/${id}`, undefined, loading);
};

/**
 * PATCH /api/admin/Tags/{id}
 * Update tag
 */
export const updateTag = async (
  id: number,
  data: TagCreateUpdateRequest,
  loading = true
): Promise<ResponseModel<Tag>> => {
  return apiClient.patch(`/admin/Tags/${id}`, data, loading);
};

/**
 * DELETE /api/admin/Tags/{id}
 * Delete a tag
 */
export const deleteTag = async (
  id: number,
  loading = true
): Promise<ResponseModel<void>> => {
  return apiClient.del(`/admin/Tags/${id}`, loading);
};
