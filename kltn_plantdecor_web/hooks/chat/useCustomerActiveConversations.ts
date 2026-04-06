"use client";

import { useCallback, useEffect, useState } from "react";

import { getLatestActiveConversation } from "@/lib/api/chatService";
import type { SupportConversationPayload } from "@/types/chat.types";

interface UseLatestActiveConversationReturn {
  conversation: SupportConversationPayload | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useLatestActiveConversation(): UseLatestActiveConversationReturn {
  const [conversation, setConversation] =
    useState<SupportConversationPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getLatestActiveConversation(false);
      setConversation(response.payload ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load latest conversation.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { conversation, isLoading, error, reload };
}
