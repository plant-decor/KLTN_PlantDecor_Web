"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getConversations,
  startSupportConversation,
} from "@/lib/api/chatService";
import type { SupportConversationPayload } from "@/types/chat.types";

type UseCustomerSupportConversationsOptions = {
  enabled?: boolean;
};

export function useCustomerSupportConversations(
  options: UseCustomerSupportConversationsOptions = {},
) {
  const { enabled = true } = options;

  const [conversations, setConversations] = useState<
    SupportConversationPayload[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!enabled) {
      setConversations([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getConversations(false);
      setConversations(response.payload ?? []);
    } catch (err) {
      console.error("Load conversations failed:", err);
      setError("Không thể tải danh sách cuộc trò chuyện");
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const startNewConversation = useCallback(async (firstMessage: string) => {
    try {
      setIsStarting(true);
      setError(null);

      const response = await startSupportConversation({ firstMessage }, false);

      const createdConversation = response.payload;
      console.log("Created conversation:", createdConversation);
      if (!createdConversation) {
        throw new Error("Không nhận được dữ liệu cuộc trò chuyện mới");
      }

      setConversations((prev) => {
        const exists = prev.some((item) => item.id === createdConversation.id);
        if (exists) return prev;
        return [createdConversation, ...prev];
      });

      return createdConversation;
    } catch (err) {
      console.error("Start conversation failed:", err);
      setError("Không thể bắt đầu cuộc trò chuyện mới");
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const upsertConversation = useCallback(
    (conversation: SupportConversationPayload) => {
      setConversations((prev) => {
        const index = prev.findIndex((item) => item.id === conversation.id);

        if (index === -1) {
          return [conversation, ...prev];
        }

        const cloned = [...prev];
        cloned[index] = conversation;
        return cloned;
      });
    },
    [],
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    isLoading,
    isStarting,
    error,
    reloadConversations: loadConversations,
    startNewConversation,
    setConversations,
    upsertConversation,
  };
}
