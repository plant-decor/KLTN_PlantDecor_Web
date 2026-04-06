"use client";

import { useCallback, useEffect, useState } from "react";
import {
  claimSupportConversation,
  getWaitingSupportConversations,
} from "@/lib/api/chatService";
import type { SupportConversationPayload } from "@/types/chat.types";

type UseWaitingSupportConversationsOptions = {
  enabled?: boolean;
};

export function useWaitingSupportConversations(
  options: UseWaitingSupportConversationsOptions = {},
) {
  const { enabled = true } = options;

  const [conversations, setConversations] = useState<
    SupportConversationPayload[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWaitingConversations = useCallback(async () => {
    if (!enabled) {
      setConversations([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getWaitingSupportConversations(false);
      setConversations(response.payload ?? []);
    } catch (err) {
      console.error("Load waiting conversations failed:", err);
      setError("Không thể tải danh sách cuộc trò chuyện chờ");
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const claimConversation = useCallback(async (conversationId: number) => {
    try {
      setIsClaiming(true);
      setError(null);

      await claimSupportConversation(conversationId, false);

      setConversations((prev) =>
        prev.filter((item) => item.id !== conversationId),
      );
    } catch (err) {
      console.error("Claim conversation failed:", err);
      setError("Không thể nhận cuộc trò chuyện");
      throw err;
    } finally {
      setIsClaiming(false);
    }
  }, []);

  const removeConversation = useCallback((conversationId: number) => {
    setConversations((prev) =>
      prev.filter((item) => item.id !== conversationId),
    );
  }, []);

  const addConversation = useCallback(
    (conversation: SupportConversationPayload) => {
      setConversations((prev) => {
        const exists = prev.some((item) => item.id === conversation.id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
    },
    [],
  );

  useEffect(() => {
    void loadWaitingConversations();
  }, [loadWaitingConversations]);

  return {
    conversations,
    isLoading,
    isClaiming,
    error,
    reloadConversations: loadWaitingConversations,
    claimConversation,
    removeConversation,
    addConversation,
    setConversations,
  };
}
