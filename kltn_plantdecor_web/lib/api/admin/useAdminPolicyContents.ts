"use client";

import { useCallback, useRef, useState } from "react";
import {
  createPolicyContent,
  getAdminPolicyContents,
  updatePolicyContent,
  updatePolicyContentStatus,
  type PolicyContent,
  type PolicyContentUpsertRequest,
} from "@/lib/api/policyContentService";

interface UseAdminPolicyContentsReturn {
  policies: PolicyContent[];
  loading: boolean;
  error: string | null;

  fetchPolicies: (includeInactive?: boolean) => Promise<void>;
  addPolicy: (data: PolicyContentUpsertRequest) => Promise<PolicyContent | null>;
  updatePolicyItem: (
    id: number,
    data: PolicyContentUpsertRequest
  ) => Promise<PolicyContent | null>;
  togglePolicyStatus: (id: number, isActive: boolean) => Promise<PolicyContent | null>;
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

export const useAdminPolicyContents = (): UseAdminPolicyContentsReturn => {
  const [policies, setPolicies] = useState<PolicyContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const includeInactiveRef = useRef<boolean | undefined>(undefined);

  const fetchPolicies = useCallback(async (includeInactive?: boolean) => {
    setLoading(true);
    setError(null);

    if (includeInactive !== undefined) {
      includeInactiveRef.current = includeInactive;
    }

    try {
      const response = await getAdminPolicyContents(includeInactiveRef.current, true);
      const payload = getResponsePayload<PolicyContent[]>(response) ?? [];
      setPolicies(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addPolicy = useCallback(
    async (data: PolicyContentUpsertRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await createPolicyContent(data, true);
        const payload = getResponsePayload<PolicyContent>(response);
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
    async (id: number, data: PolicyContentUpsertRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await updatePolicyContent(id, data, true);
        const payload = getResponsePayload<PolicyContent>(response);
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

  const togglePolicyStatus = useCallback(
    async (id: number, isActive: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const response = await updatePolicyContentStatus(id, isActive, true);
        const payload = getResponsePayload<PolicyContent>(response);
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    policies,
    loading,
    error,
    fetchPolicies,
    addPolicy,
    updatePolicyItem,
    togglePolicyStatus,
    clearError,
  };
};

export default useAdminPolicyContents;
