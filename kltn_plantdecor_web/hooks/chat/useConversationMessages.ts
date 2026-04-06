"use client";

import { useCallback, useState } from "react";
import { getConversationMessages } from "@/lib/api/chatService";
import type {
  GetConversationMessagesParams,
  SupportConversationMessage,
} from "@/types/chat.types";

type UseConversationMessagesOptions = {
  pageSize?: number;
};

export function useConversationMessages(
  options: UseConversationMessagesOptions = {},
) {
  const { pageSize = 50 } = options;

  const [messages, setMessages] = useState<SupportConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(
    async (conversationId: number, params?: GetConversationMessagesParams) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getConversationMessages(
          conversationId,
          { pageNumber: 1, pageSize, ...params },
          false,
        );

        const fetched = response.payload?.messages ?? [];
        setMessages(fetched);
        return fetched;
      } catch (err) {
        console.error("Load messages failed:", err);
        setError("Không thể tải lịch sử tin nhắn");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize],
  );

  const appendMessage = useCallback((message: SupportConversationMessage) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    appendMessage,
    clearMessages,
    setMessages,
  };
}
