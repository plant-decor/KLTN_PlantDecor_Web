"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";

// ============ Types ============
export interface PolicyContent {
  id: number;
  title: string;
  category: number;
  content: string;
  summary: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyContentUpsertRequest {
  title: string;
  category: number;
  content: string;
  summary: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PolicyContentStatusRequest {
  isActive: boolean;
}

// ============ Public API Calls ============

/**
 * GET /api/policy-contents
 * Get all active policy contents (public).
 */
export const getActivePolicyContents = async (
  loading = true
): Promise<ResponseModel<PolicyContent[]>> => {
  return apiClient.get("/policy-contents", undefined, loading);
};

/**
 * GET /api/policy-contents/{id}
 * Get a single active policy content (public).
 */
export const getPolicyContentById = async (
  id: number,
  loading = true
): Promise<ResponseModel<PolicyContent>> => {
  return apiClient.get(`/policy-contents/${id}`, undefined, loading);
};

/**
 * GET /api/policy-contents/categories/{category}
 * Get active policy contents by category (public).
 */
export const getPolicyContentsByCategory = async (
  category: number,
  loading = true
): Promise<ResponseModel<PolicyContent[]>> => {
  return apiClient.get(`/policy-contents/categories/${category}`, undefined, loading);
};

// ============ Admin API Calls ============

/**
 * GET /api/policy-contents/admin/all
 * Get all policy contents (admin), optionally including inactive.
 */
export const getAdminPolicyContents = async (
  includeInactive?: boolean,
  loading = true
): Promise<ResponseModel<PolicyContent[]>> => {
  const params = includeInactive == null ? undefined : { includeInactive };
  return apiClient.get("/policy-contents/admin/all", params, loading);
};

/**
 * POST /api/policy-contents
 * Create a new policy content (admin).
 */
export const createPolicyContent = async (
  data: PolicyContentUpsertRequest,
  loading = true
): Promise<ResponseModel<PolicyContent>> => {
  return apiClient.post("/policy-contents", data, loading);
};

/**
 * PUT /api/policy-contents/{id}
 * Update an existing policy content (admin).
 */
export const updatePolicyContent = async (
  id: number,
  data: PolicyContentUpsertRequest,
  loading = true
): Promise<ResponseModel<PolicyContent>> => {
  return apiClient.put(`/policy-contents/${id}`, data, loading);
};

/**
 * PATCH /api/policy-contents/{id}/status
 * Activate / deactivate a policy content (admin).
 */
export const updatePolicyContentStatus = async (
  id: number,
  isActive: boolean,
  loading = true
): Promise<ResponseModel<PolicyContent>> => {
  const body: PolicyContentStatusRequest = { isActive };
  return apiClient.patch(`/policy-contents/${id}/status`, body, loading);
};
