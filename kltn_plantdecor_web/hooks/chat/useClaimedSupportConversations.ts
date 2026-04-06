"use client";

import { useCallback, useEffect, useState } from "react";
import {
  closeSupportConversation,
  getMyClaimedSupportConversations,
} from "@/lib/api/chatService";
import type { SupportConversationPayload } from "@/types/chat.types";

type UseClaimedSupportConversationsOptions = {
  enabled?: boolean;
};

export function useClaimedSupportConversations(
  options: UseClaimedSupportConversationsOptions = {},
) {
  const { enabled = true } = options;

  const [conversations, setConversations] = useState<
    SupportConversationPayload[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClaimedConversations = useCallback(async () => {
    if (!enabled) {
      setConversations([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getMyClaimedSupportConversations(false);
      setConversations(response.payload ?? []);
    } catch (err) {
      console.error("Load claimed conversations failed:", err);
      setError("Không thể tải danh sách cuộc trò chuyện đã nhận");
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const closeConversation = useCallback(async (conversationId: number) => {
    try {
      setIsClosing(true);
      setError(null);

      await closeSupportConversation(conversationId, false);

      setConversations((prev) =>
        prev.filter((item) => item.id !== conversationId),
      );
    } catch (err) {
      console.error("Close conversation failed:", err);
      setError("Không thể đóng cuộc trò chuyện");
      throw err;
    } finally {
      setIsClosing(false);
    }
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

  const upsertConversation = useCallback(
    (conversation: SupportConversationPayload) => {
      setConversations((prev) => {
        const index = prev.findIndex((item) => item.id === conversation.id);
        if (index === -1) return [conversation, ...prev];
        const cloned = [...prev];
        cloned[index] = conversation;
        return cloned;
      });
    },
    [],
  );

  useEffect(() => {
    void loadClaimedConversations();
  }, [loadClaimedConversations]);

  return {
    conversations,
    isLoading,
    isClosing,
    error,
    reloadConversations: loadClaimedConversations,
    closeConversation,
    addConversation,
    upsertConversation,
    setConversations,
  };
}
