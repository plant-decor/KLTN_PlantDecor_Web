"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type { ResponseModel } from "@/types/api.types";

// ============ Types ============
export interface DepositPolicy {
  id: number;
  minPrice: number;
  maxPrice: number | null;
  depositPercentage: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepositPolicyUpsertRequest {
  minPrice: number;
  maxPrice: number | null;
  depositPercentage: number;
  isActive: boolean;
}

// ============ API Calls ============

/**
 * GET /api/admin/deposit-policies
 * Get all deposit policies
 */
export const getDepositPolicies = async (loading = true): Promise<ResponseModel<DepositPolicy[]>> => {
  return apiClient.get("/admin/deposit-policies", undefined, loading);
};

/**
 * GET /api/admin/deposit-policies/{id}
 * Get deposit policy by ID
 */
export const getDepositPolicyById = async (id: number, loading = true): Promise<ResponseModel<DepositPolicy>> => {
  return apiClient.get(`/admin/deposit-policies/${id}`, undefined, loading);
};

/**
 * POST /api/admin/deposit-policies
 * Create a new deposit policy
 */
export const createDepositPolicy = async (
  data: DepositPolicyUpsertRequest,
  loading = true
): Promise<ResponseModel<DepositPolicy>> => {
  return apiClient.post("/admin/deposit-policies", data, loading);
};

/**
 * PUT /api/admin/deposit-policies/{id}
 * Update an existing deposit policy
 */
export const updateDepositPolicy = async (
  id: number,
  data: DepositPolicyUpsertRequest,
  loading = true
): Promise<ResponseModel<DepositPolicy>> => {
  return apiClient.put(`/admin/deposit-policies/${id}`, data, loading);
};

/**
 * DELETE /api/admin/deposit-policies/{id}
 * Delete a deposit policy
 */
export const deleteDepositPolicy = async (id: number, loading = true): Promise<ResponseModel<void>> => {
  return apiClient.del(`/admin/deposit-policies/${id}`, loading);
};

