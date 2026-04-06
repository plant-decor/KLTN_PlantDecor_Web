"use client";

import { useCallback, useRef, useState } from "react";
import { getConversationDetails } from "@/lib/api/chatService";
import type { SupportConversationMessage } from "@/types/chat.types";

type UseConversationMessagesOptions = {
  pageSize?: number;
};

export function useConversationMessages(
  options: UseConversationMessagesOptions = {},
) {
  const { pageSize = 30 } = options;

  const [messages, setMessages] = useState<SupportConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const hasOlderMessages = currentPage < totalPages;

  // Keep conversationId in a ref so loadOlderMessages can access it
  const conversationIdRef = useRef<number | null>(null);

  const loadMessages = useCallback(
    async (conversationId: number) => {
      try {
        setIsLoading(true);
        setError(null);
        conversationIdRef.current = conversationId;

        const response = await getConversationDetails(
          conversationId,
          { pageNumber: 1, pageSize },
          false,
        );

        const payload = response.payload;
        const fetched = payload?.messages ?? [];
        setMessages(fetched);
        setCurrentPage(1);
        setTotalPages(payload?.totalPages ?? 1);
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

  const loadOlderMessages = useCallback(async () => {
    const conversationId = conversationIdRef.current;
    if (!conversationId || currentPage >= totalPages) return;

    const nextPage = currentPage + 1;
    try {
      setIsLoadingOlder(true);

      const response = await getConversationDetails(
        conversationId,
        { pageNumber: nextPage, pageSize },
        false,
      );

      const older = response.payload?.messages ?? [];
      if (older.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newOld = older.filter((m) => !existingIds.has(m.id));
          return [...newOld, ...prev];
        });
        setCurrentPage(nextPage);
        setTotalPages(response.payload?.totalPages ?? totalPages);
      }
    } catch (err) {
      console.error("Load older messages failed:", err);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [currentPage, totalPages, pageSize]);

  const appendMessage = useCallback((message: SupportConversationMessage) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentPage(1);
    setTotalPages(1);
    conversationIdRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    isLoadingOlder,
    hasOlderMessages,
    error,
    loadMessages,
    loadOlderMessages,
    appendMessage,
    clearMessages,
    setMessages,
  };
}
