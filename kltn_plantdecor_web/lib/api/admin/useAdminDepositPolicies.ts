"use client";

import { useCallback, useRef, useState } from "react";
import {
  createDepositPolicy,
  deleteDepositPolicy,
  getDepositPolicies,
  getDepositPolicyById,
  updateDepositPolicy,
  type DepositPolicy,
  type DepositPolicyUpsertRequest,
} from "@/lib/api/depositPolicyService";

interface UseAdminDepositPoliciesReturn {
  policies: DepositPolicy[];
  loading: boolean;
  error: string | null;

  fetchPolicies: () => Promise<void>;
  fetchPolicyById: (id: number) => Promise<DepositPolicy | null>;
  addPolicy: (data: DepositPolicyUpsertRequest) => Promise<DepositPolicy | null>;
  updatePolicyItem: (id: number, data: DepositPolicyUpsertRequest) => Promise<DepositPolicy | null>;
  deletePolicy: (id: number) => Promise<boolean>;
  clearError: () => void;
}

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

export const useAdminDepositPolicies = (): UseAdminDepositPoliciesReturn => {
  const [policies, setPolicies] = useState<DepositPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchAtRef = useRef<number | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDepositPolicies(true);
      const payload = getResponsePayload<DepositPolicy[]>(response) ?? [];
      setPolicies(Array.isArray(payload) ? payload : []);
      lastFetchAtRef.current = Date.now();
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPolicyById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDepositPolicyById(id, true);
      return getResponsePayload<DepositPolicy>(response) ?? null;
    } catch (err) {
      setError(normalizeError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addPolicy = useCallback(
    async (data: DepositPolicyUpsertRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await createDepositPolicy(data, true);
        const payload = getResponsePayload<DepositPolicy>(response);
        await fetchPolicies();
        return payload ?? null;
      } catch (err) {
        setError(normalizeError(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchPolicies]
  );

  const updatePolicyItem = useCallback(
    async (id: number, data: DepositPolicyUpsertRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await updateDepositPolicy(id, data, true);
        const payload = getResponsePayload<DepositPolicy>(response);
        await fetchPolicies();
        return payload ?? null;
      } catch (err) {
        setError(normalizeError(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchPolicies]
  );

  const deletePolicy = useCallback(
    async (id: number): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await deleteDepositPolicy(id, true);
        await fetchPolicies();
        return true;
      } catch (err) {
        setError(normalizeError(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPolicies]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    policies,
    loading,
    error,
    fetchPolicies,
    fetchPolicyById,
    addPolicy,
    updatePolicyItem,
    deletePolicy,
    clearError,
  };
};

export default useAdminDepositPolicies;

